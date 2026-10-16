import { PrismaClient, Prisma } from "@prisma/client";
import { prisma } from "config/client";
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
  const defaultPassword = await hashPassword("123456");
  const newUser = await prisma.user.create({
    data: {
      fullName,
      username,
      password: defaultPassword,
      accountType: ACCOUNT_TYPE.SYSTEM,
      address,
      phone,
      avatar,
      roleId: +role,
    },
  });
  return newUser;
};

const getAllUsers = async (page: number) => {
  const pageSize = TOTAL_ITEMS_PER_PAGE;
  const skip = (page - 1) * pageSize;
  const users = await prisma.user.findMany({
    skip,
    take: pageSize,
  });
  return users;
};

const countTotalUserPages = async () => {
  const totalItem = await prisma.user.count();
  const pageSize = TOTAL_ITEMS_PER_PAGE;
  const totalPages = Math.ceil(totalItem / pageSize);

  return totalPages;
};

const getAllRoles = async () => {
  const roles = await prisma.role.findMany();
  return roles;
};

const handleDeleteUser = async (userId: string) => {
  const deletedUser = await prisma.user.delete({
    where: { id: parseInt(userId) },
  });
  return deletedUser;
};

const handleViewUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
  });
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
  const updatedUser = await prisma.user.update({
    where: { id: parseInt(userId) },
    data: {
      fullName,
      phone,
      roleId: parseInt(role),
      address,
      ...(avatar !== undefined && { avatar }),
    },
  });

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
