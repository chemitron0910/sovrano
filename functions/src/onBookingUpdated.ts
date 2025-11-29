import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import * as functions from "firebase-functions/v1";

/**
 * Sends a push notification via Expo's Push API.
 *
 * @param {string} token - Expo push token of the recipient.
 * @param {string} title - Notification title.
 * @param {string} body - Notification body text.
 */
async function sendPush(token: string, title: string, body: string) {
  try {
    const res = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        to: token,
        sound: "default",
        title,
        body,
        priority: "high",
        data: {type: "cancellation"},
      }),
    });
    const result = await res.json();
    logger.info("Push response:", result);
  } catch (err) {
    logger.error("Failed to send push:", err);
  }
}

export const onBookingUpdated = functions
  .runWith({maxInstances: 10, memory: "512MB"})
  .firestore.document("bookings/{bookingId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // Only act when status changes to "Cancelado"
    if (before?.status !== "Cancelado" && after?.status === "Cancelado") {
      const isoDate = after.date.split("T")[0];
      const selectedTime = after.time;
      const stylistId = after.stylistId;

      // Free the slot
      const availabilityRef = admin
        .firestore()
        .doc(`users/${stylistId}/availability/${isoDate}`);
      const snap = await availabilityRef.get();
      if (snap.exists) {
        const slots = (snap.data()?.timeSlots || []).map((slot: any) =>
          slot.time === selectedTime ?
            {...slot, booked: false, bookingId: null} :
            slot
        );
        await availabilityRef.update({timeSlots: slots});
        logger.info(
          `Freed slot "${selectedTime}" for stylist ${stylistId} on ${isoDate}`
        );
      }

      // Notify stylist if guest Cancelado
      if (after.cancelledBy !== "stylist") {
        const stylistDoc = await admin
          .firestore()
          .doc(`users/${stylistId}`)
          .get();
        const stylistToken = stylistDoc.data()?.expoPushToken;
        if (stylistToken) {
          await sendPush(
            stylistToken,
            "Cita cancelada",
            `${after.guestName || "Un cliente"} canceló la cita ` +
              `del ${isoDate} a las ${selectedTime}`
          );
        }
      }

      // Notify guest if stylist Cancelado
      if (after.cancelledBy === "stylist") {
        const guestId = after.userId;
        const guestDoc = await admin
          .firestore()
          .doc(`users/${guestId}`)
          .get();
        const guestRole = guestDoc.data()?.role;
        const guestToken = guestDoc.data()?.expoPushToken;

        if (guestRole === "usuario" && guestToken) {
          await sendPush(
            guestToken,
            "Tu cita fue cancelada",
            `El estilista ${after.stylistName} canceló tu cita ` +
              `del ${isoDate} a las ${selectedTime}`
          );
        }
      }
    }
  });
