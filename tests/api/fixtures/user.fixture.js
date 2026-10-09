const base = require('@playwright/test');
const { createUser } = require('../helpers/user.helper');
const { deleteUserById } = require('../helpers/database.helper');

const test = base.test.extend({
    user: async ({ request }, use) => {
        const user = await createUser(request);

        await use(user);

        await deleteUserById(user.id);
    }
});

module.exports = {
    test,
    expect: base.expect
};