
const userRepository = require('../repositories/user.repository');
const { hashPassword } = require('../utils/password');
const { validateCreateUser } = require('../utils/user.validation');

function createUserService(dependencies = {}) {
    const repository = dependencies.userRepository ?? userRepository;
    const hash = dependencies.hashPassword ?? hashPassword;
    const validate = dependencies.validateCreateUser ?? validateCreateUser;

    async function getAllUsers() {
        return repository.findAll();
    }

    async function createUser({ name, email, password }) {
        const validationErrors = validate({
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

        const existingUser = await repository.findByEmail(normalizedEmail);

        if (existingUser) {
            const error = new Error('Email already exists');
            error.statusCode = 409;

            throw error;
        }

        const passwordHash = await hash(password);

        return repository.create({
            name: name.trim(),
            email: normalizedEmail,
            passwordHash,
            role: 'user'
        });
    }

    return {
        getAllUsers,
        createUser
    };
}

const defaultService = createUserService();

module.exports = {
    ...defaultService,
    createUserService
};
