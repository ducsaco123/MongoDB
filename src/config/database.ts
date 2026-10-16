import { MongoClient, Db } from "mongodb";
import "dotenv/config";

const url =
  process.env.MONGODB_URL ||
  "mongodb://admin:123456@localhost:27017/nodejs?authSource=admin";
const dbName = "nodejs";

const client = new MongoClient(url, {
  maxPoolSize: 20,
  minPoolSize: 5,
  serverSelectionTimeoutMS: 5000,
});

let dbInstance: Db | null = null;

const connectToMongoDB = async (): Promise<Db> => {
  if (dbInstance) {
    return dbInstance;
  }

  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log(">>> [MongoDB] Connected successfully to database:", dbName);
    dbInstance = client.db(dbName);
    return dbInstance;
  } catch (error) {
    console.error(">>> [MongoDB] Connection error:", error);
    throw error;
  }
};

export const getDB = (): Db => {
  if (!dbInstance) {
    throw new Error("Database not initialized! Call connectToMongoDB first.");
  }
  return dbInstance;
};

export default connectToMongoDB;
