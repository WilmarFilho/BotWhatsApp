import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

// Cadastro
export const registerUser = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    // Verifica se o e-mail já está cadastrado
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email já cadastrado' });
    }

    const passwordHash = password

    // Criação do usuário
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
      },
    });

    // Geração do token JWT
    const token = jwt.sign({ userId: newUser.id, email: newUser.email }, JWT_SECRET, {
      expiresIn: '2h',
    });

    // Salvar token na tabela Session
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 horas
    await prisma.session.create({
      data: {
        token,
        isActive: true,
        expiresAt,
      },
    });

    // Retorna resposta
    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao cadastrar usuário' });
  }
};

// Login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.passwordHash !== password) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '2h' }
    );


    await prisma.session.create({
      data: {
        token,
        isActive: true,
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 horas
      },
    });

    res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao fazer login' });
  }
};
