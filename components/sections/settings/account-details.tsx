"use client";
import SectionCard from "@/components/common/section-card";
import DetailRow from "@/components/common/detail-row";
import StatusPill from "@/components/common/status-pill";
import Skeleton from "@/components/common/skeleton";
import ErrorState from "@/components/common/error-state";
import { EMPTY_VALUE } from "@/lib/constants";
import { formatDate, titleCase } from "@/lib/utils/format";
import { useCurrentUser } from "@/lib/hooks/use-account";

export default function AccountDetails() {
    const { data, isPending, isError, error, refetch } = useCurrentUser();

    return (
        <SectionCard
            title="Account"
            description="Managed by your administrator."
        >
            {isPending && <Skeleton lines={4} />}

            {isError && (
                <ErrorState error={error} onRetry={() => void refetch()} />
            )}

            {data && (
                <dl className="flex flex-col">
                    <DetailRow label="Email">{data.email}</DetailRow>
                    <DetailRow label="Role">{titleCase(data.role)}</DetailRow>
                    <DetailRow label="Account status">
                        <StatusPill status={data.status} />
                    </DetailRow>
                    <DetailRow label="Member since">
                        {formatDate(data.createdAt)}
                    </DetailRow>
                    <DetailRow label="Last active">
                        {data.lastActive
                            ? formatDate(data.lastActive)
                            : EMPTY_VALUE}
                    </DetailRow>
                </dl>
            )}
        </SectionCard>
    );
}
