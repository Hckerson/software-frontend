import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";
import Provider from "@/components/providers/provider";
import { display, sans, mono } from "@/public/fonts/font";

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    colorScheme: "light dark",
};

export const metadata: Metadata = {
    title: "Meter — subscription billing & usage metering",
    description:
        "Watch API calls, storage and seats against your plan limits, and upgrade before you hit a ceiling.",
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
