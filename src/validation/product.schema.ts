import { z } from "zod";

export const ProductSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .trim()
    .min(1, { message: "Tên sản phẩm không được để trống" }),
  price: z
    .string()
    .transform((val) => (val === "" ? 0 : Number(val)))
    .refine((num) => num > 0, { message: "Giá sản phẩm phải lớn hơn 0" }),
  detailDesc: z
    .string()
    .trim()
    .min(1, { message: "Mô tả chi tiết không được để trống" }),
  shortDesc: z
    .string()
    .trim()
    .min(1, { message: "Mô tả ngắn không được để trống" }),
  quantity: z
    .string()
    .transform((val) => (val === "" ? 0 : Number(val)))
    .refine((num) => num > 0, { message: "Số lượng phải lớn hơn 0" }),
  factory: z
    .string()
    .trim()
    .min(1, { message: "Tên nhà sản xuất không được để trống" }),
  target: z
    .string()
    .trim()
    .min(1, { message: "Đối tượng sử dụng không được để trống" }),
});

export type TProductSchecma = z.infer<typeof ProductSchema>;
