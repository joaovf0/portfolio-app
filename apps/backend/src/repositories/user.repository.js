const pool = require('../config/database');

async function findAll() {
    const result = await pool.query(
        `
        SELECT
            id,
            name,
            email,
            role,
            created_at,
            updated_at
        FROM users
        ORDER BY created_at DESC
        `
    );

    return result.rows;
}

module.exports = {
    findAll
};