import { prisma } from "config/client";
import { TOTAL_ITEMS_PER_PAGE } from "config/constant";

const getAllProducts = async (page: number) => {
  const pageSize = TOTAL_ITEMS_PER_PAGE;
  const skip = (page - 1) * pageSize;
  const products = await prisma.product.findMany({
    skip,
    take: pageSize,
  });
  return products;
};

const countTotalProductPages = async () => {
  const totalItem = await prisma.product.count();
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
  const newProduct = await prisma.product.create({
    data: {
      name,
      price,
      ...(image && { image }),
      detailDesc,
      shortDesc,
      quantity,
      factory,
      target,
    },
  });
  return newProduct;
};

const handleDeleteProduct = async (productId: string) => {
  const deletedProduct = await prisma.product.delete({
    where: { id: parseInt(productId) },
  });
  return deletedProduct;
};

const handleViewProduct = async (productId: string) => {
  const product = await prisma.product.findUnique({
    where: { id: parseInt(productId) },
  });
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
  const updatedProduct = await prisma.product.update({
    where: { id: parseInt(productId) },
    data: {
      name,
      price,
      ...(image && { image }),
      detailDesc,
      shortDesc,
      quantity,
      factory,
      target,
    },
  });
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
