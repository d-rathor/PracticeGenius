import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { NextPageWithLayout } from '@/types/types'; // Corrected import path

// If loading a variable font, you don't need to specify the font weight
const inter = Inter({ subsets: ['latin'] });

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps: { session, ...pageProps } }: AppPropsWithLayout) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <AuthProvider>
      <main className={inter.className}>
        {getLayout(<Component {...pageProps} />)}
      </main>
    </AuthProvider>
  );
}