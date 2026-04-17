import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/lib/auth";
import { ToastProvider } from "@/components/ui/Toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "AutoCare Pro - Car Servicing & Auto Parts",
  description:
    "Book car servicing appointments, purchase auto parts and accessories, and track your vehicle service history.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <main className="flex-1 animate-fade-in">{children}</main>
            <Footer />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
