const userRepository = require('../repositories/user.repository');

async function getAllUsers() {
    return userRepository.findAll();
}

module.exports = {
    getAllUsers
};