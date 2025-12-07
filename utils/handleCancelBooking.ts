import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { Alert } from "react-native";
import { db } from "../Services/firebaseConfig";
import { logError } from "../utils/logger";

export const normalizeTime = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export type CancelBookingOptions = {
  bookingId?: string;
  bookingData?: any;
  cancelledBy?: "empleado" | "usuario";
  onAfterCancel?: () => void;
  updateLocalState?: (id: string) => void;
};

export const handleCancelBooking = async ({
  bookingId,
  bookingData,
  cancelledBy = "usuario",
  onAfterCancel,
  updateLocalState,
}: CancelBookingOptions) => {
  try {
    // 1️⃣ Get booking details if not provided
    let booking: any = bookingData;
    if (!booking && bookingId) {
      const bookingRef = doc(db, "bookings", bookingId);
      const bookingSnap = await getDoc(bookingRef);
      if (!bookingSnap.exists()) {
        Alert.alert("Error", "No se encontró la cita.");
        return;
      }
      booking = { id: bookingId, ...bookingSnap.data() };
    }

    if (!booking) {
      Alert.alert("Error", "Datos de la cita no disponibles.");
      return;
    }

    const isoDate = booking.date.split("T")[0]; // YYYY-MM-DD
    const stylistId = booking.stylistId;
    const bookingAutonumber = booking.autoNumber;
    const startTime = normalizeTime(booking.time);
    const durationHours = Number(booking.duration) || 1;

    const bookingRef = doc(db, "bookings", booking.id || bookingId!);

    // 2️⃣ Update booking status
    await updateDoc(bookingRef, {
      status: "Cancelado",
      cancelledAt: new Date().toISOString(),
      cancelledBy,
    });

    // 3️⃣ Free up stylist availability
    const availabilityRef = doc(db, "users", stylistId, "availability", isoDate);
    const availabilitySnap = await getDoc(availabilityRef);
    if (availabilitySnap.exists()) {
      const availabilityData = availabilitySnap.data();
      let slots: any[] = availabilityData.timeSlots || [];

      const [hour, minute] = startTime.split(":").map(Number);
      const requiredTimes = Array.from({ length: durationHours }, (_, i) => {
        const h = hour + i;
        return `${String(h).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      });

      slots = slots.map((s) => {
        if (requiredTimes.includes(normalizeTime(s.time)) && s.bookingId === booking.id) {
          return { ...s, booked: false, bookingId: null, status: null };
        }
        return s;
      });

      await setDoc(availabilityRef, { ...availabilityData, timeSlots: slots });
    }

    // 4️⃣ Update local state if provided
    if (updateLocalState) {
      updateLocalState(booking.id);
    }

    // 5️⃣ Success message
    Alert.alert("Éxito", "La cita fue cancelada y los horarios liberados.");

    // 6️⃣ Send cancellation email via Cloud Function
    try {
      const functions = getFunctions();
      const sendGuestEmail = httpsCallable(functions, "sendGuestEmail");

      await sendGuestEmail({
        to: booking.email,
        subject: "Cancelación de tu cita en Sovrano",
        text: `Hola ${booking.guestName}, tu cita para ${booking.service} el ${isoDate} a las ${startTime} con ${booking.stylistName} ha sido cancelada.`,
        html: `
          <p>Hola ${booking.guestName},</p>
          <p>Tu cita para <strong>${booking.service}</strong> ha sido cancelada:</p>
          <p>⚜️ Gracias por elegir SOVRANO, donde la distinción, el arte y el detalle se unen para realzar tu belleza.</p>
          <ul>
            <li><strong>📅 Fecha:</strong> ${isoDate}</li>
            <li><strong>🕐 Hora:</strong> ${startTime}</li>
            <li><strong>🎨 Artista:</strong> ${booking.stylistName}</li>
            <li><strong>Cita numero:</strong> ${bookingAutonumber}</li>
          </ul>
          <p>Cuando desees regresar, estaremos encantados de ofrecerte una experiencia personalizada y memorable.</p>
          <p>✨ En SOVRANO te esperamos con la asesoría y el detalle que mereces.</p>
        `,
      });
    } catch (emailError) {
      logError("Error sending cancellation email:", emailError);
      // Don’t block cancellation flow if email fails
    }

    // 7️⃣ Run any extra callback
    if (onAfterCancel) {
      onAfterCancel();
    }
  } catch (error) {
    logError("❌ Error cancelling booking:", error);
    Alert.alert("Error", "No se pudo cancelar la cita.");
  }
};
