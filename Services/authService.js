import { signInAnonymously, signOut } from 'firebase/auth';
import { auth } from '../Services/firebaseConfig';

export const signInAsGuest = async () => {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    console.error('Anonymous sign-in error:', error);
    throw error;
  }
};
export const logout = async (navigation) => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
  }
};
