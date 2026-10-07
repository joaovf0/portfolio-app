const base = require('@playwright/test');
const { createUser } = require('../helpers/user.helper');

const test = base.test.extend({
    user: async ({ request }, use) => {
        const user = await createUser(request);

        await use(user);
    }
});

module.exports = {
    test,
    expect: base.expect
};