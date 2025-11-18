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
exports.onBookingCreated = void 0;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions/v1"));
const logger = __importStar(require("firebase-functions/logger"));
exports.onBookingCreated = functions
    .runWith({ maxInstances: 10, memory: "512MB" })
    .firestore.document("bookings/{bookingId}")
    .onCreate(async (snap, context) => {
    const booking = snap.data();
    if (!(booking === null || booking === void 0 ? void 0 : booking.stylistId) || !(booking === null || booking === void 0 ? void 0 : booking.date) || !(booking === null || booking === void 0 ? void 0 : booking.time)) {
        logger.warn("Booking missing required fields", booking);
        return;
    }
    const isoDate = booking.date.split("T")[0];
    const selectedTime = booking.time;
    const stylistId = booking.stylistId;
    const availabilityRef = admin
        .firestore()
        .doc(`users/${stylistId}/availability/${isoDate}`);
    const availabilitySnap = await availabilityRef.get();
    if (!availabilitySnap.exists) {
        logger.warn(`Availability doc not found: users/${stylistId}/availability/` +
            `${isoDate}`);
        return;
    }
    const availabilityData = availabilitySnap.data() || {};
    const slots = (availabilityData.timeSlots || []).map((slot) => {
        var _a;
        return ({
            time: (_a = slot === null || slot === void 0 ? void 0 : slot.time) !== null && _a !== void 0 ? _a : String(slot),
            booked: Boolean(slot === null || slot === void 0 ? void 0 : slot.booked),
        });
    });
    const idx = slots.findIndex((s) => s.time === selectedTime);
    if (idx === -1) {
        logger.warn(`Slot "${selectedTime}" not found for ${stylistId} on ${isoDate}`);
        return;
    }
    if (slots[idx].booked) {
        logger.warn(`Slot "${selectedTime}" already booked for ${stylistId} on ${isoDate}`);
        return;
    }
    slots[idx] = Object.assign(Object.assign({}, slots[idx]), { booked: true });
    await availabilityRef.update({ timeSlots: slots });
    logger.info(`Booked slot "${selectedTime}" for ${stylistId} on ${isoDate}`);
});
//# sourceMappingURL=onBookingCreated.js.map