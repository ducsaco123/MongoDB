import { getDB } from "config/database";
import { TOTAL_ITEMS_PER_PAGE } from "config/constant";

const getAllOrders = async (page: number) => {
  const db = getDB();
  const pageSize = TOTAL_ITEMS_PER_PAGE;
  const skip = (page - 1) * pageSize;

  const orders = await db
    .collection("orders")
    .aggregate([
      { $skip: skip },
      { $limit: pageSize },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "id",
          as: "userList",
        },
      },
      {
        $addFields: {
          user: { $arrayElemAt: ["$userList", 0] },
        },
      },
      { $project: { userList: 0 } },
    ])
    .toArray();

  return orders;
};

const countTotalOrderPages = async () => {
  const db = getDB();
  const totalItem = await db.collection("orders").countDocuments();
  const pageSize = TOTAL_ITEMS_PER_PAGE;
  const totalPages = Math.ceil(totalItem / pageSize);

  return totalPages;
};

const handleViewOrder = async (orderId: string) => {
  const db = getDB();
  const id = parseInt(orderId);

  const order = await db.collection("orders").findOne({ id });
  if (order) {
    const user = await db.collection("users").findOne({ id: order.userId });
    const orderDetails = await db
      .collection("order_detail")
      .aggregate([
        { $match: { orderId: order.id } },
        {
          $lookup: {
            from: "products",
            localField: "productId",
            foreignField: "id",
            as: "productList",
          },
        },
        {
          $addFields: {
            product: { $arrayElemAt: ["$productList", 0] },
          },
        },
        { $project: { productList: 0 } },
      ])
      .toArray();

    return {
      ...order,
      user,
      orderDetails,
    };
  }

  // Fallback if accessed via orderDetail ID
  const orderDetail = await db.collection("order_detail").findOne({ id });
  if (orderDetail) {
    const product = await db
      .collection("products")
      .findOne({ id: orderDetail.productId });
    const parentOrder = await db
      .collection("orders")
      .findOne({ id: orderDetail.orderId });
    const user = parentOrder
      ? await db.collection("users").findOne({ id: parentOrder.userId })
      : null;

    return {
      ...orderDetail,
      product,
      order: parentOrder ? { ...parentOrder, user } : null,
    };
  }

  return null;
};

export { getAllOrders, handleViewOrder, countTotalOrderPages };
