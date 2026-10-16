import { getDB } from "config/database";

const getDashboardInfo = async () => {
  const db = getDB();
  const countUser = await db.collection("users").countDocuments();
  const countProduct = await db.collection("products").countDocuments();
  const countOrder = await db.collection("orders").countDocuments();

  return {
    countUser,
    countProduct,
    countOrder,
  };
};

export { getDashboardInfo };
