import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { configureApi } from '@/lib/api';

export function ApiConfigurator() {
  const { accessToken, refreshAccessToken, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    configureApi({
      getToken: () => accessToken,
      refreshToken: refreshAccessToken,
      onUnauthorized: () => {
        logout();
        navigate('/');
      },
    });
  }, [accessToken, refreshAccessToken, logout, navigate]);

  return null;
}
