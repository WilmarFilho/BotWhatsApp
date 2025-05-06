import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from crewai import Crew
from agents.atendimento_agent import atendimento_agent
from agents.financeiro_agent import financeiro_agent
from tasks.atendimento_tasks import atendimento_task
from tasks.financeiro_tasks import financeiro_task

# Carregar variáveis do arquivo .env
load_dotenv()

# Definindo a chave da OpenAI a partir da variável de ambiente
openai_api_key = os.getenv("OPENAI_API_KEY")
if openai_api_key is None:
    raise ValueError("A chave da OpenAI não foi encontrada na variável de ambiente!")

# Inicializa o servidor Flask
app = Flask(__name__)

@app.route('/api/crewai', methods=['POST'])
def processar_mensagem():
    data = request.get_json()
    mensagem = data.get('message', '')

    if not mensagem:
        return jsonify({'error': 'Mensagem ausente'}), 400

    print(f"📩 Mensagem recebida: {mensagem}")

    # Monta a equipe e as tarefas
    crew = Crew(
        agents=[atendimento_agent, financeiro_agent],
        tasks=[atendimento_task, financeiro_task],
        verbose=True
    )

    # Executa o processamento
    print("🤖 Processando com CrewAI...")
    resposta = crew.kickoff(inputs={"pergunta_usuario": mensagem})

    # Verifica se a resposta é um objeto do tipo CrewOutput
    if isinstance(resposta, dict):
        # Extraímos o campo que contém a resposta relevante
        resposta_texto = resposta.get('response', 'Nenhuma resposta encontrada.')
    else:
        # Caso a resposta não seja um dicionário, convertemos diretamente para string
        resposta_texto = str(resposta)

    # Mostra no terminal e retorna como resposta
    print("📝 Resposta gerada pela CrewAI:\n", resposta_texto)
    return jsonify({"response": resposta_texto})

# Roda o servidor
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
