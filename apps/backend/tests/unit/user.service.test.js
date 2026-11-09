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
