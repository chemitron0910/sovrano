import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { getFirestore } from "firebase-admin/firestore";

export const notifyEmployeeOnBooking = onDocumentCreated("bookings/{bookingId}", async (event) => {
  const booking = event.data?.data();
  if (!booking) return;

  const stylistId = booking.stylistId;
  const userDoc = await getFirestore().doc(`users/${stylistId}`).get();
  const token = userDoc.data()?.expoPushToken;
  if (!token) return;

  const res = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: token,
      title: "Nueva reserva",
      body: `Nueva cita con ${booking.guestName} el ${booking.date}`,
    }),
  });

  const result = await res.json();
  console.log("Push response:", result);
});
