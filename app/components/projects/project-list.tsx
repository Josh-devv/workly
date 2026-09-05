interface Client {
  id: string;
  name: string;
}


type Project = {
  client_id: string;
  name: string;
  description?: string;
  status: string;
  rateType: string;
  rate?: number;
  startDate?: string;
  deadline?: string;
    created_at?: string;
};

interface ProjectListProps {
  project: Project;
  clients: Client[];
}


const ProjectList = ({ project, clients }: ProjectListProps) => {
  const client = clients.find((c) => c.id === project.client_id);// Find the client object based on the client_id in the project

  return (
    <div className="flex flex-col gap-3 rounded-[22px] border border-[#cfe1d8] bg-[#f7faf8] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-lg font-semibold text-slate-900">{project.name}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600">
          {project.description && (
            <p className="text-slate-600">{project.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-[#0e5d53]">
        <span className="rounded-full bg-[#e5f3ef] px-2.5 py-1 font-medium uppercase tracking-[0.14em]">
          {client ? client.name : "Unknown client"}
        </span>
        {project.created_at ? (
          <span className="text-slate-500">
            {new Date(project.created_at).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        ) : null}
      </div>
    </div>
  );
};

export default ProjectList;