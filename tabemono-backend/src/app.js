const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const foodRoutes = require('./routes/foodRoutes');
const questionsRoutes = require('./routes/questionsRoutes');

const app = express();

app.use(cors({
  origin: '*', // ในการใช้งานจริง ควรระบุ origin ที่อนุญาตให้ชัดเจน
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/questions', questionsRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));

module.exports = app;