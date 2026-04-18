const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use('/api/auth',     require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tickets',  require('./routes/tickets'));
app.use('/api/comments', require('./routes/comments'));

app.get('/', (req, res) => {
  res.json({ message: 'Bug Tracker API running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});