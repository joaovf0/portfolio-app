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

async function create({ name, email, passwordHash, role }) {
    const result = await pool.query(
        `
        INSERT INTO users (
            name,
            email,
            password_hash,
            role
        )
        VALUES ($1, $2, $3, $4)
        RETURNING
            id,
            name,
            email,
            role,
            created_at,
            updated_at
        `,
        [name, email, passwordHash, role]
    );

    return result.rows[0];
}

async function findByEmail(email) {
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
        WHERE email = $1
        LIMIT 1
        `,
        [email]
    );

    return result.rows[0] || null;
}

module.exports = {
    findAll,
    findByEmail,
    create
};