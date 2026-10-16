import { getDB } from "config/database";

const getProducts = async (page: number, pageSize: number) => {
  const db = getDB();
  const skip = (page - 1) * pageSize;
  const products = await db
    .collection("products")
    .find({})
    .skip(skip)
    .limit(pageSize)
    .toArray();
  return products;
};

const countTotalProductPages = async (pageSize: number) => {
  const db = getDB();
  const totalItem = await db.collection("products").countDocuments();
  const totalPages = Math.ceil(totalItem / pageSize);

  return totalPages;
};

const getProductById = async (productId: string) => {
  const db = getDB();
  const product = await db
    .collection("products")
    .findOne({ id: parseInt(productId) });
  return product;
};

const getProductToCart = async (
  quantity: number,
  productId: number,
  user: Express.User,
) => {
  const db = getDB();
  const cart = await db.collection("carts").findOne({ userId: user.id });
  const product = await db.collection("products").findOne({ id: productId });

  if (cart) {
    // update cart sum
    await db
      .collection("carts")
      .updateOne({ id: cart.id }, { $inc: { sum: quantity } });

    // update or insert cartDetail
    const currentCartDetail = await db.collection("cart_detail").findOne({
      cartId: cart.id,
      productId,
    });

    if (currentCartDetail) {
      await db
        .collection("cart_detail")
        .updateOne(
          { id: currentCartDetail.id },
          { $inc: { quantity: quantity } },
        );
    } else {
      const lastDetail = await db
        .collection("cart_detail")
        .find()
        .sort({ id: -1 })
        .limit(1)
        .toArray();
      const newId =
        lastDetail.length > 0 && lastDetail[0].id ? lastDetail[0].id + 1 : 1;

      await db.collection("cart_detail").insertOne({
        id: newId,
        price: product?.price,
        quantity,
        productId,
        cartId: cart.id,
      });
    }
  } else {
    // create new cart
    const lastCart = await db
      .collection("carts")
      .find()
      .sort({ id: -1 })
      .limit(1)
      .toArray();
    const newCartId =
      lastCart.length > 0 && lastCart[0].id ? lastCart[0].id + 1 : 1;

    await db.collection("carts").insertOne({
      id: newCartId,
      sum: quantity,
      userId: user.id,
    });

    const lastDetail = await db
      .collection("cart_detail")
      .find()
      .sort({ id: -1 })
      .limit(1)
      .toArray();
    const newDetailId =
      lastDetail.length > 0 && lastDetail[0].id ? lastDetail[0].id + 1 : 1;

    await db.collection("cart_detail").insertOne({
      id: newDetailId,
      price: product?.price,
      quantity,
      productId,
      cartId: newCartId,
    });
  }
};

