/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("members", (table) => {
    table.bigIncrements("id").primary();
    table.integer("roster_number").notNullable().unique();
    table.text("full_name").notNullable();
    table.text("phone");
    table.text("email");
    table.boolean("needs_review").notNullable().defaultTo(false);
    table.boolean("is_active").notNullable().defaultTo(true);
    table.timestamps(true, true);
    table.index(["full_name"]);
  });

};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("members");
};
