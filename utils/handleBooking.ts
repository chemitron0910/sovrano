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

// 🔎 Suggest next available block across multiple days
const findNextAvailableSuggestion = async (
  stylistId: string,
  startDate: Date,
  durationHours: number
): Promise<{ date: string; time: string } | null> => {
  // Look ahead up to 14 days
  for (let offset = 0; offset < 14; offset++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + offset);
    const isoDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const availabilityRef = doc(db, 'users', stylistId, 'availability', isoDate);
    const availabilitySnap = await getDoc(availabilityRef);

    if (!availabilitySnap.exists()) {
      continue;
    }
    const availabilityData = availabilitySnap.data();
    const slots: any[] = availabilityData.timeSlots || [];
    // Sort slots by time
    const sortedSlots = [...slots].sort((a, b) => {
      const [ah] = a.time.split(':').map(Number);
      const [bh] = b.time.split(':').map(Number);
      return ah - bh;
    });

    // Scan for a valid block
    for (let i = 0; i < sortedSlots.length; i++) {
      const cleanTime = (t: string) => t.replace(/['"]+/g, '').trim();
      const [h, m] = cleanTime(sortedSlots[i].time).split(':').map(Number);
      const candidateTimes: string[] = [];
      for (let j = 0; j < durationHours; j++) {
        candidateTimes.push(`${String(h + j).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      }

      const fits = candidateTimes.every(t => {
        const slot = slots.find((s: any) => cleanTime(s.time) === t);
        return slot && !slot.booked;
      });
      if (fits) {
        return { date: isoDate, time: candidateTimes[0] };
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
  const cleanTime = (t: string) => t.replace(/['"]+/g, '').trim();

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
        : "", // for usuario you can fetch from profile if needed
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

    let slots: any[] = availabilityData.timeSlots || [];

    const conflict = requiredTimes.some(t =>
      slots.find(s => cleanTime(s.time) === t)?.booked
    );

    if (conflict) {
      // 👇 Suggest next available block
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

    requiredTimes.forEach(t => {
      const idx = slots.findIndex(s => cleanTime(s.time) === t);
      if (idx >= 0) {
        slots[idx].booked = true;
      } else {
        slots.push({ time: t, booked: true });
      }
    });

    await setDoc(availabilityRef, { ...availabilityData, timeSlots: slots });

    const docRef = await addDoc(collection(db, 'bookings'), bookingData);

    // Navigate to correct confirmation screen
    if (role === "guest") {
      navigation.navigate('Cita confirmada', {
        service: bookingData.service,
        date: isoDate,
        time: selectedTime,
        guestName: bookingData.guestName,
        stylistName: bookingData.stylistName,
        bookingId: docRef.id,
        role: bookingData.role,
      });
    } else {
      navigation.navigate('Cita confirmada.', {
        service: bookingData.service,
        date: isoDate,
        time: selectedTime,
        guestName: bookingData.guestName,
        stylistName: bookingData.stylistName,
        bookingId: docRef.id,
        role: bookingData.role,
      });
    }
  } catch (error) {
    console.error('Error saving booking:', error);
    Alert.alert('Error', 'No se pudo crear tu cita');
  }
};
