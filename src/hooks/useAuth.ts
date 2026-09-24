import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';
import type { AuthResponse, LoginRequest } from '@/types/auth';

export function useLogin() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const { data } = await api.post<AuthResponse>('/auth/login', credentials);
      return data;
    },
    onSuccess: (data) => {
      auth.setSession(data.accessToken, data.refreshToken, data.user);
      navigate('/dashboard', { replace: true });
    },
  });
}

export function useLogout() {
  const navigate = useNavigate();

  return () => {
    auth.clear();
    navigate('/login', { replace: true });
  };
}

export function useCurrentUser() {
  return auth.getUser();
}

export function useIsAuthenticated() {
  return auth.isAuthenticated();
}