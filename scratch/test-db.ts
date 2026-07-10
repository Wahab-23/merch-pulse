import { createConnection } from "mariadb";
import * as dotenv from "dotenv";
dotenv.config();

async function test() {
  const dbUrl = new URL(process.env.DATABASE_URL!);
  console.log("Connecting to:", dbUrl.hostname, "as", dbUrl.username);
  try {
    const conn = await createConnection({
      host: dbUrl.hostname,
      port: parseInt(dbUrl.port || "3306", 10),
      user: dbUrl.username,
      password: dbUrl.password,
      database: dbUrl.pathname.substring(1),
    });
    console.log("Connection successful!");
    await conn.end();
  } catch (err) {
    console.error("Connection failed:", err);
  }
}

test();
