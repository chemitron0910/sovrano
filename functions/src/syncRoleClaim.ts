import * as logger from "firebase-functions/logger";
import {getAuth} from "./firebase";
import * as functions from "firebase-functions/v1";

export const syncRoleClaim = functions
  .runWith({maxInstances: 10, memory: "512MB"})
  .firestore.document("users/{userId}")
  .onWrite(async (change, context) => {
    const newRole = change.after.exists ? change.after.data()?.role : null;
    const uid = context.params.userId;

    if (newRole) {
      await getAuth().setCustomUserClaims(uid, {role: newRole});
      logger.info(`Setting role ${newRole} for UID ${uid}`);
    }
  });
