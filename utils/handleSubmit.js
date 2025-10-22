import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../Services/firebaseConfig';

export const handleSubmit = async ({ collectionName, data, onSuccess, onError }) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
    });

    if (onSuccess) onSuccess(docRef.id);
  } catch (error) {
    console.error('Error submitting data:', error);
    if (onError) onError(error);
  }
};
