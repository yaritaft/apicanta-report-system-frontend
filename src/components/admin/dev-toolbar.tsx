"use client";

import { useState } from "react";
import { isDev, envLabel, isPointingToProd } from "@/lib/env";
import { devGenerateForms, devSendEmails, devReset } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Loader2,
  Trash2,
  FileUp,
  Mail,
  Database,
  FlaskConical,
  AlertTriangle,
} from "lucide-react";

interface DevToolbarProps {
  onMockToggle: () => void;
  isMockActive: boolean;
  onRefresh: () => void;
}

export function DevToolbar({
  onMockToggle,
  isMockActive,
  onRefresh,
}: DevToolbarProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  if (!isDev) return null;

  const runAction = async (
    name: string,
    action: () => Promise<unknown>,
    successMsg: (result: unknown) => string,
  ) => {
    setLoadingAction(name);
    try {
      const result = await action();
      toast.success(successMsg(result));
      onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Error en ${name}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReset = () =>
    runAction("reset", devReset, (r) => {
      const res = r as { deleted: number };
      return `Reset: ${res.deleted} form instances eliminadas`;
    });

  const handleGenerate = () =>
    runAction("generate", devGenerateForms, (r) => {
      const res = r as {
        results: { status: string; fullName: string; magicLink: string }[];
      };
      const created = res.results.filter((x) => x.status === "created");
      const skipped = res.results.filter((x) => x.status === "skipped");
      let msg = `Forms: ${created.length} creados, ${skipped.length} omitidos`;
      if (created.length > 0) {
        msg += `\nLinks copiados a consola`;
        console.log(
          "[DEV] Magic links:",
          created.map((c) => ({ name: c.fullName, link: c.magicLink })),
        );
      }
      return msg;
    });

  const handleSendEmails = () =>
    runAction("emails", devSendEmails, (r) => {
      const res = r as { enqueued: number; alreadySent: number };
      return `Emails: ${res.enqueued} encolados, ${res.alreadySent} ya enviados`;
    });

  const isLoading = (name: string) => loadingAction === name;

  return (
    <div className="space-y-0">
      {isPointingToProd && (
        <div className="flex items-center gap-2 border-b-2 border-dashed border-red-400 bg-red-50 px-4 py-1.5">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-red-700">
            Apuntando a base de datos de produccion
          </span>
        </div>
      )}

      <div
        className={`border-b-2 border-dashed px-4 py-2 ${
          isPointingToProd
            ? "border-red-300 bg-red-50/50"
            : "border-amber-400 bg-amber-50"
        }`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <FlaskConical
              className={`h-4 w-4 ${isPointingToProd ? "text-red-600" : "text-amber-600"}`}
            />
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                isPointingToProd ? "text-red-700" : "text-amber-700"
              }`}
            >
              {envLabel}
            </span>
          </div>

          <div
            className={`h-4 w-px ${isPointingToProd ? "bg-red-300" : "bg-amber-300"}`}
          />

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={!!loadingAction}
              className={`text-xs h-7 ${
                isPointingToProd
                  ? "border-red-300 bg-white text-red-800 hover:bg-red-100"
                  : "border-amber-300 bg-white text-amber-800 hover:bg-amber-100"
              }`}
            >
              {isLoading("reset") ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : (
                <Trash2 className="mr-1 h-3 w-3" />
              )}
              Reset
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerate}
              disabled={!!loadingAction}
              className={`text-xs h-7 ${
                isPointingToProd
                  ? "border-red-300 bg-white text-red-800 hover:bg-red-100"
                  : "border-amber-300 bg-white text-amber-800 hover:bg-amber-100"
              }`}
            >
              {isLoading("generate") ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : (
                <FileUp className="mr-1 h-3 w-3" />
              )}
              Generar Forms
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSendEmails}
              disabled={!!loadingAction}
              className={`text-xs h-7 ${
                isPointingToProd
                  ? "border-red-300 bg-white text-red-800 hover:bg-red-100"
                  : "border-amber-300 bg-white text-amber-800 hover:bg-amber-100"
              }`}
            >
              {isLoading("emails") ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : (
                <Mail className="mr-1 h-3 w-3" />
              )}
              Enviar Emails
            </Button>

            <div
              className={`h-4 w-px ${isPointingToProd ? "bg-red-300" : "bg-amber-300"}`}
            />

            <Button
              variant="outline"
              size="sm"
              onClick={onMockToggle}
              className={`text-xs h-7 ${
                isMockActive
                  ? "border-purple-400 bg-purple-50 text-purple-700 hover:bg-purple-100"
                  : isPointingToProd
                    ? "border-red-300 bg-white text-red-800 hover:bg-red-100"
                    : "border-amber-300 bg-white text-amber-800 hover:bg-amber-100"
              }`}
            >
              <Database className="mr-1 h-3 w-3" />
              Mock 1000 {isMockActive ? "ON" : "OFF"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
