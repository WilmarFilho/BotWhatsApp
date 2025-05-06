from crewai import Task
from agents.atendimento_agent import atendimento_agent

atendimento_task = Task(
    description=lambda inputs: (
        f"Você é um agente de atendimento ao cliente. "
        f"Responda de forma clara e empática à pergunta do usuário: '{inputs['pergunta_usuario']}'. "
        f"Foque em suporte técnico, informações sobre produtos/serviços ou dúvidas comuns de atendimento."
    ),
    expected_output="Uma resposta clara e amigável resolvendo a dúvida do cliente.",
    agent=atendimento_agent
)
