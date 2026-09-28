const userRepository = require('../repositories/user.repository');
const { hashPassword } = require('../utils/password');

async function getAllUsers() {
    return userRepository.findAll();
}

async function createUser({ name, email, password, role = 'user' }) {
    if (!name || !email || !password) {
        const error = new Error('Name, email and password are required');
        error.statusCode = 400;

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