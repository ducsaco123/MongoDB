import { User as UserPrisma, Role } from "@prisma/client";

declare global {
  namespace Express {
    interface User extends UserPrisma {
      role?: Role;
      sumCart?: number;
    }
  }
}
