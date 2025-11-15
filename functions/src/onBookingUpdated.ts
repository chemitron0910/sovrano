import * as admin from "firebase-admin";
import * as functions from "firebase-functions/v1";
import * as logger from "firebase-functions/logger";

export const onBookingUpdated = functions
  .runWith({maxInstances: 10, memory: "512MB"})
  .firestore.document("bookings/{bookingId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // Only act when status changes to "cancelled"
    if (before?.status !== "cancelled" && after?.status === "cancelled") {
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
            {...slot, booked: false} :
            slot
        );
        await availabilityRef.update({timeSlots: slots});
        logger.info(
          `Freed slot "${selectedTime}" for ${stylistId} on ${isoDate}`
        );
      }

      // Notify stylist of cancellation
      const stylistDoc = await admin
        .firestore()
        .doc(`users/${stylistId}`)
        .get();
      const token = stylistDoc.data()?.expoPushToken;
      if (token) {
        try {
          const res = await fetch(
            "https://exp.host/--/api/v2/push/send",
            {
              method: "POST",
              headers: {"Content-Type": "application/json"},
              body: JSON.stringify({
                to: token,
                sound: "default",
                title: "Cita cancelada",
                body: `${after.guestName || "Un cliente"} canceló la cita
                  del ${isoDate} a las ${selectedTime}`,
              }),
            }
          );
          const result = await res.json();
          logger.info("Cancellation push response:", result);
        } catch (err) {
          logger.error(
            "Failed to send cancellation notification:",
            err
          );
        }
      }
    }
  });
