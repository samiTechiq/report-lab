export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'inactive';

export interface User {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  role: UserRole;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export type CreateUserInput = Omit<User, 'id' | 'createdAt' | 'updatedAt'> & {
  password: string;
};
export type UpdateUserInput = Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>;
