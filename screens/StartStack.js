import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { signInAsGuest } from '../Services/authService';
import { auth } from '../Services/firebaseConfig';
import GuestStack from '../screens/GuestStack';
import UserStack from '../screens/UserStack';

export default function StartStack() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        const guestUser = await signInAsGuest();
        setUser(guestUser);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return null; // or splash screen

  return user?.isAnonymous ? <GuestStack /> : <UserStack />;
}
