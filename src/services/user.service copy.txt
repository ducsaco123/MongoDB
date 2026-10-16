import getConnection from "config/database";

const handleCreateUser = async (
  fullName: string,
  email: string,
  address: string,
) => {
  const connection = await getConnection();
  try {
    const sql =
      "INSERT INTO `users`(`name`, `email`, `address`) VALUES (?,?,?)";
    const values = [fullName, email, address];
    const [result, fields] = await connection.execute(sql, values);
    return result;
  } catch (error) {
    console.log(error);
  }
};

const getAllUsers = async () => {
  const connection = await getConnection();

  try {
    const [results, fields] = await connection.query("SELECT * FROM `users`");

    return results;
  } catch (err) {
    console.log(err);
  }
  return [];
};

const handleDeleteUser = async (userId: string) => {
  try {
    const connection = await getConnection();
    const sql = "DELETE FROM `users` WHERE `id` = ?";
    const values = [userId];
    const [result, fields] = await connection.execute(sql, values);
    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
};

const handleViewUser = async (userId: string) => {
  try {
    const connection = await getConnection();
    const sql = "SELECT * FROM `users` WHERE `id` = ?";
    const values = [userId];
    const [result, fields] = await connection.execute(sql, values);

    return result[0];
  } catch (error) {
    console.log(error);
    return [];
  }
};

const handleUpdateUser = async (
  userId: string,
  fullName: string,
  email: string,
  address: string,
) => {
  try {
    const connection = await getConnection();
    const sql =
      "UPDATE `users` SET `name` = ?, `email` = ?, `address` = ? WHERE `id` = ?";
    const values = [fullName, email, address, userId];
    const [result, fields] = await connection.execute(sql, values);

    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export {
  handleCreateUser,
  getAllUsers,
  handleDeleteUser,
  handleViewUser,
  handleUpdateUser,
};
