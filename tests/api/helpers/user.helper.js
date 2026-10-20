
const { deleteUserById } = require('./database.helper');

async function createUser(request) {
    const uniqueEmail = `fixture-${Date.now()}@example.com`;

    const response = await request.post('/api/users', {
        data: {
            name: 'Fixture Test User',
            email: uniqueEmail,
            password: 'Password123'
        }
    });

    const body = await response.json();

    if (response.status() !== 201) {
        if (body.id){
            await deleteUserById(body.id);
        }

        throw new Error(
            `Failed to create test user. Expected status 201, received ${response.status()}`
        );
    }

    return body;
}

module.exports = {
    createUser
};
