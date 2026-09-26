"use client";
import SectionCard from "@/components/common/section-card";
import Skeleton from "@/components/common/skeleton";
import ErrorState from "@/components/common/error-state";
import ProfileFields from "@/components/sections/settings/profile-fields";
import { useCurrentUser } from "@/lib/hooks/use-account";

export default function ProfileForm() {
    const { data, isPending, isError, error, refetch } = useCurrentUser();

    return (
        <SectionCard
            title="Profile"
            description="Your name and contact details on invoices."
        >
            {isPending && <Skeleton lines={5} />}

            {isError && (
                <ErrorState error={error} onRetry={() => void refetch()} />
            )}

            {data && <ProfileFields key={data.id} user={data} />}
        </SectionCard>
    );
}
