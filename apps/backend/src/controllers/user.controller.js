const userService = require('../services/user.service');

async function getUsers(req, res) {
    try {
        const users = await userService.getAllUsers();

        return res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error.message);

        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}

async function createUser(req, res) {
    try {
        const user = await userService.createUser(req.body);

        return res.status(201).json(user);
    } catch (error) {
        console.error('Error creating user:', error.message);

        if (error.statusCode) {
            return res.status(error.statusCode).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}

module.exports = {
    getUsers,
    createUser
};