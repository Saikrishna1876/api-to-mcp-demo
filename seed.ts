import { readdir, readdirSync, readFileSync } from "fs";
import { join } from "path";
import { clientPool, query } from "./src/db";
import { config } from "dotenv";

config({ path: ".env" });

async function seedDatabase() {
  try {
    const files = readdirSync(join(__dirname, "seed"));

    const sqlFiles = files.filter((file) => file.endsWith(".sql"));

    if (sqlFiles.length === 0) {
      console.log("No SQL files found in the seed directory.");
      process.exit(0);
    }

    for (const file of sqlFiles) {
      const filePath = join(__dirname, "seed", file);
      console.log(`Reading SQL file from: ${filePath}`);

      // Read the SQL content from the file
      const createTableSql = readFileSync(filePath, {
        encoding: "utf8",
      });

      console.log("Executing SQL to create assets table...");
      await query(createTableSql);
      console.log("Table created (or already exists) successfully!");
    }
  } catch (error: any) {
    console.error("Database seeding failed:", error);
    process.exit(1);
  } finally {
    await clientPool.end();
    console.log("Database pool closed.");
    process.exit(0);
  }
}

seedDatabase();
