/*  eslint linebreak-style: ["error", "windows"]  */
// @ts-check

export const up = (knex) => (
  knex.schema.createTable('label_tasks', (table) => {
    table.increments('id').primary();
    table.integer('label_id')
      .references('id')
      .inTable('labels');
    table.integer('task_id')
      .references('id')
      .inTable('tasks');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
);

export const down = (knex) => knex.schema.dropTable('statuses');
