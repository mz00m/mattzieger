import type { Metadata } from 'next';
import '../globals.css';

export const metadata: Metadata = {
  title: 'The Eternal Dinner Party | Matt Zieger',
  description: 'Seat history\'s greatest minds at your table. Choose your guests, set the topic, and listen as they debate, disagree, and dine.',
};

export default function DinnerPartyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
