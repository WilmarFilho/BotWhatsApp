import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useLogin from '../../recoil/hooks/useLogin'; 

import FormAuth from '../../components/FormAuth';
import './index.css'



const Login = () => {

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useLogin();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const success = await login(email, password);
    if (success) {
      console.log("Login bem-sucedido");

      navigate('/home')
    }
  };

  return (
    <div className='formAUTH'>

      <h2>Login</h2>

      <FormAuth
        name={name}
        setName={setName}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        error={error}
        loading={loading}
        isRegister={false}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default Login;
