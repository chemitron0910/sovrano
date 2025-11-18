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
exports.notifyEmployeeOnBooking = void 0;
const functions = __importStar(require("firebase-functions/v1"));
const firestore_1 = require("firebase-admin/firestore");
const logger = __importStar(require("firebase-functions/logger"));
const formatBookingDate_1 = require("./formatBookingDate");
exports.notifyEmployeeOnBooking = functions
    .runWith({ maxInstances: 10, memory: "512MB" })
    .firestore.document("bookings/{bookingId}")
    .onCreate(async (snap, context) => {
    var _a;
    try {
        const booking = snap.data();
        if (!booking)
            return;
        const stylistId = booking.stylistId;
        const userDoc = await (0, firestore_1.getFirestore)().doc(`users/${stylistId}`).get();
        const token = (_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.expoPushToken;
        if (!token) {
            logger.warn(`No Expo push token found for stylist ${stylistId}`);
            return;
        }
        const formattedDate = (0, formatBookingDate_1.formatBookingDate)(booking.date);
        const res = await fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                to: token,
                title: "Nueva reserva",
                body: `Nueva cita con ${booking.guestName} el ${formattedDate}`,
            }),
        });
        const result = await res.json();
        logger.info("Push response:", result);
    }
    catch (err) {
        logger.error("Push notification failed:", err);
    }
});
//# sourceMappingURL=notifyEmployeeOnBooking.js.map