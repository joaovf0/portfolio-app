async function createUser(request) {
    const uniqueEmail = `fixture-${Date.now()}@example.com`;

    const response = await request.post('/api/users', {
        data: {
            name: 'Fixture Test User',
            email: uniqueEmail,
            password: 'Password123'
        }
    });

    return response.json();
}

module.exports = {
    createUser
};