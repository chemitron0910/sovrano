"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignWeeklyAvailability = void 0;
const firebase_1 = require("./firebase");
const db = (0, firebase_1.getFirestore)();
const dayMap = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miercoles",
    "Jueves",
    "Viernes",
    "Sabado",
];
const formatLocalYMD = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};
const sortSlots = (slots) => [...slots].sort((a, b) => {
    const [ah, am] = a.split(":").map(Number);
    const [bh, bm] = b.split(":").map(Number);
    return ah === bh ? am - bm : ah - bh;
});
const assignWeeklyAvailability = async (uid, weeks = 4) => {
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
            const rawSlots = template[dayOfWeek] || [];
            const sortedSlots = sortSlots(rawSlots);
            const availabilityRef = db.doc(`users/${uid}/availability/${isoDate}`);
            await availabilityRef.set({
                timeSlots: sortedSlots.map((time) => ({ time, booked: false })),
                isDayOff: sortedSlots.length === 0,
            }, { merge: true });
        }
    }
    catch (error) {
        console.error("Error assigning weekly availability:", error);
    }
};
exports.assignWeeklyAvailability = assignWeeklyAvailability;
//# sourceMappingURL=assignWeeklyAvailability.js.map