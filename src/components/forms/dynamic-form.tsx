"use client";

import { useState } from "react";
import type { JsonSchemaField } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface DynamicFormProps {
  fields: JsonSchemaField[];
  onSubmit: (responses: Record<string, unknown>) => Promise<void>;
}

export function DynamicForm({ fields, onSubmit }: DynamicFormProps) {
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const field of fields) {
      initial[field.name] = "";
    }
    return initial;
  });

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const responses: Record<string, unknown> = {};
    for (const field of fields) {
      const val = values[field.name];
      responses[field.name] = field.type === "number" ? Number(val) : val;
    }

    try {
      await onSubmit(responses);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {fields.map((field) => (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name}>
            {field.label}
            {field.required && <span className="ml-1 text-destructive">*</span>}
          </Label>

          {field.type === "text" && (
            <Input
              id={field.name}
              value={values[field.name]}
              onChange={(e) => handleChange(field.name, e.target.value)}
              required={field.required}
            />
          )}

          {field.type === "number" && (
            <Input
              id={field.name}
              type="number"
              value={values[field.name]}
              onChange={(e) => handleChange(field.name, e.target.value)}
              onWheel={(e) => e.currentTarget.blur()}
              required={field.required}
            />
          )}

          {field.type === "textarea" && (
            <Textarea
              id={field.name}
              value={values[field.name]}
              onChange={(e) => handleChange(field.name, e.target.value)}
              required={field.required}
              rows={4}
              className="resize-none"
            />
          )}

          {field.type === "select" && (
            <Select
              value={values[field.name]}
              onValueChange={(val) => handleChange(field.name, val)}
              required={field.required}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccioná una opción" />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      ))}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Enviar respuestas
      </Button>
    </form>
  );
}
