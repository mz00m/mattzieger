import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Matt Zieger',
  description: 'Matt Zieger - Projects and Experiments',
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
