import * as functions from "firebase-functions/v1";
import {getFirestore} from "./firebase";
import {assignWeeklyAvailability} from "./assignWeeklyAvailability";

const db = getFirestore();

export const autoExtendAvailability = functions.pubsub
  // Run once every 24 hours (no fixed time)
  .schedule("every 24 hours")
  .onRun(async () => {
    const usersSnap = await db.collection("users").get();

    for (const userDoc of usersSnap.docs) {
      const uid = userDoc.id;
      const role = userDoc.data().role;
      if (role !== "empleado") continue;

      try {
        await assignWeeklyAvailability(uid, 4);
        console.log(`Extended availability for stylist ${uid}`);
      } catch (err) {
        console.error(`Failed to extend availability for ${uid}:`, err);
      }
    }

    return null;
  });
