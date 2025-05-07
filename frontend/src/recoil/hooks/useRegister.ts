import { useState } from 'react';
import LoginResponse from '../../types/LoginResponse';
import { useSetRecoilState } from 'recoil';
import { userState, tokenState } from '../atom';
import axios from 'axios';

const useRegister = () => {
  const setUser = useSetRecoilState(userState);
  const setToken = useSetRecoilState(tokenState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post<LoginResponse>('http://localhost:3001/api/auth/register/', {
        name,
        email,
        password,
      });


      if (response.status === 201) {
        setUser(response.data.user);
        setToken(response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("userId", JSON.stringify(response.data.user.id));

        return true;
      }

      return false;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Erro desconhecido');
      } else {
        setError('Erro inesperado');
      }
    } finally {
      setLoading(false);
    }
  };

  return { register, loading, error };
};

export default useRegister;
