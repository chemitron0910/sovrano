import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../Services/firebaseConfig";

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

// ✅ Utility to sort slots chronologically
const sortSlots = (slots: string[]) =>
  [...slots].sort((a, b) => {
    const [ah, am] = a.split(":").map(Number);
    const [bh, bm] = b.split(":").map(Number);
    return ah === bh ? am - bm : ah - bh;
  });

  const normalizeTime = (t: string | undefined | null) => {
  if (!t || typeof t !== "string") return "";
  const cleaned = t.replace(/^"+|"+$/g, "").trim(); // remove leading/trailing quotes
  if (!cleaned.includes(":")) return "";
  const [h, m] = cleaned.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return "";
  return `${h}:${m.toString().padStart(2, "0")}`;
};

export const assignWeeklyAvailability = async (
  uid: string | undefined,
  weeks = 4
) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser && !uid) {
      throw new Error("No authenticated user found and no UID provided.");
    }

    const uidString = uid ?? currentUser?.uid;
    if (!uidString) throw new Error("Unable to resolve UID.");

    const templateRef = doc(db, "weeklyTemplates", "default");
    const templateSnap = await getDoc(templateRef);

    if (!templateSnap.exists()) {
      console.warn("Weekly template not found.");
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

      const availabilityRef = doc(
        db,
        "users",
        uidString,
        "availability",
        isoDate
      );

      try {
        const existingSnap = await getDoc(availabilityRef);
        let existingSlots: { time: string; booked: boolean; bookingId?: string | null }[] = [];

        if (existingSnap.exists()) {
          const existingData = existingSnap.data();
          existingSlots = existingData.timeSlots || [];
        }

        // Create a map of existing slots keyed by time
        const existingMap = new Map(
          existingSlots.map((s) => [s.time, s])
        );

        // Merge sorted template with existing slots
        const mergedSlots = sortedSlots.map((time) => {
          const existing = existingMap.get(time);
          return {
            time,
            booked: existing?.booked ?? false,
            bookingId: existing?.bookingId ?? null, // ✅ preserve if exists, else null
          };
        });

        await setDoc(
          availabilityRef,
          {
            timeSlots: mergedSlots,
            isDayOff: mergedSlots.length === 0,
          },
          { merge: true }
        );
      } catch (writeError) {
        console.error("❌ Write failed:", writeError);
      }
    }
  } catch (error) {
    console.error("❌ Error assigning weekly availability:", error);
  }
};
