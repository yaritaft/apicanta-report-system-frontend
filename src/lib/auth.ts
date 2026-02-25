const AUTH_KEY = "apicanta_auth";

export function getAuthHeader(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(AUTH_KEY);
}

export function setAuth(username: string, password: string): void {
  const encoded = btoa(`${username}:${password}`);
  sessionStorage.setItem(AUTH_KEY, `Basic ${encoded}`);
}

export function clearAuth(): void {
  sessionStorage.removeItem(AUTH_KEY);
}

export function isAuthenticated(): boolean {
  return !!getAuthHeader();
}
