import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";
import Provider from "@/components/providers/provider";
import { display, sans, mono } from "@/public/fonts/font";

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    colorScheme: "light",
    themeColor: "#ffffff",
};

export const metadata: Metadata = {
    title: "Next.js App Router Starter",
    description: "Opinionated Next.js starter with layered architecture",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html
            lang="en"
            className={`${display.variable} ${sans.variable} ${mono.variable}`}
        >
            <body className="bg-background text-text font-body antialiased">
                <Provider>{children}</Provider>
            </body>
        </html>
    );
}
