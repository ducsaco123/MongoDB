import { getDB } from "config/database";
import { ACCOUNT_TYPE, TOTAL_ITEMS_PER_PAGE } from "config/constant";
import bcrypt from "bcrypt";

const saltRounds = 10;
const hashPassword = async (plaintText: string) => {
  return await bcrypt.hash(plaintText, saltRounds);
};

const comparePassword = async (plaintText: string, hashPassword: string) => {
  return await bcrypt.compare(plaintText, hashPassword);
};

const handleCreateUser = async (
  fullName: string,
  username: string,
  address: string,
  phone: string,
  avatar: string,
  role: string,
) => {
  const db = getDB();
  const defaultPassword = await hashPassword("123456");

  const lastUser = await db
    .collection("users")
    .find()
    .sort({ id: -1 })
    .limit(1)
    .toArray();
  const newId = lastUser.length > 0 && lastUser[0].id ? lastUser[0].id + 1 : 1;

  const newUser = {
    id: newId,
    fullName,
    username,
    password: defaultPassword,
    accountType: ACCOUNT_TYPE.SYSTEM,
    address,
    phone,
    avatar,
    roleId: +role,
  };

  await db.collection("users").insertOne(newUser);
  return newUser;
};

const getAllUsers = async (page: number) => {
  const db = getDB();
  const pageSize = TOTAL_ITEMS_PER_PAGE;
  const skip = (page - 1) * pageSize;
  const users = await db
    .collection("users")
    .find({})
    .skip(skip)
    .limit(pageSize)
    .toArray();
  return users;
};

const countTotalUserPages = async () => {
  const db = getDB();
  const totalItem = await db.collection("users").countDocuments();
  const pageSize = TOTAL_ITEMS_PER_PAGE;
  const totalPages = Math.ceil(totalItem / pageSize);

  return totalPages;
};

const getAllRoles = async () => {
  const db = getDB();
  const roles = await db.collection("roles").find({}).toArray();
  return roles;
};

const handleDeleteUser = async (userId: string) => {
  const db = getDB();
  const deletedUser = await db
    .collection("users")
    .deleteOne({ id: parseInt(userId) });
  return deletedUser;
};

const handleViewUser = async (userId: string) => {
  const db = getDB();
  const user = await db
    .collection("users")
    .findOne({ id: parseInt(userId) });
  return user;
};

const handleUpdateUser = async (
  userId: string,
  fullName: string,
  phone: string,
  role: string,
  address: string,
  avatar: string,
) => {
  const db = getDB();
  const updateData: any = {
    fullName,
    phone,
    roleId: parseInt(role),
    address,
  };
  if (avatar !== undefined) {
    updateData.avatar = avatar;
  }

  const updatedUser = await db
    .collection("users")
    .updateOne({ id: parseInt(userId) }, { $set: updateData });

  return updatedUser;
};

export {
  handleCreateUser,
  getAllUsers,
  handleDeleteUser,
  handleViewUser,
  handleUpdateUser,
  getAllRoles,
  hashPassword,
  comparePassword,
  countTotalUserPages,
};
