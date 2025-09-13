import type { Metadata } from "next";
import "./globals.css";
import TopBar from "@/components/TopBar";
import { AuthProvider } from "@/hooks/contexts/AuthContext";
import { Toaster } from "sonner";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

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
      <body
        className="bg-[#141623] text-white"
        style={{
          backgroundImage: 'url("/background/bg_with_blur.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <AuthProvider>
          <TopBar />
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
