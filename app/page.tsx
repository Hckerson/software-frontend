import LandingHero from "@/components/sections/landing/landing-hero";
import LandingPlans from "@/components/sections/landing/landing-plans";

export default function HomePage() {
    return (
        <main className="bg-background min-h-screen">
            <LandingHero />
            <LandingPlans />
        </main>
    );
}
