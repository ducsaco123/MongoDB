import { Request, Response } from "express";
import {
  countTotalProductPages,
  getProducts,
} from "services/client/item.service";
import { getProductWithFilter } from "services/client/product.filter";

import {
  getAllRoles,
  getAllUsers,
  handleCreateUser,
  handleDeleteUser,
  handleUpdateUser,
  handleViewUser,
} from "services/user.service";

const getHomePage = async (req: Request, res: Response) => {
  const { page } = req.query;
  let currentPage = page ? +page : 1;
  if (currentPage <= 0) currentPage = 1;

  const products = await getProducts(currentPage, 8);
  const totalPages = await countTotalProductPages(8);

  return res.render("client/home/show.ejs", {
    products,
    totalPages: +totalPages,
    page: +currentPage,
  });
};

const getProductFilterPage = async (req: Request, res: Response) => {
  const {
    page,
    factory = "",
    target = "",
    price = "",
    sort = "",
  } = req.query as {
    page?: string;
    factory: string;
    target: string;
    price: string;
    sort: string;
  };
  let currentPage = page ? +page : 1;
  if (currentPage <= 0) currentPage = 1;

  // const products = await getProducts(currentPage, 6);
  // const totalPages = await countTotalProductPages(6);

  let data = await getProductWithFilter(
    currentPage,
    6,
    factory,
    target,
    price,
    sort,
  );

  if (currentPage > data.totalPages && data.totalPages > 0) {
    currentPage = 1;
    data = await getProductWithFilter(1, 6, factory, target, price, sort);
  }

  return res.render("client/product/filter.ejs", {
    products: data.products,
    totalPages: +data.totalPages,
    page: data.totalPages > 0 ? +currentPage : 1,
  });
};

const getCreateUserPage = async (req: Request, res: Response) => {
  const roles = await getAllRoles();
  return res.render("admin/user/create.ejs", { roles });
};

const postCreateUserPage = async (req: Request, res: Response) => {
  const { fullName, username, phone, role, address } = req.body;
  const file = req.file;
  const avatar = file?.filename ?? "";
  await handleCreateUser(fullName, username, address, phone, avatar, role);
  return res.redirect("/admin/user");
};

const deleteUserPage = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (typeof id !== "string") {
    return res.status(400).send("Invalid user ID");
  }
  await handleDeleteUser(id);
  return res.redirect("/admin/user");
};

const viewUserPage = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (typeof id !== "string") {
    return res.status(400).send("Invalid user ID");
  }
  const user = await handleViewUser(id);
  const roles = await getAllRoles();
  return res.render("admin/user/detail.ejs", { id, user, roles });
};

const updateUserPage = async (req: Request, res: Response) => {
  const { id, fullName, phone, role, address } = req.body;
  const file = req.file;
  const avatar = file?.filename ?? undefined;

  await handleUpdateUser(id, fullName, phone, role, address, avatar);
  return res.redirect("/admin/user");
};
export {
  getHomePage,
  getCreateUserPage,
  postCreateUserPage,
  deleteUserPage,
  viewUserPage,
  updateUserPage,
  getProductFilterPage,
};
