const express = require('express');
const prisma  = require('../lib/prisma');
const auth    = require('../middleware/authMiddleware');

const router = express.Router();

// GET all tickets for a project
router.get('/:projectId', auth, async (req, res) => {
  try {
    const { status, priority, search } = req.query;

    const where = { projectId: req.params.projectId };

    if (status)   where.status   = status;
    if (priority) where.priority = priority;
    if (search)   where.title    = { contains: search, mode: 'insensitive' };

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        assignee:  { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(tickets);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

// CREATE ticket
router.post('/', auth, async (req, res) => {
  const { title, description, priority, projectId, assigneeId } = req.body;

  try {
    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        priority:    priority || 'Medium',
        projectId,
        assigneeId:  assigneeId || null,
        createdById: req.user.id
      },
      include: {
        assignee:  { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } }
      }
    });

    res.status(201).json(ticket);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

// UPDATE ticket
router.put('/:id', auth, async (req, res) => {
  try {
    const ticket = await prisma.ticket.update({
      where: { id: req.params.id },
      data:  req.body,
      include: {
        assignee: { select: { id: true, name: true, email: true } }
      }
    });

    res.json(ticket);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE ticket
router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.ticket.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Ticket deleted' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;