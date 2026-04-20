import type { Metadata } from "next";
import { Kanit, Madimi_One } from "next/font/google";

const kanit = Kanit({
  subsets: ["thai", "latin"],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: "--font-kanit",
});

const madimiOne = Madimi_One({
  subsets: ["latin"],
  weight: ['400'],
  variable: "--font-madimi",
});

export const metadata: Metadata = {
  title: "MODPAO - Machine",
  description: "A Web site Run On Vending Machine",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className={`${kanit.className} ${madimiOne.variable}`}>{children}</body>
    </html>
  );
}
