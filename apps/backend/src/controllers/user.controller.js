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

module.exports = {
    getUsers
};