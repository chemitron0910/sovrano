import { addDoc, collection, doc, getDoc, setDoc } from 'firebase/firestore';
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
      time: cleanTime(s.time),
      booked: s.booked,
    }));

    // Sort slots by time
    const sortedSlots = [...slots].sort((a, b) => {
      const [ah] = a.time.split(':').map(Number);
      const [bh] = b.time.split(':').map(Number);
      return ah - bh;
    });

    // Scan for a valid block
    for (let i = 0; i <= sortedSlots.length - durationHours; i++) {
      const block = sortedSlots.slice(i, i + durationHours);

      // Ensure all slots exist and are unbooked
      const allUnbooked = block.every(s => !s.booked);

      // Ensure times are consecutive by hour
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

export const handleBooking = async ({
  selectedSlot,
  selectedStylist,
  selectedService,
  guestInfo,
  role,
  navigation,
}: BookingParams) => {
  const isoDate = selectedSlot.date;
  const selectedTime = cleanTime(selectedSlot.time);
  const [year, month, day] = isoDate.split('-').map(Number);
  const [hour, minute] = selectedTime.split(':').map(Number);
  const fullDate = new Date(year, month - 1, day, hour, minute);

  const durationHours = Number(selectedService?.duration) || 1;
  const requiredTimes = Array.from({ length: durationHours }, (_, i) =>
    `${String(hour + i).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
  );

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
  };

  try {
    const availabilityRef = doc(db, 'users', selectedStylist.id, 'availability', isoDate);
    const availabilitySnap = await getDoc(availabilityRef);
    const availabilityData = availabilitySnap.exists()
      ? availabilitySnap.data()
      : { timeSlots: [], isDayOff: false };

    let slots: TimeSlot[] = (availabilityData.timeSlots || []).map((s: any) => ({
      time: cleanTime(s.time),
      booked: s.booked,
    }));

    // ✅ Conflict if slot missing OR already booked
    const conflict = requiredTimes.some(t => {
      const slot = slots.find(s => cleanTime(s.time) === t);
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
          `El siguiente horario disponible es ${suggestion.date} a las ${suggestion.time}`
        );
      } else {
        Alert.alert('Error', 'No hay horarios disponibles en los próximos días.');
      }
      return;
    }

    // ✅ Only mark existing slots, never create new ones
    requiredTimes.forEach(t => {
      const idx = slots.findIndex(s => cleanTime(s.time) === t);
      if (idx >= 0) {
        slots[idx].booked = true;
      }
    });

    await setDoc(availabilityRef, { ...availabilityData, timeSlots: slots });

    const docRef = await addDoc(collection(db, 'bookings'), bookingData);

    // ✅ Unified navigation
navigation.navigate("Cita confirmada", {
  service: bookingData.service,
  date: isoDate,
  time: selectedTime,
  guestName: bookingData.guestName,
  stylistName: bookingData.stylistName,
  bookingId: docRef.id,
  role: bookingData.role,
});
  } catch (error) {
    console.error('Error saving booking:', error);
    Alert.alert('Error', 'No se pudo crear tu cita');
  }
};
