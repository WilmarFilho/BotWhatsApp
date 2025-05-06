export const connectIA = async (req, res) => {
    const { message } = req.body;
  
    try {
      // Aqui você conecta à sua IA (exemplo de resposta da IA)
      const response = `Resposta automatizada para: ${message}`;
      
      res.status(200).json({ response });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao conectar com a IA' });
    }
  };
  