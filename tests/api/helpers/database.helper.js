
const { Client } = require('pg');

async function deleteUserById(userId) {
    const client = new Client({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.POSTGRES_DB,
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD
    });

    await client.connect();

    try {
        const result = await client.query(
            'DELETE FROM users WHERE id = $1',
            [userId]
        );

        if (result.rowCount !== 1) {
            throw new Error(
                `Expected to delete 1 user, but deleted ${result.rowCount}`
            );
        }
    } finally {
        await client.end();
    }
}

module.exports = {
    deleteUserById
};
