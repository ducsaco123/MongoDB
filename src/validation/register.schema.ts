import { isEmailExist } from "services/auth/auth.service";
import { z } from "zod";

const emailSchema = z
  .string()
  .email("Email không đúng định dạng")
  .refine(
    async (email) => {
      const existingUser = await isEmailExist(email);
      return !existingUser;
    },
    { message: "Email already exists", path: ["email"] },
  );

const passwordSchema = z
  .string()
  .min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự" })
  .max(20, { message: "Mật khẩu không được quá 20 ký tự" })
  .refine((password) => /[A-Z]/.test(password), {
    message: "Mật khẩu phải chứa ít nhất một ký tự viết hoa",
  })
  .refine((password) => /[a-z]/.test(password), {
    message: "Mật khẩu phải chứa ít nhất một ký tự viết thường",
  })
  .refine((password) => /[0-9]/.test(password), {
    message: "Mật khẩu phải chứa ít nhất một chữ số",
  })
  .refine((password) => /[!@#$%^&*]/.test(password), {
    message: "Mật khẩu phải chứa ít nhất một ký tự đặc biệt",
  });

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(1, { message: "Tên không được để trống" }),
    username: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type TRegisterSchema = z.infer<typeof registerSchema>;
