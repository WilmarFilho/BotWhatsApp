from crewai import Task
from agents.financeiro_agent import financeiro_agent

financeiro_task = Task(
    description=lambda inputs: (
        f"Você é um agente financeiro. "
        f"A pergunta do usuário foi: '{inputs['pergunta_usuario']}'. "
        f"Responda se ela for sobre cobranças, boletos, prazos de pagamento, reembolsos ou qualquer assunto financeiro."
    ),
    expected_output="Uma resposta objetiva e clara sobre assuntos financeiros.",
    agent=financeiro_agent
)
