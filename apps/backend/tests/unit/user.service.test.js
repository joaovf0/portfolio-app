const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
    createUserService
} = require('../../src/services/user.service');


test('should return users from repository', async () => {
    const expectedUsers = [
        {
            id: 'user-1',
            name: 'QA User',
            email: 'qa@example.com',
            role: 'user'
        }
    ];

    let findAllCalls = 0;

    const fakeRepository = {
        findAll: async () => {
            findAllCalls++;
            return expectedUsers;
        }
    };

    const userService = createUserService({
        userRepository: fakeRepository
    });

    // Execute getAllUsers().
    const users = await userService.getAllUsers();

    // Verifique o resultado e o número de chamadas.
    assert.deepStrictEqual(users, expectedUsers);
    assert.strictEqual(findAllCalls, 1);
});


test('should create a user with normalized data and hashed password', async () => {
    // Arrange
    const input = {
        name: '  QA User  ',
        email: ' QA-TEST@EXAMPLE.COM ',
        password: 'Password123'
    };

    const calls = {
        validate: 0,
        findByEmail: 0,
        hashPassword: 0,
        create: 0
    };

    let validationInput;
    let searchedEmail;
    let hashedPasswordInput;
    let persistedUser;

    const fakeRepository = {
        findByEmail: async (email) => {
            calls.findByEmail++;
            searchedEmail = email;

            return null;
        },

        create: async (user) => {
            calls.create++;
            persistedUser = user;

            return {
                id: 'user-1',
                name: user.name,
                email: user.email,
                role: user.role
            };
        }
    };

    const fakeHashPassword = async (password) => {
        calls.hashPassword++;
        hashedPasswordInput = password;

        return `hashed-${password}`;
    };

    const fakeValidateCreateUser = (user) => {
        calls.validate++;
        validationInput = user;

        return {};
    };

    const userService = createUserService({
        userRepository: fakeRepository,
        hashPassword: fakeHashPassword,
        validateCreateUser: fakeValidateCreateUser
    });

    // Act
    const createdUser = await userService.createUser(input);

    // Assert: returned user
    assert.deepStrictEqual(createdUser, {
        id: 'user-1',
        name: 'QA User',
        email: 'qa-test@example.com',
        role: 'user'
    });

    // Assert: validation
    assert.deepStrictEqual(validationInput, input);

    // Assert: email normalization
    assert.strictEqual(searchedEmail, 'qa-test@example.com');

    // Assert: password hashing
    assert.strictEqual(hashedPasswordInput, 'Password123');

    // Assert: persisted data
    assert.deepStrictEqual(persistedUser, {
        name: 'QA User',
        email: 'qa-test@example.com',
        passwordHash: 'hashed-Password123',
        role: 'user'
    });

    // Assert: dependency calls
    assert.deepStrictEqual(calls, {
        validate: 1,
        findByEmail: 1,
        hashPassword: 1,
        create: 1
    });
});


test('should reject invalid user data without accessing the repository', async () => {
    const input = {
        name: '',
        email: 'invalid-email',
        password: 'short'
    };

    const calls = {
        validate: 0,
        findByEmail: 0,
        hashPassword: 0,
        create: 0
    };

    let validationInput;

    const fakeRepository = {
        findByEmail: async () => {
            calls.findByEmail++;
            return null;
        },

        create: async () => {
            calls.create++;
            return {};
        }
    };

    const fakeHashPassword = async () => {
        calls.hashPassword++;
        return 'fake-hash';
    };

    const fakeValidateCreateUser = (user) => {
        calls.validate++;
        validationInput = user;

        return {
            name: 'Name is required',
            email: 'Email must be valid',
            password: 'Password must be at least 8 characters'
        };
    };

    const userService = createUserService({
        userRepository: fakeRepository,
        hashPassword: fakeHashPassword,
        validateCreateUser: fakeValidateCreateUser
    });

    // Act & Assert
    await assert.rejects(
        userService.createUser(input),
        (error) => {
            assert.strictEqual(error.message, 'Validation failed');
            assert.strictEqual(error.statusCode, 400);

            assert.deepStrictEqual(error.details, {
                name: 'Name is required',
                email: 'Email must be valid',
                password: 'Password must be at least 8 characters'
            });

            return true;
        }
    );

    // Assert: validation received the original input
    assert.deepStrictEqual(validationInput, input);

    // Assert: dependency calls
    assert.deepStrictEqual(calls, {
        validate: 1,
        findByEmail: 0,
        hashPassword: 0,
        create: 0
    });
});

