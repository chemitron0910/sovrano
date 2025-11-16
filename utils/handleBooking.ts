import { addDoc, collection, doc, getDoc, setDoc } from 'firebase/firestore';
import {
    Alert
} from "react-native";
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
    guestName: guestInfo?.guestName || auth.currentUser?.displayName || '',
    email: guestInfo?.email || auth.currentUser?.email || '',
    phoneNumber: guestInfo?.phoneNumber || '',
    stylistId: selectedStylist.id,
    stylistName: selectedStylist.name,
    createdAt: new Date().toISOString(),
    role,
    userId: auth.currentUser?.uid ?? null,
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
      Alert.alert('Error', 'Este horario ya está reservado o no cabe en la duración.');
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

    navigation.navigate('Cita confirmada.', {
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
