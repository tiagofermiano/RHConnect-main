// backend/db/migrate.js
const fs = require("fs");
const path = require("path");
const pool = require("./connection");

async function migrate() {
  try {
    const schemaPath = path.join(__dirname, "schema.sql");
    const sql = fs.readFileSync(schemaPath, "utf8");
    console.log("Executando schema.sql...");
    await pool.query(sql);
    console.log("Migração concluída.");
  } catch (err) {
    console.error("Erro ao migrar:", err);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

migrate();