test('should reject creation if email already exists', async () => {

    const input = {
        name: 'QA User',
        email: ' QA-test@example.com ',
        password: 'Password123'
    };

    const calls = {
        validate: 0,
        findByEmail: 0,
        hashPassword: 0,
        create: 0
    };

    let validationInput;
    let searchedEmail;

    const fakeRepository = {
        findByEmail: async (email) => {
            calls.findByEmail++;
            searchedEmail = email;

            return { id: 'user-1', email };
        },

        create: async () => {
            calls.create++;
            return {};
        }
    };

    const fakeHashPassword = async () => {
        calls.hashPassword++;
        return 'fake-hash';
    };

    const fakeValidateCreateUser = (user) => {
        calls.validate++;
        validationInput = user;

        return {};
    };

    const userService = createUserService({
        userRepository: fakeRepository,
        hashPassword: fakeHashPassword,
        validateCreateUser: fakeValidateCreateUser
    });

    // Act & Assert
    await assert.rejects(
        userService.createUser(input),
        (error) => {
            assert.strictEqual(error.message, 'Email already exists');
            assert.strictEqual(error.statusCode, 409);

            return true;
        }
    );

    // Assert: validation received the original input
    assert.deepStrictEqual(validationInput, input);

    // Assert: email normalization
    assert.strictEqual(searchedEmail, 'qa-test@example.com');

    // Assert: dependency calls
    assert.deepStrictEqual(calls, {
        validate: 1,
        findByEmail: 1,
        hashPassword: 0,
        create: 0
    });
});

test('should ignore client-provided role when creating user', async () => {

    const input = {
        name: 'QA User',
        email: ' QA-test@example.com ',
        password: 'Password123',
        role: 'admin'
    };

    const calls = {
        validate: 0,
        findByEmail: 0,
        hashPassword: 0,
        create: 0
    };

    let validationInput;
    let searchedEmail;
    let persistedUser;

    const fakeRepository = {
        findByEmail: async (email) => {
            calls.findByEmail++;
            searchedEmail = email;

            return null;
        },

        create: async (user) => {
            calls.create++;
            persistedUser = user;

            return {
                id: 'user-1',
                name: user.name,
                email: user.email,
                role: user.role
            };
        }
    };

    const fakeHashPassword = async (password) => {
        calls.hashPassword++;
        return `hashed-${password}`;
    };

    const fakeValidateCreateUser = (user) => {
        calls.validate++;
        validationInput = user;

        return {};
    };

    const userService = createUserService({
        userRepository: fakeRepository,
        hashPassword: fakeHashPassword,
        validateCreateUser: fakeValidateCreateUser
    });

    // Act
    const createdUser = await userService.createUser(input);

    // Assert: returned user
    assert.deepStrictEqual(createdUser, {
        id: 'user-1',
        name: 'QA User',
        email: 'qa-test@example.com',
        role: 'user'
    });

    // Assert: validation received the original input
    assert.deepStrictEqual(validationInput, {
        name: 'QA User',
        email: ' QA-test@example.com ',
        password: 'Password123'
    });

    // Assert: email normalization
    assert.strictEqual(searchedEmail, 'qa-test@example.com');

    // Assert: persisted data should have role 'user' regardless of input
    assert.deepStrictEqual(persistedUser, {
        name: 'QA User',
        email: 'qa-test@example.com',
        passwordHash: 'hashed-Password123',
        role: 'user'
    });

    // Assert: dependency calls
    assert.deepStrictEqual(calls, {
        validate: 1,
        findByEmail: 1,
        hashPassword: 1,
        create: 1
    });
});

test('should not create user if password hashing fails', async () => {

    const input = {
        name: 'QA User',
        email: 'qa-test@example.com',
        password: 'Password123'
    };

    const calls = {
        validate: 0,
        findByEmail: 0,
        hashPassword: 0,
        create: 0
    };

    let validationInput;
    let searchedEmail;

    const fakeRepository = {
        findByEmail: async (email) => {
            calls.findByEmail++;
            searchedEmail = email;

            return null;
        },

        create: async () => {
            calls.create++;
            return {};
        }
    };

    const hashError = new Error('Password hashing failed');

    const fakeHashPassword = async () => {
        calls.hashPassword++;
        throw hashError;
    };

    const fakeValidateCreateUser = (user) => {
        calls.validate++;
        validationInput = user;

        return {};
    };

    const userService = createUserService({
        userRepository: fakeRepository,
        hashPassword: fakeHashPassword,
        validateCreateUser: fakeValidateCreateUser
    });

    // Act & Assert
    await assert.rejects(
        userService.createUser(input),
        (error) => {
            assert.strictEqual(error, hashError);
            return true;
        }
    );

    // Assert: validation received the original input
    assert.deepStrictEqual(validationInput, input);

    // Assert: email normalization
    assert.strictEqual(searchedEmail, 'qa-test@example.com');

    // Assert: dependency calls
    assert.deepStrictEqual(calls, {
        validate: 1,
        findByEmail: 1,
        hashPassword: 1,
        create: 0
    });
});

