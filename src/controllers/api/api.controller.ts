import { Request, Response } from "express";
import {
  handleDeleteUserById,
  handleGetAllUsers,
  handleGetUserById,
  handleUpdateUserById,
  handleUserLogin,
} from "services/api/api.service";
import { handleCreateAccount } from "services/auth/auth.service";
import { getProductToCart } from "services/client/item.service";
import {
  registerSchema,
  TRegisterSchema,
} from "src/validation/register.schema";

const postAddProductToCartAPI = async (req: Request, res: Response) => {
  const { quantity, productId } = req.body;
  const user = req.user;

  const currentSum = req?.user?.sumCart ?? 0;
  const newSum = currentSum + +quantity;

  await getProductToCart(+quantity, +productId, user);

  res.status(200).json({
    data: newSum,
  });
};

const getAllUsersAPI = async (req: Request, res: Response) => {
  const users = await handleGetAllUsers();
  const user = req.user;
  console.log(user);

  res.status(200).json({
    data: users,
  });
};

const getUserByIdAPI = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await handleGetUserById(+id);

  res.status(200).json({
    data: user,
  });
};

const createUserAPI = async (req: Request, res: Response) => {
  const { fullName, username, password, confirmPassword } =
    req.body as TRegisterSchema;
  const validate = await registerSchema.safeParseAsync(req.body);
  if (!validate.success) {
    //error
    const errorZod = validate.error.issues;
    const errors = errorZod?.map((err) => `${err.message} (${err.path[0]})`);

    res.status(400).json({ errors });
    return;
  }

  //success
  await handleCreateAccount(fullName, username, password);
  return res.status(201).json({
    data: "Create User Succeed",
  });
};

const updateUserByIdAPI = async (req: Request, res: Response) => {
  const { fullName, phone, role, address } = req.body;
  const { id } = req.params;
  await handleUpdateUserById(+id, fullName, phone, address);

  res.status(200).json({
    data: "Update user succeed",
  });
};

const deleteUserByIdAPI = async (req: Request, res: Response) => {
  const { id } = req.params;
  await handleDeleteUserById(+id);

  res.status(200).json({
    data: "Delete user succeed",
  });
};

const loginAPI = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const access_token = await handleUserLogin(username, password);
    res.status(200).json({
      data: {
        access_token,
      },
    });
  } catch (error) {
    res.status(401).json({
      data: null,
      message: error.message,
    });
  }
};

const fetchAccountAPI = async (req: Request, res: Response) => {
  const user = req.user;

  res.status(200).json({
    data: {
      user,
    },
  });
};
export {
  postAddProductToCartAPI,
  getAllUsersAPI,
  getUserByIdAPI,
  createUserAPI,
  updateUserByIdAPI,
  deleteUserByIdAPI,
  loginAPI,
  fetchAccountAPI,
};
