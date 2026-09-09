import { redirect } from "next/navigation";

import { createClient } from "@/app/lib/supabase/server";
import { getCurrentMembership } from "@/app/lib/supabase/organization";

export default async function SetupLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && (await getCurrentMembership(user.id))) {
    redirect("/dashboard");
  }

  return children;
}