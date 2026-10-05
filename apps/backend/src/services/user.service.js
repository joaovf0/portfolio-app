const userRepository = require('../repositories/user.repository');
const { hashPassword } = require('../utils/password');
const { validateCreateUser } = require('../utils/user.validation');

async function getAllUsers() {
    return userRepository.findAll();
}

async function createUser({ name, email, password, role = 'user' }) {
    const validationErrors = validateCreateUser({
        name,
        email,
        password
    });

    if (Object.keys(validationErrors).length > 0) {
        const error = new Error('Validation failed');
        error.statusCode = 400;
        error.details = validationErrors;

        throw error;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await userRepository.findByEmail(normalizedEmail);

    if (existingUser) {
        const error = new Error('Email already exists');
        error.statusCode = 409;

        throw error;
    }

    const passwordHash = await hashPassword(password);

    return userRepository.create({
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role
    });
}

module.exports = {
    getAllUsers,
    createUser
};