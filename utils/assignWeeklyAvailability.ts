import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../Services/firebaseConfig';

const dayMap = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];

export const assignWeeklyAvailability = async (stylistId: string, weeks: number = 4) => {
  try {
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
      const slots = template[dayOfWeek] || [];

      const availabilityRef = doc(db, 'stylists', stylistId, 'availability', isoDate);
      await setDoc(availabilityRef, {
        timeSlots: slots,
        isDayOff: slots.length === 0,
      });
    }

    console.log(`Assigned weekly availability to stylist ${stylistId}`);
  } catch (error) {
    console.error('Error assigning weekly availability:', error);
  }
};
