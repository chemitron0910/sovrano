import { getIdTokenResult } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../Services/firebaseConfig';

const dayMap = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];

export const assignWeeklyAvailability = async (uid: string  | undefined, weeks: number = 4) => {
  try {
  const tokenResult = await getIdTokenResult(auth.currentUser!);

  if ('role' in tokenResult.claims) {
  } else {
    console.warn('No role claim found in token:', tokenResult.claims);
  }
} catch (tokenError) {
  console.error('Failed to get ID token result:', tokenError);
}



  try {
    // 🔐 Guard against null auth.currentUser
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No authenticated user found.');
    }

    // 🧠 Default to current user's UID if none provided
    const resolvedUid = uid ?? currentUser.uid;
    if (!resolvedUid) {
      throw new Error('No authenticated user found and no UID provided.');
    }

    const uidString = resolvedUid as string;

    const templateRef = doc(db, 'weeklyTemplates', 'default');
    const templateSnap = await getDoc(templateRef);

    if (!templateSnap.exists()) {
      console.warn('Weekly template not found.');
      return;
    }

    try {
      const tokenResult = await getIdTokenResult(auth.currentUser!);
    } catch (tokenError) {
    console.error('Failed to get ID token result:', tokenError);
    }

    const template = templateSnap.data();

    const today = new Date();
    for (let i = 0; i < weeks * 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const isoDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
      const dayOfWeek = dayMap[date.getDay()];
      const slots = template[dayOfWeek] || [];

      const availabilityRef = doc(db, 'users', uidString, 'availability', isoDate);
      try {
        await setDoc(availabilityRef, {
        timeSlots: slots,
        isDayOff: slots.length === 0,
        });
      } catch (writeError) {
        console.error('Write failed:', writeError);
      }
    }
  } catch (error) {
    console.error('Error assigning weekly availability:', error);
  }
};
