const { test, expect } = require('../../fixtures/user.fixture');

test.describe('GET /api/users', () => {
    test('should return a list of users', async ({ request }) => {
        const response = await request.get('/api/users');

        expect(response.status()).toBe(200);

        const body = await response.json();

        expect(Array.isArray(body)).toBe(true);

        for (const user of body) {
            expect(user).toHaveProperty('id');
            expect(user).toHaveProperty('name');
            expect(user).toHaveProperty('email');
            expect(user).toHaveProperty('role');
            expect(user).toHaveProperty('created_at');
            expect(user).toHaveProperty('updated_at');

            expect(user).not.toHaveProperty('password');
            expect(user).not.toHaveProperty('password_hash');
        }
    });

    test('should return a previously created user', async ({ request, user }) => {
        const response = await request.get('/api/users');

        expect(response.status()).toBe(200);

        const users = await response.json();

        const foundUser = users.find(
            (item) => item.id === user.id
        );

        expect(foundUser).toBeDefined();
        expect(foundUser.name).toBe('Fixture Test User');
        expect(foundUser.email).toBe(user.email);

        expect(foundUser).not.toHaveProperty('password');
        expect(foundUser).not.toHaveProperty('password_hash');
    });
});