const { test, expect } = require('@playwright/test');
const { deleteUserById } = require('../../helpers/database.helper');

test.describe('POST /api/users', () => {
    test('should create a user successfully', async ({ request }) => {
        const uniqueEmail = `qa-${Date.now()}@example.com`;
        let createdUser;
        
        try {

            const response = await request.post('/api/users', {
                data: {
                    name: 'API Test User',
                    email: uniqueEmail,
                    password: 'Password123'
                }
            });

            const body = await response.json();
            createdUser = body.id ? body : undefined;
            
            expect(response.status()).toBe(201);

            expect(body.id).toBeDefined();
            expect(body.name).toBe('API Test User');
            expect(body.email).toBe(uniqueEmail);
            expect(body.role).toBe('user');

            expect(body).not.toHaveProperty('password');
            expect(body).not.toHaveProperty('password_hash');
        } 
        finally {
            if (createdUser) {
                await deleteUserById(createdUser.id);
            }
        }
    });

    test('should return 400 when required fields are missing', async ({ request }) => {
        const response = await request.post('/api/users', {
            data: {
                name: 'API Test User'
            }
        });

        expect(response.status()).toBe(400);

        const body = await response.json();

        expect(body.message).toBe('Validation failed');
        expect(body.details.email).toBe('Email is required');
        expect(body.details.password).toBe('Password is required');
    });

    
    test('should return 409 when email already exists', async ({ request }) => {
        const uniqueEmail = `duplicate-${Date.now()}@example.com`;
        let createdUser;

        try {
            const firstResponse = await request.post('/api/users', {
                data: {
                    name: 'First User',
                    email: uniqueEmail,
                    password: 'Password123'
                }
            });

            expect(firstResponse.status()).toBe(201);

            createdUser = await firstResponse.json();

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
        } finally {
            if (createdUser) {
                await deleteUserById(createdUser.id);
            }
        }
    });


    test('should return 400 when email is invalid', async ({ request }) => {
        const response = await request.post('/api/users', {
            data: {
                name: 'API Test User',
                email: 'email-invalido',
                password: 'Password123'
            }
        });

        expect(response.status()).toBe(400);

        const body = await response.json();

        expect(body.message).toBe('Validation failed');
        expect(body.details.email).toBe('Email must be valid');
    });

    test('should return 400 when password is too short', async ({ request }) => {
        const response = await request.post('/api/users', {
            data: {
                name: 'API Test User',
                email: 'short-password@example.com',
                password: '123'
            }
        });

        expect(response.status()).toBe(400);

        const body = await response.json();

        expect(body.message).toBe('Validation failed');
        expect(body.details.password).toBe(
            'Password must be at least 8 characters'
        );
    });
});