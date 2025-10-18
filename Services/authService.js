import { EmailAuthProvider, linkWithCredential, signInAnonymously } from 'firebase/auth';
import { auth } from '../Services/firebaseConfig';

export const signInAsGuest = async () => {
  try {
    const result = await signInAnonymously(auth);
    console.log('Signed in anonymously:', result.user.uid);
    return result.user;
  } catch (error) {
    console.error('Anonymous sign-in error:', error);
    throw error;
  }
};

export const upgradeAnonymousAccount = async (email, password) => {
  try {
    const credential = EmailAuthProvider.credential(email, password);
    const result = await linkWithCredential(auth.currentUser, credential);
    console.log('Anonymous account upgraded:', result.user.uid);
  } catch (error) {
    console.error('Upgrade error:', error);
  }
};
