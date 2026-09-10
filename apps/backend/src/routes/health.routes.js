const express = require('express');
const pool = require('../config/database');

const router = express.Router();

router.get('/health/db', async (req, res) => {
    try {
        await pool.query('SELECT 1');

        res.status(200).json({
            status: 'UP',
            database: 'UP'
        });
    } catch (error) {
        console.error('Database health check failed:', error.message);

        res.status(503).json({
            status: 'DOWN',
            database: 'DOWN'
        });
    }
});

module.exports = router;
