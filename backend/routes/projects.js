const express = require('express');
const prisma  = require('../lib/prisma');
const auth    = require('../middleware/authMiddleware');

const router = express.Router();

// GET all projects for logged in user
router.get('/', auth, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: req.user.id },
          { members: { some: { userId: req.user.id } } }
        ]
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { tickets: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(projects);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

// CREATE project
router.post('/', auth, async (req, res) => {
  const { title, description } = req.body;

  try {
    const project = await prisma.project.create({
      data: {
        title,
        description,
        ownerId: req.user.id,
        members: {
          create: { userId: req.user.id }
        }
      },
      include: {
        owner: { select: { id: true, name: true, email: true } }
      }
    });

    res.status(201).json(project);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE project
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not allowed' });
    }

    await prisma.project.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Project deleted' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;