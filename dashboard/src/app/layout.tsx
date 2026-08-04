import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "St. Genevieve Knights Admin",
  description: "Administration dashboard for Knights of Columbus Council 14772",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
