'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ClientLayout } from "@/components/LayoutContent";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning={true}>
            <body className={inter.className} suppressHydrationWarning={true}>
                <ThemeProvider>
                    <AuthProvider>
                        <ClientLayout>{children}</ClientLayout>
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
