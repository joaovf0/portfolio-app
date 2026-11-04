function validateCreateUser({ name, email, password }) {
    const errors = {};

    if (name === undefined || name === null || name === '') {
        errors.name = 'Name is required';
    } else if (typeof name !== 'string') {
        errors.name = 'Name must be a string';
    } else if (!name.trim()) {
        errors.name = 'Name is required';
    } else if (name.trim().length < 2) {
        errors.name = 'Name must be at least 2 characters';
    } else if (name.trim().length > 120) {
        errors.name = 'Name must not exceed 120 characters';
    }

    if (email === undefined || email === null || email === '') {
        errors.email = 'Email is required';
    } else if (typeof email !== 'string') {
        errors.email = 'Email must be a string';
    } else if (!email.trim()) {
        errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        errors.email = 'Email must be valid';
    }

    if (typeof password !== 'string' || !password.trim()) {
        errors.password = 'Password is required';
    } else if (password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
    }

    return errors;
}

module.exports = {
    validateCreateUser
};