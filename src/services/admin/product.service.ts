import { getDB } from "config/database";
import { TOTAL_ITEMS_PER_PAGE } from "config/constant";

const getAllProducts = async (page: number) => {
  const db = getDB();
  const pageSize = TOTAL_ITEMS_PER_PAGE;
  const skip = (page - 1) * pageSize;
  const products = await db
    .collection("products")
    .find({})
    .skip(skip)
    .limit(pageSize)
    .toArray();
  return products;
};

const countTotalProductPages = async () => {
  const db = getDB();
  const totalItem = await db.collection("products").countDocuments();
  const pageSize = TOTAL_ITEMS_PER_PAGE;
  const totalPages = Math.ceil(totalItem / pageSize);

  return totalPages;
};

const handleCreateProduct = async (
  name: string,
  price: number,
  detailDesc: string,
  shortDesc: string,
  quantity: number,
  factory: string,
  target: string,
  image: string,
) => {
  const db = getDB();
  const lastProd = await db
    .collection("products")
    .find()
    .sort({ id: -1 })
    .limit(1)
    .toArray();
  const newId =
    lastProd.length > 0 && lastProd[0].id ? lastProd[0].id + 1 : 1;

  const newProduct = {
    id: newId,
    name,
    price: Number(price),
    ...(image && { image }),
    detailDesc,
    shortDesc,
    quantity: Number(quantity),
    factory,
    target,
  };

  await db.collection("products").insertOne(newProduct);
  return newProduct;
};

const handleDeleteProduct = async (productId: string) => {
  const db = getDB();
  const deletedProduct = await db
    .collection("products")
    .deleteOne({ id: parseInt(productId) });
  return deletedProduct;
};

const handleViewProduct = async (productId: string) => {
  const db = getDB();
  const product = await db
    .collection("products")
    .findOne({ id: parseInt(productId) });
  return product;
};

const handleUpdateProduct = async (
  productId: string,
  name: string,
  price: number,
  detailDesc: string,
  shortDesc: string,
  quantity: number,
  factory: string,
  target: string,
  image: string,
) => {
  const db = getDB();
  const updateData: any = {
    name,
    price: Number(price),
    detailDesc,
    shortDesc,
    quantity: Number(quantity),
    factory,
    target,
  };
  if (image) {
    updateData.image = image;
  }

  const updatedProduct = await db
    .collection("products")
    .updateOne({ id: parseInt(productId) }, { $set: updateData });

  return updatedProduct;
};

export {
  getAllProducts,
  handleCreateProduct,
  handleDeleteProduct,
  handleViewProduct,
  handleUpdateProduct,
  countTotalProductPages,
};
