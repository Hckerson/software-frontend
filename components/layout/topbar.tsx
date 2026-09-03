"use client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/button";
import ThemeToggle from "@/components/layout/theme-toggle";
import { useLogout } from "@/lib/hooks/use-auth";
import { useCurrentUser } from "@/lib/hooks/use-account";
import { LOGIN_PATH } from "@/lib/constants";

export default function Topbar() {
    const router = useRouter();
    const logout = useLogout();
    const { data: user } = useCurrentUser();

    const signOut = () =>
        logout.mutate(undefined, {
            onSettled: () => router.replace(LOGIN_PATH),
        });

    return (
        <header className="app-topbar">
            <div className="flex min-w-0 flex-col">
                <span className="text-text truncate text-sm font-medium">
                    {user?.fullName ?? "Loading account"}
                </span>
                <span className="text-text-muted truncate text-xs">
                    {user?.email ?? ""}
                </span>
            </div>
            <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button
                    tone="ghost"
                    size="sm"
                    isLoading={logout.isPending}
                    onClick={signOut}
                >
                    <LogOut className="size-3" strokeWidth={1.5} />
                    Sign out
                </Button>
            </div>
        </header>
    );
}
