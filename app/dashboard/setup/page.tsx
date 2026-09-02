"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOrganization } from "@/app/actions/organizations";

export default function OrganizationSetup() {
  const [organizationName, setOrganizationName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await createOrganization(organizationName);

      router.push("/dashboard");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>Create your organization</h1>

      <p>
        Set up your workspace to start managing your clients and projects.
      </p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={organizationName}
          onChange={(e) => setOrganizationName(e.target.value)}
          placeholder="Organization name"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create organization"}
        </button>
      </form>

      {error && <p>{error}</p>}
    </main>
  );
}