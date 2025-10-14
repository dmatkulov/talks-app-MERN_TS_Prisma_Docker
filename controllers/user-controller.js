const { prisma } = require('../prisma/prisma-client');
const bcrypt = require('bcryptjs');
const jdenticon = require('jdenticon');
const path = require('path');
const fs = require('fs');
const { sign } = require('jsonwebtoken');
require('dotenv').config();

const UserController = {
  register: async (req, res) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ error: 'Все поля обязательны для заполнения!' });
    }

    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });

      if (existingUser) {
        return res.status(400).json({ error: 'Пользователь уже существует!' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const png = jdenticon.toPng(name, 200);
      const avatarName = `${name}_${Date.now()}.png`;
      const avatarPath = path.join(__dirname, '../uploads', avatarName);
      fs.writeFileSync(avatarPath, png);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          avatarUrl: `/upload/${avatarPath}`,
        },
      });

      res.send(user);
    } catch (error) {
      console.log('Error in register: ', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  login: async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Все поля обязательны!!' });
    }

    try {
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        return res.status(400).json({ error: 'Неверный логин или пароль!' });
      }

      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        return res.status(400).json({ error: 'Неверный логин или пароль!' });
      }

      const token = sign({ userId: user.id }, process.env.SECRET_KEY);
      res.send({ token });
    } catch (e) {
      console.error('Login error', e);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  getUserById: async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          following: true,
          followers: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден!' });
      }

      const isFollowing = await prisma.follows.findFirst({
        where: {
          AND: [{ followerId: userId }, { followingId: id }],
        },
      });

      res.send({ ...user, isFollowing: Boolean(isFollowing) });
    } catch (error) {
      console.error('Get Current Error', error);

      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  updateUser: async (req, res) => {
    const { id } = req.params;
    const { email, name, dateOfBirth, bio, location } = req.body;

    let filePath;

    if (req.file && req.file.path) {
      filePath = req.file.path;
    }

    if (id !== req.user.userId) {
      return res.status(403).json({ error: 'Нет доступа!' });
    }

    try {
      if (email) {
        const existingEmail = await prisma.user.findFirst({ where: { email } });

        if (existingEmail) {
          return res.status(400).json({ error: 'Почта уже используется!' });
        }
      }

      const user = await prisma.user.update({
        where: { id },
        data: {
          email: email || undefined,
          name: name || undefined,
          avatarUrl: filePath ? `/${filePath}` : undefined,
          dataOfBirth: dateOfBirth || undefined,
          bio: bio || undefined,
          location: location || undefined,
        },
      });

      res.json(user);
    } catch (e) {
      console.error('Update User Error', e);

      res.status(500).json({ error: 'Internal Server Error!' });
    }
  },

  currentUser: async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        include: {
          followers: {
            include: {
              follower: true,
            },
          },
          following: {
            include: {
              following: true,
            },
          },
        },
      });

      if (!user) {
        return res
          .status(400)
          .json({ error: 'Не удалось найти пользователя!' });
      }

      res.json(user);
    } catch (e) {
      console.error('Curren Error', e);

      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};

module.exports = {
  UserController,
};
