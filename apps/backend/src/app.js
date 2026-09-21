const express = require('express');
const healthRoutes = require('./routes/health.routes');
const usersRoutes = require('./routes/users.routes');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'UP',
        message: 'QA Portfolio API is running'
    });
});

app.use('/api', healthRoutes);
app.use('/api', usersRoutes);

module.exports = app;