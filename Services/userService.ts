import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { db } from '../Services/firebaseConfig';

export const updateUserRoleByUsername = async (username: string, role: string) => {
  const q = query(collection(db, 'users'), where('username', '==', username));
  const snapshot = await getDocs(q);
  if (snapshot.empty) throw new Error('User not found');
  const userDoc = snapshot.docs[0];
  const uid = userDoc.id;
  await setDoc(doc(db, 'users', uid), { role }, { merge: true });
  return uid;
};
