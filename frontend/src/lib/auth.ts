/**
 * Auth types and utilities for PracticeGenius
 */

export interface PracticeGeniusUser {
  id: string;
  name?: string;
  email: string;
  role: 'admin' | 'user';
  isEmailVerified?: boolean;
}

export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

export function isAdmin(user?: PracticeGeniusUser | null): boolean {
  return user?.role === ROLES.ADMIN;
}

export function isUser(user?: PracticeGeniusUser | null): boolean {
  return user?.role === ROLES.USER;
}

export function isAuthenticated(user?: PracticeGeniusUser | null): boolean {
  return !!user;
}

export function isEmailVerified(user?: PracticeGeniusUser | null): boolean {
  return !!user?.isEmailVerified;
}

export function hasRequiredRole(user: PracticeGeniusUser | null | undefined, requiredRoles: string[]): boolean {
  if (!user) return false;
  return requiredRoles.includes(user.role);
}
