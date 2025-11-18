import { getIdTokenResult } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../Services/firebaseConfig';

const dayMap = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];

const formatLocalYMD = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ✅ Utility to sort slots chronologically
const sortSlots = (slots: string[]) =>
  [...slots].sort((a, b) => {
    const [ah, am] = a.split(":").map(Number);
    const [bh, bm] = b.split(":").map(Number);
    return ah === bh ? am - bm : ah - bh;
  });

export const assignWeeklyAvailability = async (uid: string | undefined, weeks: number = 4) => {
  try {
    const tokenResult = await getIdTokenResult(auth.currentUser!);
    if (!('role' in tokenResult.claims)) {
      console.warn('No role claim found in token:', tokenResult.claims);
    }
  } catch (tokenError) {
    console.error('Failed to get ID token result:', tokenError);
  }

  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('No authenticated user found.');

    const resolvedUid = uid ?? currentUser.uid;
    if (!resolvedUid) throw new Error('No authenticated user found and no UID provided.');

    const uidString = resolvedUid as string;

    const templateRef = doc(db, 'weeklyTemplates', 'default');
    const templateSnap = await getDoc(templateRef);

    if (!templateSnap.exists()) {
      console.warn('Weekly template not found.');
      return;
    }

    const template = templateSnap.data();
    const today = new Date();

    for (let i = 0; i < weeks * 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const isoDate = formatLocalYMD(date);
      const dayOfWeek = dayMap[date.getDay()];
      const rawSlots: string[] = template[dayOfWeek] || [];

      // ✅ Always sort slots before processing
      const sortedSlots = sortSlots(rawSlots);

      const availabilityRef = doc(db, 'users', uidString, 'availability', isoDate);
      try {
        const existingSnap = await getDoc(availabilityRef);
        let existingSlots: any[] = [];

        if (existingSnap.exists()) {
          const existingData = existingSnap.data();
          existingSlots = existingData.timeSlots || [];
        }

        // Create a map of existing bookings
        const bookedMap = new Map(
          existingSlots.filter(s => s.booked).map(s => [s.time, true])
        );

        // Merge sorted template with existing bookings
        const mergedSlots = sortedSlots.map(time => ({
          time,
          booked: bookedMap.get(time) || false,
        }));

        await setDoc(availabilityRef, {
          timeSlots: mergedSlots,
          isDayOff: mergedSlots.length === 0,
        });
      } catch (writeError) {
        console.error('Write failed:', writeError);
      }
    }
  } catch (error) {
    console.error('Error assigning weekly availability:', error);
  }
};
