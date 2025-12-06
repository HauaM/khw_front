import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Redirects to the dashboard if an auth token is already present.
const useAuthRedirectIfLoggedIn = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('auth_token');
    if (token) {
      navigate('/', { replace: true });
    }
  }, [navigate]);
};

export default useAuthRedirectIfLoggedIn;
