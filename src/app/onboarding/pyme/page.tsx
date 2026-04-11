"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().min(2, "Required"),
  contact: z.string().min(2, "Required"),
  description: z.string().min(10, "Required"),
  website: z.string().optional(),
  location: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function PymeOnboardingPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await fetch("/api/onboarding/pyme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error();
      toast.success("Business profile created!");
      router.push("/pyme/dashboard");
    } catch {
      toast.error("Error saving profile");
    }
  };

  return (
    <div className="min-h-screen bg-surface-raised flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-brand-border p-8">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-brand-mid mb-2">Step 2 of 2</p>
          <h1 className="text-xl font-semibold text-brand-navy">Set up your business</h1>
          <p className="text-sm text-ink-secondary mt-1">Tell students about your company</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {[
            { name: "name", label: "Business name", placeholder: "Granja Los Campos" },
            { name: "contact", label: "Contact person", placeholder: "Rodrigo Campos" },
            { name: "description", label: "What does your business do?", placeholder: "We are a poultry farm..." },
            { name: "website", label: "Website (optional)", placeholder: "www.mibusiness.com" },
            { name: "location", label: "Location (optional)", placeholder: "San Juan Opico, La Libertad" },
          ].map((field) => (
            <div key={field.name}>
              <label className="text-xs font-medium text-ink-secondary mb-1.5 block">
                {field.label}
              </label>
              <input
                {...register(field.name as keyof FormValues)}
                placeholder={field.placeholder}
                className="w-full text-sm px-3 py-2.5 rounded-lg border border-brand-border text-brand-navy placeholder:text-ink-muted focus:outline-none focus:border-brand-mid"
              />
              {errors[field.name as keyof FormValues] && (
                <p className="text-xs text-red-400 mt-1">
                  {errors[field.name as keyof FormValues]?.message}
                </p>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-brand-mid text-white text-sm font-medium py-3 rounded-xl hover:bg-brand-title transition disabled:opacity-60 mt-2"
          >
            {isSubmitting ? "Saving..." : "Go to dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}