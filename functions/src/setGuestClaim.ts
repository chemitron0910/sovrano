import * as functions from "firebase-functions/v1";
import {getAuth} from "firebase-admin/auth";
import * as logger from "firebase-functions/logger";

export const setGuestClaim = functions
  .runWith({maxInstances: 10, memory: "512MB"})
  .firestore.document("users/{userId}")
  .onCreate(async (snap, context) => {
    const data = snap.data();
    if (!data) return;

    const role = data.role;
    const uid = context.params.userId;

    if (role === "guest") {
      await getAuth().setCustomUserClaims(uid, {role: "guest"});
      logger.info(`Assigned guest role claim to UID ${uid}`);
    }
  });
