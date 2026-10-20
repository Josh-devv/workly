import "server-only";

import { apiRequest } from "@/app/lib/api/server";

type ProjectResponse = {
  id: string;
  name: string;
  organizationId: string;
  clientId: string;
  description: string;
  status: string | null;
  rateType: string | null;
  rate: number | null;
  startDate: string | null;
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Project = {
  id: string;
  name: string;
  organization_id: string;
  client_id: string;
  description: string;
  status: string;
  rate_type: string;
  rate: number | null;
  start_date: string | null;
  deadline: string | null;
  created_at: string;
  updated_at: string;
};

function toProject(project: ProjectResponse): Project {
  return {
    id: project.id,
    name: project.name,
    organization_id: project.organizationId,
    client_id: project.clientId,
    description: project.description,
    status: project.status ?? "planning",
    rate_type: project.rateType ?? "fixed",
    rate: project.rate,
    start_date: project.startDate?.slice(0, 10) ?? null,
    deadline: project.deadline?.slice(0, 10) ?? null,
    created_at: project.createdAt,
    updated_at: project.updatedAt,
  };
}

export async function getProjectsForOrganization(
  organizationId: string,
): Promise<Project[]> {
  const response = await apiRequest<ProjectResponse[]>("/api/Project");
  if (!Array.isArray(response)) {
    throw new Error("The project service returned an invalid project list.");
  }

  return response
    .map(toProject)
    .filter((project) => project.organization_id === organizationId);
}

export async function getProjectById(projectId: string): Promise<Project> {
  const response = await apiRequest<ProjectResponse>(
    `/api/Project/${encodeURIComponent(projectId)}`,
  );
  return toProject(response);
}
