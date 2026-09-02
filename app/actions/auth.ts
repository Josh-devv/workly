"use server";

import { createClient } from "@/app/lib/supabase/server";

export async function loginWithEmailPassword(email: string, password: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}
