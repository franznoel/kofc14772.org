/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("admin_profiles", (table) => {
    table.uuid("id").primary().defaultTo(knex.fn.uuid());
    table.text("auth_user_id").notNullable().unique();
    table.text("display_name").notNullable();
    table.enu("role", ["super_admin", "officer", "editor", "viewer"], {
      useNative: true,
      enumName: "admin_role",
    }).notNullable().defaultTo("viewer");
    table.boolean("is_active").notNullable().defaultTo(true);
    table.timestamps(true, true);
  });

  await knex.schema.createTable("admin_audit_log", (table) => {
    table.bigIncrements("id").primary();
    table.uuid("admin_profile_id").references("id").inTable("admin_profiles").onDelete("SET NULL");
    table.text("action").notNullable();
    table.text("entity_type").notNullable();
    table.text("entity_id");
    table.jsonb("details").notNullable().defaultTo("{}");
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.alterTable("admin_audit_log", (table) => {
    table.index(["entity_type", "entity_id"]);
    table.index(["created_at"]);
  });
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("admin_audit_log");
  await knex.schema.dropTableIfExists("admin_profiles");
  await knex.raw("DROP TYPE IF EXISTS admin_role");
};
