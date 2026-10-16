import { prisma } from "config/client";
import { TOTAL_ITEMS_PER_PAGE } from "config/constant";

const getAllOrders = async (page: number) => {
  const pageSize = TOTAL_ITEMS_PER_PAGE;
  const skip = (page - 1) * pageSize;
  const orders = await prisma.order.findMany({
    skip,
    take: pageSize,
    include: {
      user: true,
    },
  });
  return orders;
};

const countTotalOrderPages = async () => {
  const totalItem = await prisma.order.count();
  const pageSize = TOTAL_ITEMS_PER_PAGE;
  const totalPages = Math.ceil(totalItem / pageSize);

  return totalPages;
};

const handleViewOrder = async (orderId: string) => {
  const id = parseInt(orderId);
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      orderDetails: {
        include: {
          product: true,
        },
      },
    },
  });

  if (order) return order;

  // Fallback if accessed via orderDetail ID
  const orderDetail = await prisma.orderDetail.findUnique({
    where: { id },
    include: {
      product: true,
      order: {
        include: { user: true },
      },
    },
  });
  return orderDetail;
};
export { getAllOrders, handleViewOrder, countTotalOrderPages };
