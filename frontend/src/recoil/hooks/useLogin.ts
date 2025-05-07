import { useState } from 'react';
import LoginResponse from '../../types/LoginResponse';
import { useSetRecoilState } from 'recoil';
import { userState, tokenState } from '../atom'; 
import axios from 'axios';

const useLogin = () => {
  const setUser = useSetRecoilState(userState); 
  const setToken = useSetRecoilState(tokenState); 
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState<string | null>(null); 

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null); 

    try {
      const response = await axios.post<LoginResponse>('http://localhost:3001/api/auth/login/', {
        email,
        password,
      });

      
      if (response.status === 200) {
        setUser(response.data.user);
        setToken(response.data.token);  
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("userId", JSON.stringify(response.data.user.id));
        
        return true;
      }

      return false;
    } catch (err) {
      setError('Credenciais inválidas ou erro ao conectar');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};

export default useLogin;
