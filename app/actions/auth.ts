"use server";

import { createClient } from "@/app/lib/supabase/server";

export async function loginWithEmailPassword(
  email: string,
  password: string
) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  console.log("Login successful");
  console.log("Access token:", data.session?.access_token);

  return { error: null };
}