const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const environment = process.env.NEXT_PUBLIC_ENV === "production" ? "production" : "development";
export const isDev = environment === "development";
export const isLocalApi = apiUrl.includes("localhost");
export const isPointingToProd = isDev && !isLocalApi;

export const envLabel = isLocalApi
  ? `DEV — ${apiUrl.replace("http://", "")}`
  : `DEV — PROD DB`;
