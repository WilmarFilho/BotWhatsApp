import "./index.css"


interface ButtonAuthProps {
    loading: boolean,
}

const ButtonAuth = ({ loading = false }: ButtonAuthProps) => {
    return (
        <button className="buttonAuth" type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
    )
}

export default ButtonAuth