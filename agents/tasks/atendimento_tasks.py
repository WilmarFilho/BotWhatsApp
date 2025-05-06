from crewai import Task
from agents.atendimento_agent import atendimento_agent

atendimento_task = Task(
    description="Responder dúvidas do cliente sobre tipos de papel, tamanhos e serviços gráficos em geral.",
    expected_output="Explicação clara e objetiva sobre as opções gráficas disponíveis.",
    agent=atendimento_agent,
    async_execution=False
)
