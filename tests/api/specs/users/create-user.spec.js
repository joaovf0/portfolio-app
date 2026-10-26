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
        let createdUser;
        try {
            const response = await request.post('/api/users', {
                data: {
                    name: 'API Test User'
                }
            });

            const body = await response.json();
            createdUser = body.id ? body : undefined;

            expect(response.status()).toBe(400);
            expect(body.message).toBe('Validation failed');
            expect(body.details.email).toBe('Email is required');
            expect(body.details.password).toBe('Password is required');

        } finally {
            if (createdUser) {
                await deleteUserById(createdUser.id);
            }
        }
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
        let createdUser;

        try {
            const response = await request.post('/api/users', {
                data: {
                    name: 'API Test User',
                    email: 'email-invalido',
                    password: 'Password123'
                }
            });

            const body = await response.json();
            createdUser = body.id ? body : undefined;

            expect(response.status()).toBe(400);
            expect(body.message).toBe('Validation failed');
            expect(body.details.email).toBe('Email must be valid');

        } finally {
            if (createdUser) {
                await deleteUserById(createdUser.id);
            }
        }
    });

    test('should return 400 when email has no dot', async ({ request }) => {
        let createdUser;

        try {
            const response = await request.post('/api/users', {
                data: {
                    name: 'API Test User',
                    email: 'qa@examplecom',
                    password: 'Password123'
                }
            });

            const body = await response.json();
            createdUser = body.id ? body : undefined;

            expect(response.status()).toBe(400);
            expect(body.message).toBe('Validation failed');
            expect(body.details.email).toBe('Email must be valid');
        } finally {
            if (createdUser) {
                await deleteUserById(createdUser.id);
            }
        }
    });

    test('should return 400 when password is too short', async ({ request }) => {
        let createdUser;

        try {

            const response = await request.post('/api/users', {
                data: {
                    name: 'API Test User',
                    email: 'short-password@example.com',
                    password: '123'
                }
            });

            const body = await response.json();
            createdUser = body.id ? body : undefined;

            expect(response.status()).toBe(400);
            expect(body.message).toBe('Validation failed');
            expect(body.details.password).toBe(
                'Password must be at least 8 characters'
            );

        } finally {
            if (createdUser) {
                await deleteUserById(createdUser.id);
            }
        }
    });

    test('should normalize email when creating a user', async ({ request }) => {
        const uniqueEmail = ` QA-${Date.now()}@EXAMPLE.COM `;

        let createdUser;

        try {
            const response = await request.post('/api/users', {
                data: {
                    name: 'Email Normalization Test',
                    email: uniqueEmail,
                    password: 'Password123'
                }
            });

            const body = await response.json();
            createdUser = body.id ? body : undefined;

            expect(response.status()).toBe(201);
            expect(body.email).toBe(uniqueEmail.trim().toLowerCase());
        } finally {
            if (createdUser) {
                await deleteUserById(createdUser.id);
            }
        }
    });

    test('should return 409 for duplicate emails with different casing', async ({ request }) => {
        const uniqueEmail = `QA-${Date.now()}@example.com`;
        let createdUser;

        try {
            const firstResponse = await request.post('/api/users', {
                data: {
                    name: 'First User',
                    email: uniqueEmail,
                    password: 'Password123'
                }
            });

            const firstBody = await firstResponse.json();
            createdUser = firstBody.id ? firstBody : undefined;

            expect(firstResponse.status()).toBe(201);

            const secondResponse = await request.post('/api/users', {
                data: {
                    name: 'Second User',
                    email: uniqueEmail.toLowerCase(),
                    password: 'Password123'
                }
            });

            expect(secondResponse.status()).toBe(409);

            const secondBody = await secondResponse.json();
            expect(secondBody.message).toBe('Email already exists');
        } finally {
            if (createdUser) {
                await deleteUserById(createdUser.id);
            }
        }
    });

    test('should create user with 2 character name', async ({ request }) => {
        const uniqueEmail = `qa-${Date.now()}@example.com`;
        let createdUser;

        try {

            const response = await request.post('/api/users', {
                data: {
                    name: 'QA',
                    email: uniqueEmail,
                    password: 'Password123'
                }
            });

            const body = await response.json();
            createdUser = body.id ? body : undefined;

            expect(response.status()).toBe(201);
            expect(body.id).toBeDefined();
            expect(body.name).toBe('QA');
        }
        finally {
            if (createdUser) {
                await deleteUserById(createdUser.id);
            }
        }
    });

    test('should return 400 for a name shorter than 2 characters', async ({ request }) => {
        const uniqueEmail = `qa-${Date.now()}@example.com`;
        let createdUser;

        try {

            const response = await request.post('/api/users', {
                data: {
                    name: 'Q',
                    email: uniqueEmail,
                    password: 'Password123'
                }
            });

            const body = await response.json();
            createdUser = body.id ? body : undefined;

            expect(response.status()).toBe(400);
            expect(body.message).toBe('Validation failed');
            expect(body.details.name).toBe(
                'Name must be at least 2 characters'
            );
        }
        finally {
            if (createdUser) {
                await deleteUserById(createdUser.id);
            }
        }
    });

    test('should create user with 120 character name', async ({ request }) => {
        const uniqueEmail = `qa-${Date.now()}@example.com`;
        const longName = 'A'.repeat(120);
        let createdUser;

        try {

            const response = await request.post('/api/users', {
                data: {
                    name: longName,
                    email: uniqueEmail,
                    password: 'Password123'
                }
            });

            const body = await response.json();
            createdUser = body.id ? body : undefined;

            expect(response.status()).toBe(201);
            expect(body.id).toBeDefined();
            expect(body.name).toBe(longName);
        }
        finally {
            if (createdUser) {
                await deleteUserById(createdUser.id);
            }
        }
    });

    test('should return 400 for a name longer than 120 characters', async ({ request }) => {
        const uniqueEmail = `qa-${Date.now()}@example.com`;
        const longName = 'A'.repeat(121);
        let createdUser;

        try {

            const response = await request.post('/api/users', {
                data: {
                    name: longName,
                    email: uniqueEmail,
                    password: 'Password123'
                }
            });

            const body = await response.json();
            createdUser = body.id ? body : undefined;

            expect(response.status()).toBe(400);
            expect(body.message).toBe('Validation failed');
            expect(body.details.name).toBe(
                'Name must not exceed 120 characters'
            );
        }
        finally {
            if (createdUser) {
                await deleteUserById(createdUser.id);
            }
        }
    });

    test('should return 400 for a password shorter than 8 characters', async ({ request }) => {
        const uniqueEmail = `qa-${Date.now()}@example.com`;
        let createdUser;

        try {

            const response = await request.post('/api/users', {
                data: {
                    name: 'QA User',
                    email: uniqueEmail,
                    password: 'Pass123'
                }
            });

            const body = await response.json();
            createdUser = body.id ? body : undefined;

            expect(response.status()).toBe(400);
            expect(body.message).toBe('Validation failed');
            expect(body.details.password).toBe(
                'Password must be at least 8 characters'
            );
        }
        finally {
            if (createdUser) {
                await deleteUserById(createdUser.id);
            }
        }
    });

    test('should create user with 8 character password', async ({ request }) => {
        const uniqueEmail = `qa-${Date.now()}@example.com`;
        const shortPassword = 'Password';
        let createdUser;

        try {

            const response = await request.post('/api/users', {
                data: {
                    name: 'QA User',
                    email: uniqueEmail,
                    password: shortPassword
                }
            });

            const body = await response.json();
            createdUser = body.id ? body : undefined;

            expect(response.status()).toBe(201);
            expect(body.id).toBeDefined();
            expect(body).not.toHaveProperty('password');
            expect(body).not.toHaveProperty('password_hash');
        }
        finally {
            if (createdUser) {
                await deleteUserById(createdUser.id);
            }
        }
    });

    test('should return 400 for an empty password', async ({ request }) => {
        const uniqueEmail = `qa-${Date.now()}@example.com`;
        let createdUser;

        try {

            const response = await request.post('/api/users', {
                data: {
                    name: 'QA User',
                    email: uniqueEmail,
                    password: ''
                }
            });

            const body = await response.json();
            createdUser = body.id ? body : undefined;

            expect(response.status()).toBe(400);
            expect(body.message).toBe('Validation failed');
            expect(body.details.password).toBe(
                'Password is required'
            );
        }
        finally {
            if (createdUser) {
                await deleteUserById(createdUser.id);
            }
        }
    });

    test('should return 400 for a password containing only whitespace', async ({ request }) => {
        const uniqueEmail = `qa-${Date.now()}@example.com`;
        let createdUser;

        try {

            const response = await request.post('/api/users', {
                data: {
                    name: 'QA User',
                    email: uniqueEmail,
                    password: ' '.repeat(8)
                }
            });

            const body = await response.json();
            createdUser = body.id ? body : undefined;

            expect(response.status()).toBe(400);
            expect(body.message).toBe('Validation failed');
            expect(body.details.password).toBe(
                'Password is required'
            );
        }
        finally {
            if (createdUser) {
                await deleteUserById(createdUser.id);
            }
        }
    });

    test('should return 400 for an email containing only whitespace', async ({ request }) => {
        let createdUser;

        try {

            const response = await request.post('/api/users', {
                data: {
                    name: 'QA User',
                    email: ' '.repeat(8),
                    password: 'Password123'
                }
            });

            const body = await response.json();
            createdUser = body.id ? body : undefined;

            expect(response.status()).toBe(400);
            expect(body.message).toBe('Validation failed');
            expect(body.details.email).toBe('Email is required');
        }
        finally {
            if (createdUser) {
                await deleteUserById(createdUser.id);
            }
        }
    });

    test('should return 400 when email contains whitespace', async ({ request }) => {
        let createdUser;

        try {

            const response = await request.post('/api/users', {
                data: {
                    name: 'QA User',
                    email: 'qa user@example.com',
                    password: 'Password123'
                }
            });

            const body = await response.json();
            createdUser = body.id ? body : undefined;

            expect(response.status()).toBe(400);
            expect(body.message).toBe('Validation failed');
            expect(body.details.email).toBe('Email must be valid');
        }
        finally {
            if (createdUser) {
                await deleteUserById(createdUser.id);
            }
        }
    });
});