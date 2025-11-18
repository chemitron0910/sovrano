import * as functions from "firebase-functions/v1";
import {getFirestore} from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import {formatBookingDate} from "./formatBookingDate";

export const notifyEmployeeOnBooking = functions
  .runWith({maxInstances: 10, memory: "512MB"})
  .firestore.document("bookings/{bookingId}")
  .onCreate(async (snap, context) => {
    try {
      const booking = snap.data();
      if (!booking) return;

      const stylistId = booking.stylistId;
      const userDoc = await getFirestore().doc(`users/${stylistId}`).get();
      const token = userDoc.data()?.expoPushToken;
      if (!token) {
        logger.warn(`No Expo push token found for stylist ${stylistId}`);
        return;
      }

      const formattedDate = formatBookingDate(booking.date);

      const res = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          to: token,
          title: "Nueva reserva",
          body: `Nueva cita con ${booking.guestName} el ${formattedDate}`,
        }),
      });

      const result = await res.json();
      logger.info("Push response:", result);
    } catch (err) {
      logger.error("Push notification failed:", err);
    }
  });
