import express, { Express } from "express";
import {
  deleteUserPage,
  getCreateUserPage,
  getHomePage,
  getProductFilterPage,
  postCreateUserPage,
  updateUserPage,
  viewUserPage,
} from "controllers/user/users.controller";
import {
  getAdminOrderPage,
  getAdminProductPage,
  getAdminUserPage,
  getDashboardPage,
} from "controllers/admin/dashboard.controller";
import fileUploadMiddleware from "src/middleware/multer";
import {
  deleteProductPage,
  getCheckoutPage,
  getCreateProductPage,
  getDetailProductPage,
  getOrderDetailPage,
  getThanksPage,
  handleDeleteCart,
  postAddProductToCart,
  postCreateProduct,
  postHandleCartToCheckout,
  postPlaceOrder,
  updateProductPage,
  viewProductPage,
} from "controllers/product/products.controller";
import {
  createAccount,
  getLoginPage,
  getRegisterPage,
  getSuccessRedirectPage,
  postLogout,
} from "controllers/auth/auth.controller";
import passport from "passport";
import { isAdmin, isLogin } from "src/middleware/auth";
import {
  getOrderHistoryPage,
  viewAdminOrderPage,
} from "controllers/order/orders.controller";

const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const webRoutes = (app: Express) => {
  router.get("/", getHomePage);

  //auth routes
  router.get("/success-redirect", getSuccessRedirectPage);
  router.get("/login", getLoginPage);
  router.get("/register", getRegisterPage);
  router.post("/register", createAccount);
  router.post("/logout", postLogout);
  router.post(
    "/login",
    passport.authenticate("local", {
      successRedirect: "/success-redirect",
      failureRedirect: "/login",
      failureMessage: true,
    }),
  );

  //admin routes
  router.get("/admin", getDashboardPage);

  router.get("/admin/user", getAdminUserPage);
  router.get("/admin/create-user", getCreateUserPage);
  router.post(
    "/admin/handle-create-user",
    fileUploadMiddleware("avatar"),
    postCreateUserPage,
  );
  router.post("/admin/handle-delete-user/:id", deleteUserPage);
  router.get("/admin/handle-view-user/:id", viewUserPage);
  router.post(
    "/admin/handle-update-user",
    fileUploadMiddleware("avatar"),
    updateUserPage,
  );

  //routes order
  router.get("/admin/order", getAdminOrderPage);
  router.get("/admin/handle-view-order/:id", viewAdminOrderPage);

  router.get("/admin/product", getAdminProductPage);

  //routes product
  router.get("/product", getProductFilterPage);
  router.get("/product/:id", getDetailProductPage);
  router.get("/admin/create-product", getCreateProductPage);
  router.post(
    "/admin/handle-create-product",
    fileUploadMiddleware("image", "images/product"),
    postCreateProduct,
  );
  router.get("/admin/handle-view-product/:id", viewProductPage);
  router.post(
    "/admin/handle-update-product",
    fileUploadMiddleware("image", "images/product"),
    updateProductPage,
  );
  router.post("/admin/handle-delete-product/:id", deleteProductPage);

  router.get("/cart-detail", getOrderDetailPage);
  router.get("/checkout", getCheckoutPage);
  router.post("/handle-cart-to-checkout", postHandleCartToCheckout);
  router.post("/place-order", postPlaceOrder);
  router.get("/thanks", getThanksPage);
  router.post("/add-product-to-cart/:id", postAddProductToCart);
  router.post("/delete-cart/:id", handleDeleteCart);

  router.get("/order-history", getOrderHistoryPage);
  app.use("/", isAdmin, router);
};

export default webRoutes;
