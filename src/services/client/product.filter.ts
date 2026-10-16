import { getDB } from "config/database";

const getProductWithFilter = async (
  page: number,
  pageSize: number,
  factory: string,
  target: string,
  price: string,
  sort: string,
) => {
  const db = getDB();
  const query: any = {};

  if (factory) {
    const factoryInput = factory.split(",");
    query.factory = { $in: factoryInput };
  }

  if (target) {
    const targetInput = target.split(",");
    query.target = { $in: targetInput };
  }

  if (price) {
    const priceInput = price.split(",");
    const priceCondition = [];
    for (let i = 0; i < priceInput.length; i++) {
      if (priceInput[i] === "duoi-10-trieu") {
        priceCondition.push({ price: { $lt: 10000000 } });
      } else if (priceInput[i] === "10-15-trieu") {
        priceCondition.push({ price: { $gte: 10000000, $lte: 15000000 } });
      } else if (priceInput[i] === "15-20-trieu") {
        priceCondition.push({ price: { $gte: 15000000, $lte: 20000000 } });
      } else {
        priceCondition.push({ price: { $gte: 20000000 } });
      }
    }
    query.$or = priceCondition;
  }

  let sortOption: any = {};
  if (sort) {
    if (sort === "gia-tang-dan") {
      sortOption = { price: 1 };
    } else if (sort === "gia-giam-dan") {
      sortOption = { price: -1 };
    }
  }

  const skip = (page - 1) * pageSize;

  const products = await db
    .collection("products")
    .find(query)
    .sort(sortOption)
    .skip(skip)
    .limit(pageSize)
    .toArray();

  const count = await db.collection("products").countDocuments(query);
  const totalPages = Math.ceil(count / pageSize);

  return { products, totalPages };
};

export { getProductWithFilter };
