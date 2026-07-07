import AuthCollage from "./auth-collage";

export default function AuthTemplate({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="bg-background mx-auto box-border grid h-screen max-h-screen w-full sm:grid-cols-[60%_auto] xl:max-w-500">
            <div className="pr hidden h-screen grow-0 rounded-2xl p-4 sm:block lg:p-6">
                <div className="h-full w-full overflow-hidden rounded-2xl">
                    <AuthCollage />
                </div>
            </div>
            <div className="flex h-full justify-center overflow-auto bg-linear-to-bl from-[#0656CD]/10 from-60% to-[#050C14]/60 px-3 py-6 [scrollbar-width:none] md:pr-4! lg:px-12 lg:pr-12!">
                {" "}
                {children}
            </div>
        </div>
    );
}
