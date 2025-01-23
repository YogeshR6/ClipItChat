import type { Metadata } from "next";
import "./globals.css";
import TopBar from "@/components/TopBar";
import { AuthProvider } from "@/hooks/contexts/AuthContext";

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
      <body>
        <AuthProvider>
          <div className="w-[100dvw] h-[100dvh]">
            <TopBar />
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
