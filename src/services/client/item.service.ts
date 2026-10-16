import { prisma } from "config/client";
import { TOTAL_ITEMS_PER_PAGE } from "config/constant";

const getProducts = async (page: number, pageSize: number) => {
  const skip = (page - 1) * pageSize;
  const products = await prisma.product.findMany({
    skip,
    take: pageSize,
  });
  return products;
};

const countTotalProductPages = async (pageSize: number) => {
  const totalItem = await prisma.product.count();
  const totalPages = Math.ceil(totalItem / pageSize);

  return totalPages;
};

const getProductById = async (productId: string) => {
  const product = await prisma.product.findUnique({
    where: { id: parseInt(productId) },
  });
  return product;
};

const getProductToCart = async (
  quantity: number,
  productId: number,
  user: Express.User,
) => {
  const cart = await prisma.cart.findUnique({
    where: {
      userId: user.id,
    },
  });

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (cart) {
    //update
    await prisma.cart.update({
      where: {
        id: cart.id,
      },
      data: {
        sum: {
          increment: quantity,
        },
      },
    });

    //update + insert
    const currentCardDetail = await prisma.cartDetail.findFirst({
      where: {
        cartId: cart.id,
        productId,
      },
    });
    await prisma.cartDetail.upsert({
      where: {
        id: currentCardDetail?.id ?? 0,
      },
      update: {
        quantity: {
          increment: quantity,
        },
      },
      create: {
        price: product?.price,
        quantity,
        productId,
        cartId: cart.id,
      },
    });
  } else {
    //create
    await prisma.cart.create({
      data: {
        sum: quantity,
        userId: user.id,
        cartDetails: {
          create: [
            {
              price: product?.price,
              quantity,
              productId,
            },
          ],
        },
      },
    });
  }
};

const getProductInCart = async (userId: number) => {
  const cart = await prisma.cart.findUnique({
    where: {
      userId,
    },
  });

  if (cart) {
    const currentCardDetail = await prisma.cartDetail.findMany({
      where: { cartId: cart.id },
      include: { product: true },
    });
    return currentCardDetail;
  }
  return [];
};

const deleteCartDetail = async (
  id: number,
  userId: number,
  sumCart: number,
) => {
  const currentCardDetail = await prisma.cartDetail.delete({
    where: { id },
  });

  const quantity = currentCardDetail.quantity;
  if (sumCart === 1) {
    await prisma.cart.delete({
      where: { userId },
    });
  } else {
    await prisma.cart.update({
      where: { userId },
      data: {
        sum: {
          decrement: quantity,
        },
      },
    });
  }
};

const updateCartDetailBeforeCheckout = async (
  data: { id: string; quantity: string }[],
  cartId: string,
) => {
  let quantity = 0;

  for (let i = 0; i < data.length; i++) {
    quantity += +data[i].quantity;
    await prisma.cartDetail.update({
      where: { id: +data[i].id },
      data: {
        quantity: +data[i].quantity,
      },
    });
  }

  //update cart sum
  await prisma.cart.update({
    where: {
      id: +cartId,
    },
    data: {
      sum: quantity,
    },
  });
};

const handlePlaceOrder = async (
  userId: number,
  receiverName: string,
  receiverPhone: string,
  receiverAddress: string,
  totalPrice: number,
) => {
  try {
    //tạo transaction
    await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: {
          cartDetails: true,
        },
      });

      if (cart) {
        //create order
        const dataOrderDetail =
          cart?.cartDetails?.map((item) => ({
            price: item.price,
            quantity: item.quantity,
            productId: item.productId,
          })) ?? [];
        await tx.order.create({
          data: {
            receiverAddress,
            receiverName,
            receiverPhone,
            paymentMethod: "COD",
            paymentStatus: "PAYMENT_UNPAID",
            status: "PENDING",
            totalPrice,
            userId,
            orderDetails: {
              create: dataOrderDetail,
            },
          },
        });

        //remove cart detail + cart
        await tx.cartDetail.deleteMany({
          where: {
            cartId: cart.id,
          },
        });

        //remove cart
        await tx.cart.delete({
          where: { id: cart.id },
        });
      }

      //check product
      for (let i = 0; i < cart?.cartDetails.length; i++) {
        const productId = cart?.cartDetails[i].productId;
        const product = await tx.product.findUnique({
          where: { id: productId },
        });
        if (!product || product.quantity < cart?.cartDetails[i].quantity) {
          throw new Error(
            `Sản phẩm ${product?.name} không tồn tại hoặc không đủ số lượng.`,
          );
        }

        await tx.product.update({
          where: { id: productId },
          data: {
            quantity: {
              decrement: cart?.cartDetails[i].quantity,
            },
            sold: {
              increment: cart?.cartDetails[i].quantity,
            },
          },
        });
      }
    });

    return "";
  } catch (error) {
    return error.message;
  }
};

const getOrderHistory = async (userId: number) => {
  const history = await prisma.order.findMany({
    where: { userId },
    include: {
      orderDetails: {
        include: { product: true },
      },
    },
    orderBy: {
      id: "desc",
    },
  });

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
