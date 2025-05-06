from crewai import Task
from agents.financeiro_agent import financeiro_agent

financeiro_task = Task(
    description=(
        "Fornecer uma estimativa de orçamento com base na seguinte pergunta do cliente: '{pergunta_usuario}'. "
        "Considere quantidades e tipos de serviços mencionados."
    ),
    expected_output="Uma estimativa de preço com base na dúvida apresentada.",
    agent=financeiro_agent,
    async_execution=False
)
