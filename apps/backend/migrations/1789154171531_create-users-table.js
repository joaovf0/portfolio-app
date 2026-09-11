exports.up = (pgm) => {
    pgm.createExtension('pgcrypto', {
        ifNotExists: true
    });

    pgm.createTable('users', {
        id: {
            type: 'uuid',
            primaryKey: true,
            default: pgm.func('gen_random_uuid()')
        },

        name: {
            type: 'varchar(120)',
            notNull: true
        },

        email: {
            type: 'varchar(255)',
            notNull: true,
            unique: true
        },

        password_hash: {
            type: 'varchar(255)',
            notNull: true
        },

        role: {
            type: 'varchar(20)',
            notNull: true,
            default: 'user'
        },

        created_at: {
            type: 'timestamptz',
            notNull: true,
            default: pgm.func('current_timestamp')
        },

        updated_at: {
            type: 'timestamptz',
            notNull: true,
            default: pgm.func('current_timestamp')
        }
    });
};

exports.down = (pgm) => {
    pgm.dropTable('users');
};