import { useEffect, useState } from 'react';
import { AuthUser } from '@/types/auth';
import { getStoredUser } from '@/lib/api/auth';

// Reads user info from localStorage and keeps it in sync with storage events.
const useAuthUser = () => {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'user_info' || event.key === 'accessToken' || event.key === 'auth_token') {
        setUser(getStoredUser());
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return { user };
};

export default useAuthUser;
