import { getDB } from "config/database";
import { ACCOUNT_TYPE } from "config/constant";
import bcrypt from "bcrypt";
import { comparePassword } from "services/user.service";

const saltRounds = 10;
const hashPassword = async (plaintText: string) => {
  return await bcrypt.hash(plaintText, saltRounds);
};

const isEmailExist = async (email: string) => {
  const db = getDB();
  const user = await db.collection("users").findOne({ username: email });
  return !!user;
};

const handleCreateAccount = async (
  fullName: string,
  username: string,
  password: string,
) => {
  const db = getDB();
  const hashedPassword = await hashPassword(password);
  const userRole = await db.collection("roles").findOne({ name: "USER" });

  if (userRole) {
    const lastUser = await db
      .collection("users")
      .find()
      .sort({ id: -1 })
      .limit(1)
      .toArray();
    const newId =
      lastUser.length > 0 && lastUser[0].id ? lastUser[0].id + 1 : 1;

    await db.collection("users").insertOne({
      id: newId,
      fullName,
      username,
      password: hashedPassword,
      accountType: ACCOUNT_TYPE.SYSTEM,
      roleId: userRole.id,
    });
  } else {
    throw new Error("User role không tồn tại");
  }
};

const handleLogin = async (
  username: string,
  password: string,
  callback: any,
) => {
  const db = getDB();
  const user = await db.collection("users").findOne({ username });
  if (!user) {
    return callback(null, false, {
      message: `Tài khoản/mật khẩu không chính xác`,
    });
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    return callback(null, false, {
      message: `Tài khoản/mật khẩu không chính xác`,
    });
  }
  return callback(null, user);
};

const getUserWithRoleById = async (userId: string) => {
  const db = getDB();
  const user = await db
    .collection("users")
    .findOne({ id: parseInt(userId) }, { projection: { password: 0 } });
  if (!user) return null;

  const role = await db.collection("roles").findOne({ id: user.roleId });
  return { ...user, role };
};

const getUserSumCart = async (id: string) => {
  const db = getDB();
  const cart = await db.collection("carts").findOne({ userId: parseInt(id) });
  return cart?.sum ?? 0;
};

export {
  handleCreateAccount,
  isEmailExist,
  handleLogin,
  getUserWithRoleById,
  getUserSumCart,
};
