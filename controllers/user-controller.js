const { prisma } = require('../prisma/prisma-client');
const bcrypt = require('bcryptjs');
const jdenticon = require('jdenticon');
const path = require('path');
const fs = require('fs');

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
    res.send('login ok');
  },

  getUserById: async (req, res) => {
    res.send('getUserById ok');
  },

  updateUser: async (req, res) => {
    res.send('updateUser ok');
  },

  currentUser: async (req, res) => {
    res.send('currentUser ok');
  },
};

module.exports = {
  UserController,
};
