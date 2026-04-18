const express = require('express');
const prisma  = require('../lib/prisma');
const auth    = require('../middleware/authMiddleware');

const router = express.Router();

// GET comments for a ticket
router.get('/:ticketId', auth, async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { ticketId: req.params.ticketId },
      include: {
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json(comments);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

// ADD comment
router.post('/', auth, async (req, res) => {
  const { ticketId, text } = req.body;

  try {
    const comment = await prisma.comment.create({
      data: {
        ticketId,
        userId: req.user.id,
        text
      },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });

    res.status(201).json(comment);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE comment
router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.comment.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Comment deleted' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;