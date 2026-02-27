export interface Student {
  id: string;
  externalId: string;
  email: string;
  fullName: string;
  isActive: boolean;
  lastCompletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JsonSchemaField {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "textarea";
  required: boolean;
  options?: string[];
}

export interface JsonSchema {
  fields: JsonSchemaField[];
}

export interface StudentStatus {
  studentId: string;
  externalId: string;
  fullName: string;
  email: string;
  isActive: boolean;
  weekStatus: "completed" | "pending" | "expired" | "not_sent";
  completedAt: string | null;
  consecutiveWeeksMissed: number;
  magicLink: string | null;
}

export interface StudentHistoryEntry {
  weekOf: string;
  status: "SENT" | "DONE" | "EXPIRED";
  sentAt: string;
  completedAt: string | null;
  expiresAt: string;
  token: string;
}

export interface StudentHistoryResponse {
  student: {
    id: string;
    fullName: string;
    email: string;
    externalId: string;
  };
  history: StudentHistoryEntry[];
}

export interface FormInstance {
  formInstanceId: string;
  status: "SENT" | "DONE" | "EXPIRED";
  expiresAt: string;
  template: {
    name: string;
    jsonSchema: JsonSchema;
  };
}

export interface CreateStudentDto {
  fullName: string;
  email: string;
  externalId: string;
}

export interface DevGenerateResult {
  weekOf: string;
  results: {
    studentId: string;
    fullName: string;
    status: "created" | "skipped";
    magicLink: string;
  }[];
}

export interface DevSendEmailsResult {
  enqueued: number;
  alreadySent: number;
}

export interface DevResetResult {
  deleted: number;
}
