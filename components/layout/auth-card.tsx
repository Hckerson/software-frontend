import Link from "next/link";
import { Gauge } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
    title: string;
    description: string;
    children: ReactNode;
}

export default function AuthCard({ title, description, children }: Props) {
    return (
        <section className="auth-card">
            <Link href="/" className="text-text flex items-center gap-2">
                <Gauge className="text-accent size-4" strokeWidth={1.5} />
                <span className="font-display text-h6">Meter</span>
            </Link>
            <div className="flex flex-col gap-1">
                <h1 className="text-text font-display text-h5">{title}</h1>
                <p className="text-text-secondary text-sm">{description}</p>
            </div>
            {children}
        </section>
    );
}
