import * as admin from "firebase-admin";
import * as functions from "firebase-functions/v1";
import * as logger from "firebase-functions/logger";
import {
  QueryDocumentSnapshot,
} from "firebase-functions/v1/firestore";

type Booking = {
  service: string;
  date: string;
  time: string;
  guestName: string;
  userId: string;
  stylistId: string;
  stylistName: string;
  createdAt: string;
  role: string;
};

type TimeSlot = {
  time: string;
  booked: boolean;
};

export const onBookingCreated = functions
  .runWith({maxInstances: 10, memory: "512MB"})
  .firestore.document("bookings/{bookingId}")
  .onCreate(
    async (
      snap: QueryDocumentSnapshot,
      context: functions.EventContext
    ) => {
      const booking = snap.data() as Booking;

      if (!booking?.stylistId || !booking?.date || !booking?.time) {
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
        logger.warn(
          `Availability doc not found: users/${stylistId}/availability/` +
          `${isoDate}`
        );
        return;
      }

      const availabilityData = availabilitySnap.data() || {};
      const slots: TimeSlot[] = (availabilityData.timeSlots || []).map(
        (slot: any) => ({
          time: slot?.time ?? String(slot),
          booked: Boolean(slot?.booked),
        })
      );

      const idx = slots.findIndex(
        (s: TimeSlot) => s.time === selectedTime
      );
      if (idx === -1) {
        logger.warn(
          `Slot "${selectedTime}" not found for ${stylistId} on ${isoDate}`
        );
        return;
      }
      if (slots[idx].booked) {
        logger.warn(
          `Slot "${selectedTime}" already booked for ${stylistId} on ${isoDate}`
        );
        return;
      }

      slots[idx] = {...slots[idx], booked: true};
      await availabilityRef.update({timeSlots: slots});
      logger.info(
        `Booked slot "${selectedTime}" for ${stylistId} on ${isoDate}`
      );
    }
  );
