import { supabase } from "@/app/lib/supabase";

export default async function TestPage() {
  const { data, error } = await supabase
    .from("clients")
    .select("*");

  if (error) {
    return (
      <div>
        <h1>Database Error</h1>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Clients</h1>
      <pre>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}