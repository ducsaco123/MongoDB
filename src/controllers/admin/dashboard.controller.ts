import { Request, Response } from "express";
import { getDashboardInfo } from "services/admin/dashboard.service";
import {
  countTotalOrderPages,
  getAllOrders,
} from "services/admin/order.service";
import {
  countTotalProductPages,
  getAllProducts,
} from "services/admin/product.service";
import {
  countTotalUserPages,
  getAllUsers,
  handleCreateUser,
} from "services/user.service";

const getDashboardPage = async (req: Request, res: Response) => {
  const info = await getDashboardInfo();
  return res.render("admin/dashboard/dashboard.ejs", { info });
};

const getAdminUserPage = async (req: Request, res: Response) => {
  const { page } = req.query;
  let currentPage = page ? +page : 1;
  if (currentPage <= 0) currentPage = 1;
  const users = await getAllUsers(currentPage);
  const totalPages = await countTotalUserPages();
  return res.render("admin/user/show.ejs", {
    users,
    totalPages: +totalPages,
    page: +currentPage,
  });
};

const getAdminProductPage = async (req: Request, res: Response) => {
  const { page } = req.query;
  let currentPage = page ? +page : 1;
  if (currentPage <= 0) currentPage = 1;
  const products = await getAllProducts(currentPage);
  const totalPages = await countTotalProductPages();
  return res.render("admin/product/show.ejs", {
    products,
    totalPages: +totalPages,
    page: +currentPage,
  });
};

const getAdminOrderPage = async (req: Request, res: Response) => {
  const { page } = req.query;
  let currentPage = page ? +page : 1;
  if (currentPage <= 0) currentPage = 1;
  const orders = await getAllOrders(currentPage);
  const totalPages = await countTotalOrderPages();

  return res.render("admin/order/show.ejs", {
    orders,
    totalPages: +totalPages,
    page: +currentPage,
  });
};

export {
  getDashboardPage,
  getAdminUserPage,
  getAdminOrderPage,
  getAdminProductPage,
};
