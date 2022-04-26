/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
 exports.up = function (knex) {
  return Promise.all([
    knex.schema.createTable('account_type', function (t) {
      t.increments('account_type_id').primary();
      t.string('account_type').notNullable();
    }),
    knex.schema.createTable('account', function (table) {
      table.increments('account_id').primary();
      table.string('given_name');
      table.string('family_name');
      table.string('nickname');
      table.string('company');
      table.string('phone');
      table.string('email').notNullable().unique;
      table.string('auth0_id').notNullable().unique;
      table
        .integer('account_type_id')
        .index()
        .references('account_type_id')
        .inTable('account_type').notNullable;
    }),
    knex.raw(`
      CREATE TABLE item
      (
          item_id SERIAL PRIMARY KEY NOT NULL,
          name VARCHAR(255) NOT NULL,
          account_id int REFERENCES account(account_id) NOT NULL 
      )
  `),
    knex.raw(`
      CREATE TABLE source
      (
        source_id SERIAL PRIMARY KEY NOT NULL,
        name VARCHAR(255) NOT NULL,
        address VARCHAR(255) NOT NULL,
        phone_number VARCHAR(255) UNIQUE,
        account_id int references account(account_id),
        email VARCHAR(255) UNIQUE NOT NULL 
      )
  `),
    knex.raw(`
      CREATE TABLE cx_source
      (
        cx_source_id SERIAL PRIMARY KEY NOT NULL,
        source_id int REFERENCES source(source_id) NOT NULL,
        cx_account_id int REFERENCES account(account_id) NOT NULL      
      )
  `),
    knex.raw(`
      CREATE TABLE sx_source
      (
        sx_source_id SERIAL PRIMARY KEY NOT NULL,
        source_id int REFERENCES source(source_id) NOT NULL,
        sx_account_id int REFERENCES account(account_id) NOT NULL         
      )
  `),
    knex.raw(`
    CREATE TABLE entry
    (
      entry_id SERIAL PRIMARY KEY NOT NULL,
      weight NUMERIC(5 ,2) NOT NULL,
      created DATE NOT NULL,
      last_edit DATE NOT NULL,
      item_id int REFERENCES item(item_id) NOT NULL,
      source_id int REFERENCES source(source_id) NOT NULL,
      account_id int REFERENCES account(account_id) NOT NULL

    )`),
  ]);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return Promise.all([
    knex.schema.dropTableIfExists('access_code'),
    knex.schema.dropTableIfExists('account_item'),
    knex.schema.dropTableIfExists('entry'),
    knex.schema.dropTableIfExists('cx_source'),
    knex.schema.dropTableIfExists('sx_source'),
    knex.schema.dropTableIfExists('source'),
    knex.schema.dropTableIfExists('item'),
    knex.schema.dropTableIfExists('account'),
    knex.schema.dropTableIfExists('account_type'),
  ]);
};