const getProductInCart = async (userId: number) => {
  const db = getDB();
  const cart = await db.collection("carts").findOne({ userId });

  if (cart) {
    const currentCardDetail = await db
      .collection("cart_detail")
      .aggregate([
        { $match: { cartId: cart.id } },
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
    return currentCardDetail;
  }
  return [];
};

const deleteCartDetail = async (
  id: number,
  userId: number,
  sumCart: number,
) => {
  const db = getDB();
  const currentCardDetail = await db.collection("cart_detail").findOne({ id });

  if (!currentCardDetail) return;
  await db.collection("cart_detail").deleteOne({ id });

  const quantity = currentCardDetail.quantity;
  if (sumCart === 1) {
    await db.collection("carts").deleteOne({ userId });
  } else {
    await db
      .collection("carts")
      .updateOne({ userId }, { $inc: { sum: -quantity } });
  }
};

const updateCartDetailBeforeCheckout = async (
  data: { id: string; quantity: string }[],
  cartId: string,
) => {
  const db = getDB();
  let quantity = 0;

  for (let i = 0; i < data.length; i++) {
    quantity += +data[i].quantity;
    await db
      .collection("cart_detail")
      .updateOne({ id: +data[i].id }, { $set: { quantity: +data[i].quantity } });
  }

  // update cart sum
  await db
    .collection("carts")
    .updateOne({ id: +cartId }, { $set: { sum: quantity } });
};

const handlePlaceOrder = async (
  userId: number,
  receiverName: string,
  receiverPhone: string,
  receiverAddress: string,
  totalPrice: number,
) => {
  const db = getDB();
  try {
    const cart = await db.collection("carts").findOne({ userId });
    if (!cart) return "Giỏ hàng không tồn tại";

    const cartDetails = await db
      .collection("cart_detail")
      .find({ cartId: cart.id })
      .toArray();

    // Check product quantity
    for (const item of cartDetails) {
      const product = await db
        .collection("products")
        .findOne({ id: item.productId });
      if (!product || product.quantity < item.quantity) {
        return `Sản phẩm ${product?.name} không tồn tại hoặc không đủ số lượng.`;
      }
    }

    // Create order
    const lastOrder = await db
      .collection("orders")
      .find()
      .sort({ id: -1 })
      .limit(1)
      .toArray();
    const newOrderId =
      lastOrder.length > 0 && lastOrder[0].id ? lastOrder[0].id + 1 : 1;

    await db.collection("orders").insertOne({
      id: newOrderId,
      receiverAddress,
      receiverName,
      receiverPhone,
      paymentMethod: "COD",
      paymentStatus: "PAYMENT_UNPAID",
      status: "PENDING",
      totalPrice: Number(totalPrice),
      userId,
    });

    // Create orderDetails
    const lastDetail = await db
      .collection("order_detail")
      .find()
      .sort({ id: -1 })
      .limit(1)
      .toArray();
    let nextDetailId =
      lastDetail.length > 0 && lastDetail[0].id ? lastDetail[0].id + 1 : 1;

    const orderDetailsToInsert = cartDetails.map((item) => ({
      id: nextDetailId++,
      price: Number(item.price),
      quantity: item.quantity,
      productId: item.productId,
      orderId: newOrderId,
    }));

    if (orderDetailsToInsert.length > 0) {
      await db.collection("order_detail").insertMany(orderDetailsToInsert);
    }

    // Update product stock
    for (const item of cartDetails) {
      await db.collection("products").updateOne(
        { id: item.productId },
        {
          $inc: {
            quantity: -item.quantity,
            sold: item.quantity,
          },
        },
      );
    }

    // Remove cart & cartDetails
    await db.collection("cart_detail").deleteMany({ cartId: cart.id });
    await db.collection("carts").deleteOne({ id: cart.id });

    return "";
  } catch (error: any) {
    return error.message;
  }
};

const getOrderHistory = async (userId: number) => {
  const db = getDB();
  const history = await db
    .collection("orders")
    .aggregate([
      { $match: { userId } },
      { $sort: { id: -1 } },
      {
        $lookup: {
          from: "order_detail",
          localField: "id",
          foreignField: "orderId",
          as: "orderDetails",
        },
      },
      {
        $unwind: {
          path: "$orderDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "orderDetails.productId",
          foreignField: "id",
          as: "orderDetails.product",
        },
      },
      {
        $addFields: {
          "orderDetails.product": {
            $arrayElemAt: ["$orderDetails.product", 0],
          },
        },
      },
      {
        $group: {
          _id: "$id",
          id: { $first: "$id" },
          totalPrice: { $first: "$totalPrice" },
          paymentMethod: { $first: "$paymentMethod" },
          paymentStatus: { $first: "$paymentStatus" },
          paymentRef: { $first: "$paymentRef" },
          receiverAddress: { $first: "$receiverAddress" },
          receiverName: { $first: "$receiverName" },
          receiverPhone: { $first: "$receiverPhone" },
          status: { $first: "$status" },
          userId: { $first: "$userId" },
          orderDetails: {
            $push: {
              $cond: [
                { $ifNull: ["$orderDetails.id", false] },
                "$orderDetails",
                "$$REMOVE",
              ],
            },
          },
        },
      },
      { $sort: { id: -1 } },
    ])
    .toArray();

  return history ?? [];
};

export {
  getProducts,
  getProductById,
  getProductToCart,
  getProductInCart,
  deleteCartDetail,
  updateCartDetailBeforeCheckout,
  handlePlaceOrder,
  getOrderHistory,
  countTotalProductPages,
};
