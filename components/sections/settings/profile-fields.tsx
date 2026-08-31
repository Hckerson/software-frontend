"use client";
import { useState } from "react";
import Button from "@/components/common/button";
import FormField from "@/components/common/form-field";
import ErrorState from "@/components/common/error-state";
import { useUpdateAccount } from "@/lib/hooks/use-account";
import type { AccountUser } from "@/lib/types";
import type { FormEvent } from "react";

export default function ProfileFields({ user }: { user: AccountUser }) {
    const update = useUpdateAccount(user.id);
    const [fullName, setFullName] = useState(user.fullName);
    const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber ?? "");
    const [bio, setBio] = useState(user.bio ?? "");

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();
        update.mutate({ fullName, phoneNumber, bio });
    };

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
            <div className="form-grid">
                <FormField
                    label="Full name"
                    value={fullName}
                    onChange={setFullName}
                    autoComplete="name"
                    required
                />
                <FormField
                    label="Phone number"
                    type="tel"
                    value={phoneNumber}
                    onChange={setPhoneNumber}
                    autoComplete="tel"
                />
            </div>
            <FormField label="Bio" value={bio} onChange={setBio} />

            {update.isError && <ErrorState error={update.error} />}

            {update.isSuccess && (
                <p className="text-success text-xs">Profile saved.</p>
            )}

            <div className="flex justify-end">
                <Button type="submit" isLoading={update.isPending}>
                    Save changes
                </Button>
            </div>
        </form>
    );
}
