import './globals.css';
import { FormStateProvider } from '@/components/FormStateProvider';
import Nav from '@/components/Nav';

export const metadata = {
  title: 'Rho Partner Tools',
  description: 'Internal tool for creating partner landing pages.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <FormStateProvider>
          <Nav />
          <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
        </FormStateProvider>
      </body>
    </html>
  );
}
