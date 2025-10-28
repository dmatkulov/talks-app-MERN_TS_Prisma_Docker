const { prisma } = require('../prisma/prisma-client');

const FollowController = {
  followUser: async (req, res) => {
    const { followingId } = req.body;
    const userId = req.user.userId;

    if (followingId === userId) {
      return res.status(500).json({ error: 'Вы не можете подписаться на себя!' });
    }

    try {
      const existingSubscription = await prisma.follows.findFirst({
        where: {
          AND: [
            { followerId: userId }, { followingId },
          ],
        },
      });

      if (existingSubscription) {
        return res.status(400).json({ error: 'Подписка уже существует!' });
      }

      await prisma.follows.create({
        data: {
          follower: { connect: { id: userId } },
          following: { connect: { id: followingId } },
        },
      });

      res.status(201).json({ message: 'Подписка создана!' });
    } catch (e) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },
  unFollowUser: async (req, res) => {
    const { followingId } = req.params;
    const userId = req.user.userId;

    try {
      const follows = await prisma.follows.findFirst({
        where: {
          AND: [
            { followerId: userId }, { followingId },
          ],
        },
      });

      if (!follows) {
        return res.status(404).json({ error: 'Записть не найдена!' });
      }

      await prisma.follows.delete({
        where: { id: follows.id },
      });

      res.status(201).json({ message: 'Вы отписались!' });
    } catch (e) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};

module.exports = FollowController;