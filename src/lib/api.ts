import { getAuthHeader } from "./auth";
import type {
  StudentStatus,
  Student,
  CreateStudentDto,
  StudentHistoryResponse,
  FormInstance,
  DevGenerateResult,
  DevSendEmailsResult,
  DevResetResult,
} from "@/types";

const API_URL = "/api/proxy";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = true,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (auth) {
    const authHeader = getAuthHeader();
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.text();
    let message: string;
    try {
      const json = JSON.parse(body);
      message = json.message || json.error || body;
    } catch {
      message = body;
    }
    throw new ApiError(res.status, message);
  }

  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text);
}

// Auth
export const validateAuth = () =>
  request<unknown>("/dashboard/students-status", {}, true);

// Dashboard
export const getStudentsStatus = () =>
  request<StudentStatus[]>("/dashboard/students-status");

export const getStudentHistory = (id: string) =>
  request<StudentHistoryResponse>(`/dashboard/students/${id}/history`);

// Students
export const getStudents = () => request<Student[]>("/students");

export const createStudent = (data: CreateStudentDto) =>
  request<Student>("/students", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const toggleStudentActive = (id: string) =>
  request<Student>(`/students/${id}/toggle-active`, {
    method: "PATCH",
  });

// Forms (public)
export const getFormByToken = (token: string) =>
  request<FormInstance>(`/forms/${token}`, {}, false);

export const submitForm = (token: string, responses: Record<string, unknown>) =>
  request<{ id: string; status: string; completedAt: string }>(
    `/forms/${token}/submit`,
    {
      method: "POST",
      body: JSON.stringify({ responses }),
    },
    false,
  );

// Dev endpoints (only used in development)
export const devGenerateForms = () =>
  request<DevGenerateResult>("/dashboard/dev/generate-forms", {
    method: "POST",
  });

export const devSendEmails = () =>
  request<DevSendEmailsResult>("/dashboard/dev/send-emails", {
    method: "POST",
  });

export const devReset = () =>
  request<DevResetResult>("/dashboard/dev/reset", {
    method: "POST",
  });
