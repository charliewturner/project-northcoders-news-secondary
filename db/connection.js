const { Pool } = require("pg");

const ENV = process.env.NODE_ENV || "development";
require("dotenv").config({ path: `${__dirname}/../.env.${ENV}` });
console.log(ENV);
console.log(process.env.PGPASSWORD);

if (!process.env.PGDATABASE && !process.env.DATABASE_URL) {
  throw new Error("PGDATABASE or DATABASE_URL not set");
} else {
  if (ENV === "production") {
    console.log(`Connected to ${process.env.DATABASE_URL}`);
  } else {
    console.log(`Connected to ${process.env.PGDATABASE}`);
  }
}

const config = {};

if (ENV === "production") {
  (config.connectionString = process.env.DATABASE_URL),
    (config.max = 2),
    (config.ssl = { rejectUnauthorized: false });
}

const db = new Pool(config);
module.exports = db;
