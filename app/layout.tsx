import "../styles/globals.css";
import type { Metadata, Viewport } from "next";
import Provider from "@/components/providers/provider";

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
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
        <html lang="en">
            <body className="antialiased">
                <Provider>{children}</Provider>
            </body>
        </html>
    );
}
