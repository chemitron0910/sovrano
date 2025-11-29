import { addDoc, collection, doc, getDoc, runTransaction, setDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from "firebase/functions";
import { Alert } from "react-native";
import { auth, db } from '../Services/firebaseConfig';

type BookingParams = {
  selectedSlot: { date: string; time: string };
  selectedStylist: { id: string; name: string };
  selectedService: { name: string; duration: string };
  guestInfo?: {
    guestName: string;
    email: string;
    phoneNumber: string;
  };
  role: 'usuario' | 'guest';
  navigation: any;
};

type TimeSlot = {
  time: string;
  booked: boolean;
};

const cleanTime = (t: string) => t.replace(/['"]+/g, '').trim();

// Normalize to HH:mm
const normalizeTime = (t: string) => {
  const [h, m] = cleanTime(t).split(':').map(Number);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

// 🔎 Suggest next available block across multiple days
const findNextAvailableSuggestion = async (
  stylistId: string,
  startDate: Date,
  durationHours: number
): Promise<{ date: string; time: string } | null> => {
  for (let offset = 0; offset < 14; offset++) {
    const d = new Date(startDate.getTime());
    d.setDate(startDate.getDate() + offset);

    const isoDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const availabilityRef = doc(db, 'users', stylistId, 'availability', isoDate);
    const availabilitySnap = await getDoc(availabilityRef);

    if (!availabilitySnap.exists()) continue;

    const availabilityData = availabilitySnap.data();
    const slots: TimeSlot[] = (availabilityData.timeSlots || []).map((s: any) => ({
      time: normalizeTime(s.time),
      booked: s.booked,
    }));

    // Sort slots chronologically
    const sortedSlots = [...slots].sort((a, b) => {
      const [ah, am] = a.time.split(':').map(Number);
      const [bh, bm] = b.time.split(':').map(Number);
      return ah === bh ? am - bm : ah - bh;
    });

    // Scan for a valid block
    for (let i = 0; i <= sortedSlots.length - durationHours; i++) {
      const block = sortedSlots.slice(i, i + durationHours);

      const allUnbooked = block.every(s => !s.booked);

      let isConsecutive = true;
      for (let j = 1; j < block.length; j++) {
        const [prevH, prevM] = block[j - 1].time.split(':').map(Number);
        const [currH, currM] = block[j].time.split(':').map(Number);
        if (currH !== prevH + 1 || currM !== prevM) {
          isConsecutive = false;
          break;
        }
      }

      if (allUnbooked && isConsecutive) {
        return { date: isoDate, time: block[0].time };
      }
    }
  }
  return null;
};

// Helper to get next sequential booking number
async function getNextBookingNumber() {
  const counterRef = doc(db, "counters", "bookingsCounter");

  const newNumber = await runTransaction(db, async (transaction) => {
    const counterSnap = await transaction.get(counterRef);

    if (!counterSnap.exists()) {
      transaction.set(counterRef, { lastNumber: 1 });
      return 1;
    }

    const lastNumber = counterSnap.data().lastNumber || 0;
    const nextNumber = lastNumber + 1;
    transaction.update(counterRef, { lastNumber: nextNumber });
    return nextNumber;
  });

  return newNumber;
}

export const handleBooking = async ({
  selectedSlot,
  selectedStylist,
  selectedService,
  guestInfo,
  role,
  navigation,
}: BookingParams) => {
  const isoDate = selectedSlot.date;
  const selectedTime = normalizeTime(selectedSlot.time);
  const [year, month, day] = isoDate.split('-').map(Number);
  const [hour, minute] = selectedTime.split(':').map(Number);
  const fullDate = new Date(year, month - 1, day, hour, minute);

  const durationHours = Number(selectedService?.duration) || 1;

  const requiredTimes = Array.from({ length: durationHours }, (_, i) => {
    const h = hour + i;
    return `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  });

  try {
    // ✅ Get sequential booking number
    const autoNumber = await getNextBookingNumber();

    // ✅ If user, fetch their autoNumber from users collection
    let userAutoNumber: number | null = null;
    if (role === "usuario" && auth.currentUser?.uid) {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        userAutoNumber = userSnap.data().autoNumber ?? null;
      }
    }

    const bookingData = {
      service: selectedService?.name || '',
      duration: selectedService?.duration || '',
      date: fullDate.toISOString(),
      time: selectedTime,
      guestName:
        role === "guest"
          ? guestInfo?.guestName || ""
          : auth.currentUser?.displayName || "",
      email:
        role === "guest"
          ? guestInfo?.email || ""
          : auth.currentUser?.email || "",
      phoneNumber:
        role === "guest"
          ? guestInfo?.phoneNumber || ""
          : "",
      stylistId: selectedStylist.id,
      stylistName: selectedStylist.name,
      createdAt: new Date().toISOString(),
      role,
      userId: role === "usuario" ? auth.currentUser?.uid ?? null : null,
      userAutoNumber,   // ✅ include user’s sequential number
      status: "Reservado",
      autoNumber,       // ✅ booking sequential number
    };

    const availabilityRef = doc(db, 'users', selectedStylist.id, 'availability', isoDate);
    const availabilitySnap = await getDoc(availabilityRef);
    const availabilityData = availabilitySnap.exists()
      ? availabilitySnap.data()
      : { timeSlots: [], isDayOff: false };

    let slots: any[] = (availabilityData.timeSlots || []).map((s: any) => ({
      time: normalizeTime(s.time),
      booked: s.booked,
      bookingId: s.bookingId ?? null,
    }));

    // Sort slots chronologically
    slots.sort((a, b) => {
      const [ah, am] = a.time.split(':').map(Number);
      const [bh, bm] = b.time.split(':').map(Number);
      return ah === bh ? am - bm : ah - bh;
    });

    // Conflict check
    const conflict = requiredTimes.some(t => {
      const slot = slots.find(s => s.time === t);
      return !slot || slot.booked;
    });

    if (conflict) {
      const suggestion = await findNextAvailableSuggestion(
        selectedStylist.id,
        fullDate,
        durationHours
      );
      if (suggestion) {
        Alert.alert(
          'Horario no disponible',
          `La duración del servicio (${durationHours} horas) no cabe en el bloque seleccionado. 
El siguiente horario disponible que sí acomoda la duración es ${suggestion.date} a las ${suggestion.time}.`
        );
      } else {
        Alert.alert('Error', 'No hay horarios disponibles en los próximos días.');
      }
      return;
    }

    // ✅ Create booking document with sequential number
    const docRef = await addDoc(collection(db, 'bookings'), bookingData);

    // ✅ Send confirmation email via Cloud Function
    try {
      const functions = getFunctions();
      const sendGuestEmail = httpsCallable(functions, "sendGuestEmail");

      await sendGuestEmail({
        to: bookingData.email,
        subject: "Confirmación de tu cita en Sovrano",
        text: `Hola ${bookingData.guestName}, tu cita para ${bookingData.service} está reservada el ${isoDate} a las ${selectedTime} con ${bookingData.stylistName}.`,
        html: `
          <p>Hola ${bookingData.guestName},</p>
          <p>Tu cita para <strong>${bookingData.service}</strong> está reservada:</p>
          <ul>
            <li><strong>Fecha:</strong> ${isoDate}</li>
            <li><strong>Hora:</strong> ${selectedTime}</li>
            <li><strong>Estilista:</strong> ${bookingData.stylistName}</li>
          </ul>
          <p>¡Gracias por confiar en Sovrano!</p>
        `,
        autoNumber,        // booking sequential number
        userAutoNumber,    // user sequential number (if available)
      });
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
      // Don’t block booking flow if email fails
    }

    // ✅ Mark slots as booked and attach bookingId + guestName
    requiredTimes.forEach(t => {
      const idx = slots.findIndex(s => s.time === t);
      if (idx >= 0) {
        slots[idx].booked = true;
        slots[idx].bookingId = docRef.id;
      }
    });

    await setDoc(availabilityRef, { ...availabilityData, timeSlots: slots });

    navigation.navigate("Cita confirmada", {
      service: bookingData.service,
      date: isoDate,
      time: selectedTime,
      guestName: bookingData.guestName,
      stylistName: bookingData.stylistName,
      bookingId: docRef.id,
      autoNumber, // ✅ pass booking sequential number to confirmation screen
      role: bookingData.role,
      userAutoNumber: bookingData.userAutoNumber, // ✅ pass user sequential number to confirmation screen
    });
  } catch (error) {
    console.error('Error saving booking:', error);
    Alert.alert('Error', 'No se pudo crear tu cita');
  }
};
