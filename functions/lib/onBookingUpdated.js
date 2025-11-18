"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.onBookingUpdated = void 0;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions/v1"));
const logger = __importStar(require("firebase-functions/logger"));
exports.onBookingUpdated = functions
    .runWith({ maxInstances: 10, memory: "512MB" })
    .firestore.document("bookings/{bookingId}")
    .onUpdate(async (change, context) => {
    var _a, _b;
    const before = change.before.data();
    const after = change.after.data();
    // Only act when status changes to "cancelled"
    if ((before === null || before === void 0 ? void 0 : before.status) !== "cancelled" && (after === null || after === void 0 ? void 0 : after.status) === "cancelled") {
        const isoDate = after.date.split("T")[0];
        const selectedTime = after.time;
        const stylistId = after.stylistId;
        // Free the slot
        const availabilityRef = admin
            .firestore()
            .doc(`users/${stylistId}/availability/${isoDate}`);
        const snap = await availabilityRef.get();
        if (snap.exists) {
            const slots = (((_a = snap.data()) === null || _a === void 0 ? void 0 : _a.timeSlots) || []).map((slot) => slot.time === selectedTime ? Object.assign(Object.assign({}, slot), { booked: false }) :
                slot);
            await availabilityRef.update({ timeSlots: slots });
            logger.info(`Freed slot "${selectedTime}" for ${stylistId} on ${isoDate}`);
        }
        // Notify stylist of cancellation
        const stylistDoc = await admin
            .firestore()
            .doc(`users/${stylistId}`)
            .get();
        const token = (_b = stylistDoc.data()) === null || _b === void 0 ? void 0 : _b.expoPushToken;
        if (token) {
            try {
                const res = await fetch("https://exp.host/--/api/v2/push/send", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        to: token,
                        sound: "default",
                        title: "Cita cancelada",
                        body: `${after.guestName || "Un cliente"} canceló la cita
                  del ${isoDate} a las ${selectedTime}`,
                    }),
                });
                const result = await res.json();
                logger.info("Cancellation push response:", result);
            }
            catch (err) {
                logger.error("Failed to send cancellation notification:", err);
            }
        }
    }
});
//# sourceMappingURL=onBookingUpdated.js.map