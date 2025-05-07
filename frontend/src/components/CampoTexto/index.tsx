import "./index.css"


interface CampoTextoProps {
    valor: string,
    label: string,
    id: string,
    type: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CampoTexto = ({ valor, onChange, label, id, type }: CampoTextoProps) => {
    return (
        <div>
            <label htmlFor={id}>{label}:</label>
            <input
                className="formAuth"
                type={type}
                id={id}
                value={valor}
                onChange={onChange}
                required
            />
        </div>
    )
}

export default CampoTexto