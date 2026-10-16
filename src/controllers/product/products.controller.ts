import { name } from "ejs";
import { Request, Response } from "express";
import { it } from "node:test";
import {
  handleCreateProduct,
  handleDeleteProduct,
  handleUpdateProduct,
  handleViewProduct,
} from "services/admin/product.service";
import {
  getProductInCart,
  getProductById,
  getProductToCart,
  deleteCartDetail,
  updateCartDetailBeforeCheckout,
  handlePlaceOrder,
} from "services/client/item.service";
import { ProductSchema, TProductSchecma } from "src/validation/product.schema";

const factoryOptions = [
  { name: "Apple (MacBook)", value: "APPLE" },
  { name: "Asus", value: "ASUS" },
  { name: "Lenovo", value: "LENOVO" },
  { name: "Dell", value: "DELL" },
  { name: "LG", value: "LG" },
  { name: "Acer", value: "ACER" },
];

const targetOptions = [
  { name: "Gaming", value: "GAMING" },
  { name: "Sinh viên - Văn phòng", value: "SINHVIEN-VANPHONG" },
  { name: "Thiết kế đồ họa", value: "THIET-KE-DO-HOA" },
  { name: "Mỏng nhẹ", value: "MONG-NHE" },
  { name: "Doanh nhân", value: "DOANH-NHAN" },
];

const getDetailProductPage = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (typeof id !== "string") {
    return res.status(400).send("Invalid product ID");
  }
  const product = await getProductById(id);
  return res.render("client/product/detail.ejs", { product });
};

const getCreateProductPage = async (req: Request, res: Response) => {
  const errors = [];
  const oldData = {
    name: "",
    price: "",
    detailDesc: "",
    shortDesc: "",
    quantity: "",
    factory: "",
    target: "",
  };
  return res.render("admin/product/create.ejs", { errors, oldData });
};

const postCreateProduct = async (req: Request, res: Response) => {
  const { name, price, detailDesc, shortDesc, quantity, factory, target } =
    req.body as TProductSchecma;

  const validate = ProductSchema.safeParse(req.body);
  if (!validate.success) {
    //error
    const errorsZod = validate.error.issues;
    const errors = errorsZod?.map((err) => `${err.message} (${err.path[0]})`);
    const oldData = {
      name,
      price,
      detailDesc,
      shortDesc,
      quantity,
      factory,
      target,
    };
    return res.render("admin/product/create.ejs", { errors, oldData });
  }

  //success

  const file = req.file;
  const image = file?.filename ?? null;

  await handleCreateProduct(
    name,
    +price,
    detailDesc,
    shortDesc,
    +quantity,
    factory,
    target,
    image,
  );
  return res.redirect("/admin/product");
};

const viewProductPage = async (req: Request, res: Response) => {
  const { id } = req.params;
  const errors = [];

  if (typeof id !== "string") {
    return res.status(400).send("Invalid product ID");
  }
  const product = await handleViewProduct(id);
  return res.render("admin/product/detail.ejs", {
    id,
    product,
    errors,
    factoryOptions,
    targetOptions,
  });
};

const updateProductPage = async (req: Request, res: Response) => {
  const { id, name, price, detailDesc, shortDesc, quantity, factory, target } =
    req.body as TProductSchecma;

  const validate = ProductSchema.safeParse(req.body);
  if (!validate.success) {
    //error
    const errorsZod = validate.error.issues;
    const errors = errorsZod?.map((err) => `${err.message} (${err.path[0]})`);
    const product = {
      id,
      name,
      price,
      detailDesc,
      shortDesc,
      quantity,
      factory,
      target,
    };
    return res.render("admin/product/detail.ejs", {
      errors,
      product,
      factoryOptions,
      targetOptions,
    });
  }

  const file = req.file;
  const image = file?.filename ?? null;
  await handleUpdateProduct(
    id,
    name,
    +price,
    detailDesc,
    shortDesc,
    +quantity,
    factory,
    target,
    image,
  );

  return res.redirect("/admin/product");
};

const deleteProductPage = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (typeof id !== "string") {
    return res.status(400).send("Invalid product ID");
  }
  await handleDeleteProduct(id);
  return res.redirect("/admin/product");
};

const postAddProductToCart = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user;
  const quantity = req.body?.quantity ? +req.body.quantity : 1;

  if (user) {
    await getProductToCart(quantity, +id, user);
  } else {
    return res.redirect("/login");
  }
  return res.redirect("/");
};

const getOrderDetailPage = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) return res.redirect("/login");
  const cartDetails = await getProductInCart(+user.id);
  const totalPrice = cartDetails
    ?.map((item) => +item.price * +item.quantity)
    ?.reduce((a, b) => a + b, 0);
  const cartId = cartDetails.length ? cartDetails[0].cartId : 0;
  return res.render("client/product/cart.ejs", {
    cartDetails,
    totalPrice,
    cartId,
  });
};

const getCheckoutPage = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) return res.redirect("/login");
  const cartDetails = await getProductInCart(+user.id);
  const totalPrice = cartDetails
    ?.map((item) => +item.price * +item.quantity)
    ?.reduce((a, b) => a + b, 0);

  return res.render("client/product/checkout.ejs", { cartDetails, totalPrice });
};

const handleDeleteCart = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user;

  if (user) {
    await deleteCartDetail(+id, user.id, user.sumCart);
  } else {
    return res.redirect("/login");
  }
  return res.redirect("/cart-detail");
};

const postHandleCartToCheckout = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) return res.redirect("/login");

  const { cartId } = req.body;
  const currentCardDetail: { id: string; quantity: string }[] =
    req.body?.cartDetails ?? [];

  await updateCartDetailBeforeCheckout(currentCardDetail, cartId);
  return res.redirect("/checkout");
};

const postPlaceOrder = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) return res.redirect("/login");

  const { receiverName, receiverPhone, receiverAddress, totalPrice } = req.body;
  const message = await handlePlaceOrder(
    user.id,
    receiverName,
    receiverPhone,
    receiverAddress,
    +totalPrice,
  );

  if (message) {
    res.redirect("/checkout");
    return;
  }
  return res.redirect("/thanks");
};

const getThanksPage = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) return res.redirect("/login");

  return res.render("client/product/thanks.ejs");
};
export {
  getDetailProductPage,
  getCreateProductPage,
  postCreateProduct,
  viewProductPage,
  updateProductPage,
  deleteProductPage,
  postAddProductToCart,
  getOrderDetailPage,
  handleDeleteCart,
  getCheckoutPage,
  postHandleCartToCheckout,
  postPlaceOrder,
  getThanksPage,
};
