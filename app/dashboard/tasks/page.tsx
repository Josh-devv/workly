import { redirect } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";

export default async function TasksPage() {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="p-6">
        <h1>Tasks</h1>
        <p>Please sign in again.</p>
        <a href="/login" className="text-[#0e5d53] underline">
          Go to login
        </a>
      </main>
    );
  }

  // Fetch tasks from the database
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main>
        <h1>Tasks</h1>
        <p>Unable to load tasks.</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Tasks</h1>

      {tasks.length === 0 ? (
        <p>You don't have any tasks yet.</p>
      ) : (
        <div>
          {tasks.map((task) => (
            <div key={task.id}>
              <h2>{task.name}</h2>

              {task.description && (
                <p>{task.description}</p>
              )}

              {task.client_email && (
                <p>{task.client_email}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}