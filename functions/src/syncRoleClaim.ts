import {onDocumentWritten} from "firebase-functions/v2/firestore";
import {getAuth} from "./firebase";

export const syncRoleClaim = onDocumentWritten(
  "users/{userId}",
  async (event) => {
    const newRole = event.data?.after?.data()?.role;
    const uid = event.params.userId;
    console.log("syncRoleClaim triggered for UID:", uid);
    if (newRole) {
      await getAuth().setCustomUserClaims(uid, {role: newRole});
      console.log(`Setting role ${newRole} for UID ${uid}`);
    }
  });
