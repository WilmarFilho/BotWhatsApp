import { getMessages } from '../services/messageService.js';

export const getChats = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const chats = await getMessages(connectionId);
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};