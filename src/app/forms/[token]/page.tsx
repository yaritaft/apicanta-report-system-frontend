"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getFormByToken, submitForm } from "@/lib/api";
import type { FormInstance, JsonSchemaField } from "@/types";
import { DynamicForm } from "@/components/forms/dynamic-form";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const DEMO_FIELDS: JsonSchemaField[] = [
  {
    name: "estado_animo",
    label: "¿Cómo te sentís esta semana?",
    type: "select",
    required: true,
    options: ["Muy bien", "Bien", "Regular", "Mal", "Muy mal"],
  },
  {
    name: "horas_estudio",
    label: "¿Cuántas horas estudiaste esta semana?",
    type: "number",
    required: true,
  },
  {
    name: "materia_dificultad",
    label: "¿En qué materia tuviste más dificultad?",
    type: "text",
    required: false,
  },
  {
    name: "nivel_estres",
    label: "Nivel de estrés (1 a 10)",
    type: "number",
    required: true,
  },
  {
    name: "necesita_ayuda",
    label: "¿Necesitás ayuda con algo?",
    type: "select",
    required: true,
    options: [
      "No, estoy bien",
      "Sí, con una materia",
      "Sí, tema personal",
      "Sí, orientación vocacional",
    ],
  },
  {
    name: "comentarios",
    label: "Comentarios adicionales",
    type: "text",
    required: false,
  },
];

type PageState =
  | "loading"
  | "form"
  | "done"
  | "expired"
  | "submitted"
  | "error";

export default function FormPage() {
  const params = useParams();
  const token = params.token as string;
  const isDemo = token === "demo";
  const [state, setState] = useState<PageState>(isDemo ? "form" : "loading");
  const [form, setForm] = useState<FormInstance | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isDemo) return;

    async function load() {
      try {
        const data = await getFormByToken(token);
        setForm(data);

        if (data.status === "DONE") {
          setState("done");
        } else if (
          data.status === "EXPIRED" ||
          new Date(data.expiresAt) < new Date()
        ) {
          setState("expired");
        } else {
          setState("form");
        }
      } catch (err) {
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "Error al cargar el formulario",
        );
        setState("error");
      }
    }
    load();
  }, [token, isDemo]);

  const handleSubmit = async (responses: Record<string, unknown>) => {
    if (isDemo) {
      console.log("[DEMO] Respuestas:", responses);
      setState("submitted");
      return;
    }

    try {
      await submitForm(token, responses);
      setState("submitted");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error al enviar respuestas",
      );
    }
  };

  const formFields = isDemo
    ? DEMO_FIELDS
    : form?.template.jsonSchema.fields ?? [];

  const templateName = isDemo
    ? "Reporte Semanal de Seguimiento"
    : form?.template.name ?? "";

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-lg">
        {state === "loading" && (
          <CardContent className="space-y-4 pt-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        )}

        {state === "form" && (
          <>
            <CardHeader>
              {isDemo && (
                <Badge variant="outline" className="mb-2 w-fit">
                  MODO DEMO — no se envía nada
                </Badge>
              )}
              <CardTitle>{templateName}</CardTitle>
              <CardDescription>
                Completá el formulario de la semana.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DynamicForm fields={formFields} onSubmit={handleSubmit} />
            </CardContent>
          </>
        )}

        {state === "submitted" && (
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <CardTitle>{isDemo ? "Demo completado" : "¡Gracias!"}</CardTitle>
            <p className="text-muted-foreground">
              {isDemo
                ? "Las respuestas se loguearon en la consola del browser."
                : "Tus respuestas fueron enviadas correctamente."}
            </p>
          </CardContent>
        )}

        {state === "done" && (
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <Clock className="h-16 w-16 text-blue-500" />
            <CardTitle>Ya completado</CardTitle>
            <p className="text-muted-foreground">
              Ya completaste este formulario.
            </p>
          </CardContent>
        )}

        {state === "expired" && (
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <XCircle className="h-16 w-16 text-red-500" />
            <CardTitle>Formulario expirado</CardTitle>
            <p className="text-muted-foreground">
              Este formulario ya no está disponible.
            </p>
          </CardContent>
        )}

        {state === "error" && (
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <AlertTriangle className="h-16 w-16 text-yellow-500" />
            <CardTitle>Error</CardTitle>
            <p className="text-muted-foreground">
              {errorMessage || "No se pudo cargar el formulario."}
            </p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
