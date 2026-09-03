import DetailRow from "@/components/common/detail-row";
import StatusPill from "@/components/common/status-pill";
import Money from "@/components/common/money";
import PeriodRange from "@/components/common/period-range";
import { EMPTY_VALUE } from "@/lib/constants";
import { formatDate, titleCase } from "@/lib/utils/format";
import type { Subscription } from "@/lib/types";

export default function SubscriptionFacts({
    subscription,
}: {
    subscription: Subscription;
}) {
    const plan = subscription.plan;

    return (
        <dl className="flex flex-col">
            <DetailRow label="Plan">{plan?.name ?? EMPTY_VALUE}</DetailRow>
            <DetailRow label="Tier">
                {plan ? titleCase(plan.planType) : EMPTY_VALUE}
            </DetailRow>
            <DetailRow label="Price">
                <Money amount={plan?.priceUSD} showCurrency />
            </DetailRow>
            <DetailRow label="Status">
                <StatusPill status={subscription.status} />
            </DetailRow>
            <DetailRow label="Current period">
                <PeriodRange
                    start={subscription.currentBillingPeriodStart}
                    end={subscription.currentBillingPeriodEnd}
                />
            </DetailRow>
            <DetailRow label="Renews">
                {formatDate(subscription.renewalDate)}
            </DetailRow>
            {subscription.canceledAt && (
                <DetailRow label="Cancelled">
                    {formatDate(subscription.canceledAt)}
                </DetailRow>
            )}
        </dl>
    );
}
