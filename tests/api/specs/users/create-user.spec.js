const { test, expect } = require('@playwright/test');

test.describe('POST /api/users', () => {
    test('should create a user successfully', async ({ request }) => {
        const uniqueEmail = `qa-${Date.now()}@example.com`;

        const response = await request.post('/api/users', {
            data: {
                name: 'API Test User',
                email: uniqueEmail,
                password: 'Password123'
            }
        });

        expect(response.status()).toBe(201);

        const body = await response.json();

        expect(body).toHaveProperty('id');
        expect(body.name).toBe('API Test User');
        expect(body.email).toBe(uniqueEmail);
        expect(body.role).toBe('user');

        expect(body).not.toHaveProperty('password');
        expect(body).not.toHaveProperty('password_hash');
    });

    test('should return 400 when required fields are missing', async ({ request }) => {
        const response = await request.post('/api/users', {
            data: {
                name: 'API Test User'
            }
        });

        expect(response.status()).toBe(400);

        const body = await response.json();

        expect(body.message).toBe(
            'Name, email and password are required'
        );
    });

    test('should return 409 when email already exists', async ({ request }) => {
        const uniqueEmail = `duplicate-${Date.now()}@example.com`;

        const firstResponse = await request.post('/api/users', {
            data: {
                name: 'First User',
                email: uniqueEmail,
                password: 'Password123'
            }
        });

        expect(firstResponse.status()).toBe(201);

        const secondResponse = await request.post('/api/users', {
            data: {
                name: 'Second User',
                email: uniqueEmail,
                password: 'Password123'
            }
        });

        expect(secondResponse.status()).toBe(409);

        const body = await secondResponse.json();

        expect(body.message).toBe('Email already exists');
    });
});