import { getDB } from "config/database";
import { comparePassword } from "services/user.service";
import jwt from "jsonwebtoken";
import "dotenv/config";

const handleGetAllUsers = async () => {
  const db = getDB();
  return await db.collection("users").find({}).toArray();
};

const handleGetUserById = async (id: number) => {
  const db = getDB();
  return await db.collection("users").findOne({ id });
};

const handleDeleteUserById = async (id: number) => {
  const db = getDB();
  return await db.collection("users").deleteOne({ id });
};

const handleUpdateUserById = async (
  id: number,
  fullName: string,
  phone: string,
  address: string,
) => {
  const db = getDB();
  return await db.collection("users").updateOne(
    { id },
    {
      $set: {
        fullName,
        phone,
        address,
      },
    },
  );
};

const handleUserLogin = async (username: string, password: string) => {
  const db = getDB();
  const user = await db.collection("users").findOne({ username });
  if (!user) {
    throw new Error(`Username: ${username} not found`);
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid password");
  }

  const role = await db.collection("roles").findOne({ id: user.roleId });

  const payload = {
    id: user.id,
    username: user.username,
    roleId: user.roleId,
    roleName: role ? role.name : "",
    accountType: user.accountType,
    avatar: user.avatar,
  };
  const secret = process.env.JWT_SECRET as string;
  const expiresIn: any = process.env.JWT_EXPIRES_IN;
  const access_token = jwt.sign(payload, secret, {
    expiresIn,
  });

  return access_token;
};

export {
  handleGetAllUsers,
  handleGetUserById,
  handleUpdateUserById,
  handleDeleteUserById,
  handleUserLogin,
};
