'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ClientLayout } from "@/components/LayoutContent";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={inter.className} suppressHydrationWarning={true}>
                <ThemeProvider>
                    <ClientLayout>{children}</ClientLayout>
                </ThemeProvider>
            </body>
        </html>
    );
}
