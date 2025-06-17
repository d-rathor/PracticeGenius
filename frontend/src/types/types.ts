// src/types.ts (or a similar path)
import { NextPage } from 'next';
import { ReactElement, ReactNode } from 'react';

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  status?: string | null;
  activeSubscription?: string | null;
  createdAt?: string | null;
  // Add other user-specific fields as necessary
}