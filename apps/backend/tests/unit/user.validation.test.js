const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
    validateCreateUser
} = require('../../src/utils/user.validation');

test('should return no errors when input is valid', () => {
    const input = {
        name: 'QA User',
        email: 'qa@example.com',
        password: 'Password123'
    };

    const errors = validateCreateUser(input);

    assert.deepStrictEqual(errors, {});
});

test('should return no errors when name is 2 characters', () => {
    const input = {
        name: 'QA',
        email: 'qa@example.com',
        password: 'Password123'
    };

    const errors = validateCreateUser(input);

    assert.deepStrictEqual(errors, {});
});

test('should return no errors when name is 120 characters', () => {
    const input = {
        name: 'A'.repeat(120), // 120 characters
        email: 'qa@example.com',
        password: 'Password123'
    };

    const errors = validateCreateUser(input);

    assert.deepStrictEqual(errors, {});
});

test('should return a name error when name is missing', () => {
    const input = {
        email: 'qa@example.com',
        password: 'Password123'
    };

    const errors = validateCreateUser(input);

    assert.deepStrictEqual(errors, {
        name: 'Name is required'
    });
});

test('should return a name error when name is empty', () => {
    const input = {
        name: '',
        email: 'qa@example.com',
        password: 'Password123'
    };

    const errors = validateCreateUser(input);

    assert.deepStrictEqual(errors, {
        name: 'Name is required'
    });
});

test('should return a name error when name is whitespace only', () => {
    const input = {
        name: '    ',
        email: 'qa@example.com',
        password: 'Password123'
    };

    const errors = validateCreateUser(input);

    assert.deepStrictEqual(errors, {
        name: 'Name is required'
    });
});

test('should return a name error when name is too short', () => {
    const input = {
        name: 'A',
        email: 'qa@example.com',
        password: 'Password123'
    };

    const errors = validateCreateUser(input);

    assert.deepStrictEqual(errors, {
        name: 'Name must be at least 2 characters'
    });
});

test('should return a name error when name is too long', () => {
    const input = {
        name: 'A'.repeat(121), // 121 characters
        email: 'qa@example.com',
        password: 'Password123'
    };

    const errors = validateCreateUser(input);

    assert.deepStrictEqual(errors, {
        name: 'Name must not exceed 120 characters'
    });
});

test('should return no errors when email is valid', () => {
    const input = {
        name: 'QA User',
        email: 'qa@example.com',
        password: 'Password123'
    };

    const errors = validateCreateUser(input);

    assert.deepStrictEqual(errors, {});
});

test('should return an email error when email is missing', () => {
    const input = {
        name: 'QA User',
        password: 'Password123'
    };

    const errors = validateCreateUser(input);

    assert.deepStrictEqual(errors, {
        email: 'Email is required'
    });
});

test('should return an email error when email is empty', () => {
    const input = {
        name: 'QA User',
        email: '',
        password: 'Password123'
    };

    const errors = validateCreateUser(input);

    assert.deepStrictEqual(errors, {
        email: 'Email is required'
    });
});

test('should return an email error when email is whitespace only', () => {
    const input = {
        name: 'QA User',
        email: '   ',
        password: 'Password123'
    };

    const errors = validateCreateUser(input);

    assert.deepStrictEqual(errors, {
        email: 'Email is required'
    });
});

test('should return an email error when email is invalid', () => {
    const input = {
        name: 'QA User',
        email: 'invalid-email',
        password: 'Password123'
    };

    const errors = validateCreateUser(input);

    assert.deepStrictEqual(errors, {
        email: 'Email must be valid'
    });
});

test('should return no errors when password is valid', () => {
    const input = {
        name: 'QA User',
        email: 'qa@example.com',
        password: 'Password123'
    };

    const errors = validateCreateUser(input);

    assert.deepStrictEqual(errors, {});
});

test('should return no errors when password is exactly 8 characters', () => {
    const input = {
        name: 'QA User',
        email: 'qa@example.com',
        password: 'A'.repeat(8) // 8 characters
    };

    const errors = validateCreateUser(input);

    assert.deepStrictEqual(errors, {});
});

test('should return a password error when password is missing', () => {
    const input = {
        name: 'QA User',
        email: 'qa@example.com'
    };

    const errors = validateCreateUser(input);

    assert.deepStrictEqual(errors, {
        password: 'Password is required'
    });
});

test('should return a password error when password is empty', () => {
    const input = {
        name: 'QA User',
        email: 'qa@example.com',
        password: ''
    };

    const errors = validateCreateUser(input);

    assert.deepStrictEqual(errors, {
        password: 'Password is required'
    });
});

test('should return a password error when password is whitespace only', () => {
    const input = {
        name: 'QA User',
        email: 'qa@example.com',
        password: ' '.repeat(8)
    };

    const errors = validateCreateUser(input);

    assert.deepStrictEqual(errors, {
        password: 'Password is required'
    });
});

test('should return a password error when password is too short', () => {
    const input = {
        name: 'QA User',
        email: 'qa@example.com',
        password: 'A'.repeat(7) // 7 characters
    };

    const errors = validateCreateUser(input);

    assert.deepStrictEqual(errors, {
        password: 'Password must be at least 8 characters'
    });
});

test('should return a password error when password is not a string', () => {
    const input = {
        name: 'QA User',
        email: 'qa@example.com',
        password: 12345678
    };

    const errors = validateCreateUser(input);

    assert.deepStrictEqual(errors, {
        password: 'Password is required'
    });
});

test('should return multiple errors when multiple fields are invalid', () => {
    const input = {
        name: '',
        email: 'invalid-email',
        password: 'short'
    };

    const errors = validateCreateUser(input);

    assert.deepStrictEqual(errors, {
        name: 'Name is required',
        email: 'Email must be valid',
        password: 'Password must be at least 8 characters'
    });
});
