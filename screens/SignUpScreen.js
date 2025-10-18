import { doc, setDoc } from 'firebase/firestore';
import { upgradeAnonymousAccount } from '../Services/authService';
import { db } from '../Services/firebaseConfig';

const handleUpgrade = async () => {
  await upgradeAnonymousAccount(email, password);
  // Redirect to dashboard or show success message
};

const saveUserData = async (uid, data) => {
  await setDoc(doc(db, 'users', uid), data);
};