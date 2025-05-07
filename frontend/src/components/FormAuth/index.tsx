import CampoTexto from "../CampoTexto";
import ButtonAuth from "../ButtonAuth";

import "./index.css"

interface FormAuthProps {
    name: string;
    email: string;
    password: string;
    error:string | null;
    loading: boolean;
    isRegister: boolean; 
    setName: React.Dispatch<React.SetStateAction<string>> ;
    setEmail: React.Dispatch<React.SetStateAction<string>>;
    setPassword: React.Dispatch<React.SetStateAction<string>>;
    onSubmit: (e: React.FormEvent) => void;
}

const FormAuth = ({name, email, password, error, loading, isRegister, setName, setEmail, setPassword, onSubmit} : FormAuthProps) => {
    return (
        <form onSubmit={onSubmit}>

            { isRegister  ? <CampoTexto type='text' id='nome' label='Nome' valor={name} onChange={(e) => setName(e.target.value)} /> : '' }

            <CampoTexto type='text' id='email' label='Email' valor={email} onChange={(e) => setEmail(e.target.value)} />

            <CampoTexto type='password' id='senha' label='Senha' valor={password} onChange={(e) => setPassword(e.target.value)} />

            {error && <p>{error}</p>}

            <ButtonAuth loading={loading} />

        </form>
    )
}

export default FormAuth