test('should not create user if email lookup fails', async () => {

    const input = {
        name: 'QA User',
        email: ' QA-test@example.com ',
        password: 'Password123'
    };

    const calls = {
        validate: 0,
        findByEmail: 0,
        hashPassword: 0,
        create: 0
    };

    let validationInput;
    let searchedEmail;

    const lookupError = new Error('Email lookup failed');

    const fakeRepository = {
        findByEmail: async (email) => {
            calls.findByEmail++;
            searchedEmail = email;

            throw lookupError;
        },

        create: async () => {
            calls.create++;
            return {};
        }
    };

    const fakeHashPassword = async () => {
        calls.hashPassword++;
        return 'hashed-Password123';
    };

    const fakeValidateCreateUser = (user) => {
        calls.validate++;
        validationInput = user;

        return {};
    };

    const userService = createUserService({
        userRepository: fakeRepository,
        hashPassword: fakeHashPassword,
        validateCreateUser: fakeValidateCreateUser
    });

    // Act & Assert
    await assert.rejects(
        userService.createUser(input),
        (error) => {
            assert.strictEqual(error, lookupError);
            return true;
        }
    );

    // Assert: validation received the original input
    assert.deepStrictEqual(validationInput, input);

    // Assert: email normalization
    assert.strictEqual(searchedEmail, 'qa-test@example.com');

    // Assert: dependency calls
    assert.deepStrictEqual(calls, {
        validate: 1,
        findByEmail: 1,
        hashPassword: 0,
        create: 0
    });
});

test('should propagate error if user creation fails', async () => {

    const input = {
        name: 'QA User',
        email: ' QA-test@example.com ',
        password: 'Password123'
    };

    const calls = {
        validate: 0,
        findByEmail: 0,
        hashPassword: 0,
        create: 0
    };

    let validationInput;
    let searchedEmail;
    let persistedUser;

    const creationError = new Error('User creation failed');

    const fakeRepository = {
        findByEmail: async (email) => {
            calls.findByEmail++;
            searchedEmail = email;

            return null;
        },

        create: async (user) => {
            calls.create++;
            persistedUser = user;

            throw creationError;
        }
    };

    const fakeHashPassword = async () => {
        calls.hashPassword++;
        return 'hashed-Password123';
    };

    const fakeValidateCreateUser = (user) => {
        calls.validate++;
        validationInput = user;

        return {};
    };

    const userService = createUserService({
        userRepository: fakeRepository,
        hashPassword: fakeHashPassword,
        validateCreateUser: fakeValidateCreateUser
    });

    // Act & Assert
    await assert.rejects(
        userService.createUser(input),
        (error) => {
            assert.strictEqual(error, creationError);
            return true;
        }
    );

    // Assert: validation received the original input
    assert.deepStrictEqual(validationInput, input);

    // Assert: email normalization
    assert.strictEqual(searchedEmail, 'qa-test@example.com');

    // Assert: persisted user
    assert.deepStrictEqual(persistedUser, {
        name: 'QA User',
        email: 'qa-test@example.com',
        passwordHash: 'hashed-Password123',
        role: 'user'
    });

    // Assert: dependency calls
    assert.deepStrictEqual(calls, {
        validate: 1,
        findByEmail: 1,
        hashPassword: 1,
        create: 1
    });
});

test('should propagate error if fetching users fails', async () => {
    const fetchError = new Error('Failed to fetch users');
    let findAllCalls = 0;

    const fakeRepository = {
        findAll: async () => {
            findAllCalls++;
            throw fetchError;
        }
    };

    const userService = createUserService({
        userRepository: fakeRepository
    });

    // Act & Assert
    await assert.rejects(
        userService.getAllUsers(),
        (error) => {
            assert.strictEqual(error, fetchError);
            return true;
        }
    );

    // Assert: repository calls
    assert.strictEqual(findAllCalls, 1);
});