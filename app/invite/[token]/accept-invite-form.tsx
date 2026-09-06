"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { acceptInvitation } from "@/app/actions/invites";
import { Button } from "@/app/components/ui/button";

export default function AcceptInviteForm({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);

  async function handleAccept() {
    setError("");
    setLoading(true);

    const result = await acceptInvitation(token);

    if (result.error) {
      setError(result.error);
    } else {
      setAccepted(true);
      router.push("/dashboard");
      router.refresh();
    }

    setLoading(false);
  }

  if (accepted) {
    return <p className="text-sm font-medium text-[#0e5d53]">Invitation accepted.</p>;
  }

  return (
    <div className="space-y-3">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      <Button type="button" onClick={handleAccept} disabled={loading} className="w-full">
        {loading ? "Joining workspace..." : "Accept invitation"}
      </Button>
    </div>
  );
}