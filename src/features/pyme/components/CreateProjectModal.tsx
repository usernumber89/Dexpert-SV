"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { toast } from "sonner";
import { X, Sparkles } from "lucide-react";

const schema = z.object({
  projectName: z.string().min(3, "Name is required"),
  description: z.string().min(10, "Description is required"),
  skills: z.string().min(2, "Skills are required"),
  prompt: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function CreateProjectModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { projectName: "", description: "", skills: "", prompt: "" },
  });

  const generateWithAI = async () => {
    const prompt = watch("prompt")?.trim();
    if (!prompt) { toast.error("Write a prompt first"); return; }

    setGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.title) {
        setValue("projectName", data.title);
        setValue("description", data.description);
        setValue("skills", data.skills);
        toast.success("Brief generated!");
      } else {
        toast.error("Try a different prompt");
      }
    } catch {
      toast.error("AI error");
    } finally {
      setGenerating(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const res = await axios.post("/api/project", values);
      toast.success("Project created!");
      router.push(`/pyme/projects/${res.data.id}`);
      onClose();
    } catch {
      toast.error("Error creating project");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-brand-navy/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-brand-border w-full max-w-md shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border">
          <h2 className="text-sm font-semibold text-brand-navy">Create project</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-raised transition">
            <X className="w-4 h-4 text-ink-secondary" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">

          {/* AI section */}
          <div className="rounded-xl bg-surface-raised border border-brand-border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-mid" />
              <p className="text-xs font-medium text-brand-mid uppercase tracking-widest">Generate with AI</p>
            </div>
            <input
              {...register("prompt")}
              placeholder="e.g. I need a website for my bakery in Santa Ana"
              className="w-full text-sm px-3 py-2.5 rounded-lg border border-brand-border bg-white text-brand-navy placeholder:text-ink-muted focus:outline-none focus:border-brand-mid"
            />
            <button
              type="button"
              onClick={generateWithAI}
              disabled={generating}
              className="flex items-center gap-2 text-sm font-medium text-brand-mid hover:text-brand-title transition disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {generating ? "Generating..." : "Generate brief"}
            </button>
          </div>

          {/* Fields */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-ink-secondary mb-1.5 block">Project name</label>
              <input
                {...register("projectName")}
                placeholder="E-commerce store"
                className="w-full text-sm px-3 py-2.5 rounded-lg border border-brand-border text-brand-navy placeholder:text-ink-muted focus:outline-none focus:border-brand-mid"
              />
              {errors.projectName && <p className="text-xs text-red-400 mt-1">{errors.projectName.message}</p>}
            </div>

            <div>
              <label className="text-xs font-medium text-ink-secondary mb-1.5 block">Description</label>
              <textarea
                {...register("description")}
                placeholder="Describe what you need..."
                rows={3}
                className="w-full text-sm px-3 py-2.5 rounded-lg border border-brand-border text-brand-navy placeholder:text-ink-muted focus:outline-none focus:border-brand-mid resize-none"
              />
              {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description.message}</p>}
            </div>

            <div>
              <label className="text-xs font-medium text-ink-secondary mb-1.5 block">Required skills</label>
              <input
                {...register("skills")}
                placeholder="React, UX Design, Marketing..."
                className="w-full text-sm px-3 py-2.5 rounded-lg border border-brand-border text-brand-navy placeholder:text-ink-muted focus:outline-none focus:border-brand-mid"
              />
              {errors.skills && <p className="text-xs text-red-400 mt-1">{errors.skills.message}</p>}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand-mid text-white text-sm font-medium py-2.5 rounded-xl hover:bg-brand-title transition disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Publish project"}
          </button>
        </form>
      </div>
    </div>
  );
}