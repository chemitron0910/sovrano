import { logError } from "../../utils/logger";
import { getFirestore } from "./firebase";

const db = getFirestore();

const dayMap = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miercoles",
  "Jueves",
  "Viernes",
  "Sabado",
];

const formatLocalYMD = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const sortSlots = (slots: string[]) =>
  [...slots].sort((a, b) => {
    const [ah, am] = a.split(":").map(Number);
    const [bh, bm] = b.split(":").map(Number);
    return ah === bh ? am - bm : ah - bh;
  });

export const assignWeeklyAvailability = async (
  uid: string,
  weeks = 4
) => {
  try {
    const templateRef = db.doc("weeklyTemplates/default");
    const templateSnap = await templateRef.get();

    const template = templateSnap.data();
    if (!template) {
      console.warn("Weekly template not found.");
      return;
    }

    const today = new Date();

    for (let i = 0; i < weeks * 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const isoDate = formatLocalYMD(date);
      const dayOfWeek = dayMap[date.getDay()];

      // ✅ Ensure we always get a clean array of strings
      const rawSlots = Array.isArray(template[dayOfWeek]) ?
        (template[dayOfWeek] as string[]) :
        [];


      const sortedSlots = sortSlots(rawSlots.filter(Boolean));

      const availabilityRef = db.doc(`users/${uid}/availability/${isoDate}`);

      const timeSlots = sortedSlots.map((time) => ({
        time: String(time).trim(),
        booked: false,
        bookingId: null, // safe default, consistent schema
      }));

      await availabilityRef.set(
        {
          timeSlots,
          isDayOff: timeSlots.length === 0,
        },
        {merge: true}
      );
    }
  } catch (error) {
    logError("Error assigning weekly availability:", error);
  }
};
