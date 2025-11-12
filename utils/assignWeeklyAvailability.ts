import { getIdTokenResult } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../Services/firebaseConfig';

const dayMap = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];

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

      const isoDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
      const dayOfWeek = dayMap[date.getDay()];
      const rawSlots: string[] = template[dayOfWeek] || [];

      const timeSlots = rawSlots.map(time => ({
        time,
        booked: false,
      }));

      const availabilityRef = doc(db, 'users', uidString, 'availability', isoDate);
      try {
        await setDoc(availabilityRef, {
          timeSlots,
          isDayOff: timeSlots.length === 0,
        });
      } catch (writeError) {
        console.error('Write failed:', writeError);
      }
    }
  } catch (error) {
    console.error('Error assigning weekly availability:', error);
  }
};
