import { useEffect, useState } from 'react';
import { auth } from '..//Services/firebaseConfig';

export const useUserRole = () => {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdTokenResult();
        const roleClaim = token.claims.role;
        if (typeof roleClaim === 'string') {
          setRole(roleClaim);
        } else {
          setRole(null); // fallback if role is missing or malformed
        }
      }
    };
    fetchRole();
  }, []);

  return role;
};
