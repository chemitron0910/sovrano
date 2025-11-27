import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { Alert } from "react-native";
import { db } from "../Services/firebaseConfig";

export const normalizeTime = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export type CancelBookingOptions = {
  bookingId?: string;          // used when you only have the id
  bookingData?: any;           // used when you already have the booking object
  cancelledBy?: "empleado" | "usuario";
  onAfterCancel?: () => void;  // optional callback (refresh availability, update state)
  updateLocalState?: (id: string) => void; // optional callback for UserBookingHistory
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
    const startTime = normalizeTime(booking.time);
    const durationHours = Number(booking.duration) || 1;

    const bookingRef = doc(db, "bookings", booking.id || bookingId!);

    // 2️⃣ Update booking status
    await updateDoc(bookingRef, {
      status: "cancelled",
      cancelledAt: new Date().toISOString(),
      cancelledBy,
    });

    // 3️⃣ Load stylist availability for that day
    const availabilityRef = doc(db, "users", stylistId, "availability", isoDate);
    const availabilitySnap = await getDoc(availabilityRef);
    if (availabilitySnap.exists()) {
      const availabilityData = availabilitySnap.data();
      let slots: any[] = availabilityData.timeSlots || [];

      // 4️⃣ Free up the correct number of consecutive slots
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

    // 5️⃣ Update local state if provided (UserBookingHistory)
    if (updateLocalState) {
      updateLocalState(booking.id);
    }

    // 6️⃣ Success message
    Alert.alert("Éxito", "La cita fue cancelada y los horarios liberados.");

    // 7️⃣ Run any extra callback (StaffCalendarScreen refresh)
    if (onAfterCancel) {
      onAfterCancel();
    }
  } catch (error) {
    console.error("❌ Error cancelling booking:", error);
    Alert.alert("Error", "No se pudo cancelar la cita.");
  }
};
