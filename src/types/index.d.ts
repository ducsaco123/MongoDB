declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      password?: string;
      fullName?: string | null;
      address?: string | null;
      phone?: string | null;
      accountType: string;
      avatar?: string | null;
      roleId: number;
      role?: any;
      sumCart?: number;
    }
  }
}

export {};
