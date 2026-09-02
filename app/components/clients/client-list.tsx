type Props = {
  id: string;
  name: string;
  email?: string | null;
  company?: string | null;
  created_at?: string;
};

const ClientList = ({ client }: { client: Props }) => {
  return (
    <div className="flex flex-col gap-3 rounded-[22px] border border-[#cfe1d8] bg-[#f7faf8] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-lg font-semibold text-slate-900">{client.name}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600">
          {client.company ? <span>{client.company}</span> : <span>Independent client</span>}
          {client.email ? (
            <>
              <span className="text-slate-300">•</span>
              <span>{client.email}</span>
            </>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-[#0e5d53]">
        <span className="rounded-full bg-[#e5f3ef] px-2.5 py-1 font-medium uppercase tracking-[0.14em]">
          Client
        </span>
        {client.created_at ? (
          <span className="text-slate-500">
            {new Date(client.created_at).toLocaleDateString(undefined, {
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

export default ClientList;