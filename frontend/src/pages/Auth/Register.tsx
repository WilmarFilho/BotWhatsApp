import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useRegister from '../../recoil/hooks/useRegister';

import FormAuth from '../../components/FormAuth';
import './index.css'



const Login = () => {

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, loading, error } = useRegister();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const success = await register(name, email, password);
    if (success) {
      console.log("Registro bem-sucedido");

      navigate('/home')
    }
  };

  return (
    <div className='formAUTH'>

      <h2>Register</h2>

      <FormAuth
        name={name}
        setName={setName}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        error={error}
        loading={loading}
        isRegister={true}
        onSubmit={handleSubmit}
      />

    </div>
  );
};

export default Login;
