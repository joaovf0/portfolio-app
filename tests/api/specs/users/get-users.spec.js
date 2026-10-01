const { test, expect } = require('@playwright/test');

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

    test('should return a previously created user', async ({ request }) => {
        const uniqueEmail = `get-user-${Date.now()}@example.com`;

        const createResponse = await request.post('/api/users', {
            data: {
                name: 'GET Test User',
                email: uniqueEmail,
                password: 'Password123'
            }
        });

        expect(createResponse.status()).toBe(201);

        const createdUser = await createResponse.json();

        const getResponse = await request.get('/api/users');

        expect(getResponse.status()).toBe(200);

        const users = await getResponse.json();

        const user = users.find(
            (item) => item.id === createdUser.id
        );

        expect(user).toBeDefined();
        expect(user.name).toBe('GET Test User');
        expect(user.email).toBe(uniqueEmail);

        expect(user).not.toHaveProperty('password');
        expect(user).not.toHaveProperty('password_hash');
    });
});