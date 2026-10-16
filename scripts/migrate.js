const mysql = require("mysql2/promise");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const migrateData = async () => {
  console.log(">>> Starting migration from MySQL to MongoDB...");

  const mysqlConn = await mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "123456",
    database: "nodejs",
  });

  const mongoUri =
    process.env.MONGODB_URL ||
    "mongodb://admin:123456@localhost:27017/nodejs?authSource=admin";
  const mongoClient = new MongoClient(mongoUri);
  await mongoClient.connect();
  const db = mongoClient.db("nodejs");

  const tables = [
    "roles",
    "users",
    "products",
    "orders",
    "order_detail",
    "carts",
    "cart_detail",
  ];

  for (const table of tables) {
    const [rows] = await mysqlConn.query(`SELECT * FROM \`${table}\``);
    const col = db.collection(table);
    await col.deleteMany({}); // Xóa dữ liệu cũ nếu có

    if (rows.length > 0) {
      const mappedRows = rows.map((r) => {
        const item = { ...r };
        if (item.price) item.price = Number(item.price);
        if (item.totalPrice) item.totalPrice = Number(item.totalPrice);
        return item;
      });

      await col.insertMany(mappedRows);
      console.log(`[✓] Cloned ${rows.length} rows -> collection "${table}"`);
    } else {
      console.log(`[-] Table "${table}" has 0 rows, created empty collection.`);
    }
  }

  await mysqlConn.end();
  await mongoClient.close();
  console.log(">>> Migration completed successfully!");
};

migrateData().catch((err) => {
  console.error(">>> Migration failed:", err);
});
