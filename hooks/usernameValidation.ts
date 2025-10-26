import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../Services/firebaseConfig';

export const checkUsername = async (username: string) => {
  const q = query(collection(db, 'users'), where('username', '==', username));
  const snapshot = await getDocs(q);
  return snapshot.size === 1; // ✅ Only one match allowed
};
