import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { auth, db } from "../Services/firebaseConfig";
import { assignWeeklyAvailability } from "../utils/assignWeeklyAvailability";

export const ensureAvailability = async () => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  // 🔎 First check the user's role
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return;

  const userData = userSnap.data();
  const role = userData.role;

  if (role !== "empleado" && role !== "admin") {
    // ✅ Skip if not an employee or admin
    return;
  }

  // ✅ Only employees or admins reach here
  const availabilityRef = collection(db, "users", uid, "availability");
  const snap = await getDocs(availabilityRef);

  if (snap.empty) {
    await assignWeeklyAvailability(uid, 4);
  }
};
