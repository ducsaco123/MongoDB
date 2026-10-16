import { Request, Response } from "express";
import { handleViewOrder } from "services/admin/order.service";
import { getOrderHistory } from "services/client/item.service";

const viewAdminOrderPage = async (req: Request, res: Response) => {
  const { id } = req.params;
  const errors = [];

  if (typeof id !== "string") {
    return res.status(400).send("Invalid order ID");
  }
  const order = await handleViewOrder(id);
  return res.render("admin/order/detail.ejs", {
    id,
    order,
    errors,
  });
};

const getOrderHistoryPage = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) return res.redirect("/login");

  const ordersHistory = await getOrderHistory(user.id);
  return res.render("client/product/history.ejs", {
    ordersHistory: ordersHistory || [],
    user,
  });
};

export { viewAdminOrderPage, getOrderHistoryPage };
