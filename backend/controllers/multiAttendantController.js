export const connectMultiAttendant = async (req, res) => {
    const { agentId, message } = req.body;
  
    try {
      // Simulação de processamento do atendimento múltiplo
      const response = `Atendente ${agentId} irá responder: ${message}`;
      
      res.status(200).json({ response });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao conectar com o modo multiatendente' });
    }
  };
  