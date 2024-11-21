import type { Metadata } from "next";
import "./globals.css";
import { TopBar } from "@/components/TopBar";
import { AuthProvider } from "@/components/auth/authContext";

export const metadata: Metadata = {
  title: "Clip It Chat",
  description: "Pintrest for gamers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#001d3d] text-white">
        <AuthProvider>
          <TopBar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
