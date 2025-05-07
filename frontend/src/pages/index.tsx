import "./index.css"
import { useNavigate } from "react-router-dom";

const Welcome = () => {

    const navigate = useNavigate()

    function Navegacao() {
        navigate('/chat-ia')
    }

    return (
        <section className="welcome">
            <button onClick={Navegacao}>IA</button>
            <button>Atendentes</button>
        </section>
    )
}

export default Welcome;