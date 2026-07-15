"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Camera,
  Loader2,
  Code,
  Sparkles,
} from "lucide-react";
import Image from "next/image";

const STEPS_COUNT = 5;

const stepContent = [
  {
    title: "Empezá con una foto tuya",
    justification:
      "Las empresas confían más cuando ven quién está detrás del perfil. ¡Ponele cara a tu talento!",
  },
  {
    title: "¿Cómo te llamás?",
    justification:
      "Tu nombre real genera confianza con las empresas que van a ver tu perfil.",
    placeholder: "Alex González",
    field: "full_name" as const,
    required: true,
  },
  {
    title: "¿Dónde estudiás?",
    justification:
      "Las PYMEs buscan talento de su misma región. Tu institución nos ayuda a encontrar las mejores oportunidades cerca de vos.",
    placeholder: "Universidad de El Salvador",
    field: "university" as const,
    required: false,
  },
  {
    title: "¿Qué carrera estás cursando?",
    justification:
      "Filtramos los proyectos que se alinean con tu área de estudio. Nada de propuestas irrelevantes.",
    placeholder: "Ingeniería en Sistemas Informáticos",
    field: "major" as const,
    required: false,
  },
  {
    title: "¿Cuáles son tus habilidades principales?",
    justification:
      "Esto es clave: las PYMEs buscan talento con tus skills específicas para sus proyectos.",
    placeholder: "React, Python, Diseño UX, Marketing Digital",
    field: "skills" as const,
    required: true,
  },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir * 60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir * -60, opacity: 0 }),
};

export default function StudentOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    full_name: "",
    university: "",
    major: "",
    skills: "",
  });

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, seleccioná un archivo de imagen.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen excede el límite de 5MB.");
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadPhoto = async (userId: string): Promise<string | null> => {
    if (!photoFile) return null;

    setUploadingPhoto(true);
    try {
      const supabase = createClient();
      const ext = photoFile.name.split(".").pop();
      const fileName = `${userId}-${Date.now()}.${ext}`;
      const filePath = `profiles/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, photoFile, { upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading photo:", error);
      return null;
    } finally {
      setUploadingPhoto(false);
    }
  };

  const goNext = () => {
    const current = stepContent[step - 1];
    if (current.required && current.field) {
      const val = form[current.field];
      if (!val || (typeof val === "string" && !val.trim())) {
        toast.error("Este campo es obligatorio");
        return;
      }
    }
    setDirection(1);
    if (step < STEPS_COUNT) {
      setStep((s) => s + 1);
    }
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSubmit = async () => {
    if (!form.skills.trim()) {
      toast.error("Agregá al menos una habilidad para continuar");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/sign-in");
      return;
    }

    const skillsArray = form.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const avatarUrl = await uploadPhoto(user.id);

    const { error } = await supabase
      .from("students")
      .upsert(
        {
          user_id: user.id,
          email: user.email,
          full_name: form.full_name,
          university: form.university || null,
          major: form.major || null,
          skills: skillsArray,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (error) {
      toast.error(`Error guardando el perfil: ${error.message || "Error de permisos (RLS)"}`);
      console.error("Supabase error:", JSON.stringify(error, null, 2));
      setLoading(false);
      return;
    }

    toast.success("¡Perfil completado! Bienvenido a bordo.");
    router.push("/student/dashboard");
  };

  const canGoNext = () => {
    const current = stepContent[step - 1];
    if (!current.required || !current.field) return true;
    const val = form[current.field];
    return val && (typeof val !== "string" || val.trim());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F7FF] via-white to-[#E8F3FD] flex items-center justify-center p-6 relative">
      <div className="absolute top-20 right-20 w-64 h-64 bg-[#38A3F1] rounded-full opacity-5 blur-3xl" />
      <div className="absolute bottom-20 left-20 w-64 h-64 bg-[#1D9E75] rounded-full opacity-5 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-[#BAD8F7] shadow-2xl p-8">
          {/* Progress bar + step indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#38A3F1] to-[#1D9E75] rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                <p className="text-xs font-medium uppercase tracking-widest text-[#38A3F1]">
                  Paso {step} de {STEPS_COUNT}
                </p>
              </div>
              <span className="text-[10px] text-[#93B8D4] font-medium">
                {Math.round((step / STEPS_COUNT) * 100)}%
              </span>
            </div>

            <div className="flex gap-1.5">
              {Array.from({ length: STEPS_COUNT }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                    i + 1 <= step
                      ? "bg-gradient-to-r from-[#38A3F1] to-[#1D9E75]"
                      : "bg-[#E8F3FD]"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Step content */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-[#0D3A6E] mb-2">
                      {stepContent[0].title}
                    </h2>
                    <p className="text-sm text-[#5B8DB8] leading-relaxed">
                      {stepContent[0].justification}
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-4 py-4">
                    <div className="relative w-28 h-28">
                      {photoPreview ? (
                        <Image
                          src={photoPreview}
                          alt="Profile preview"
                          fill
                          className="rounded-full object-cover border-4 border-white shadow-xl"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-[#F0F7FF] border-4 border-white shadow-xl flex items-center justify-center">
                          <User className="w-12 h-12 text-[#93B8D4]" />
                        </div>
                      )}
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => photoInputRef.current?.click()}
                        disabled={uploadingPhoto}
                        className="absolute -bottom-2 -right-2 bg-white p-2.5 rounded-full shadow-lg border-2 border-[#BAD8F7] hover:border-[#38A3F1] transition-all"
                      >
                        {uploadingPhoto ? (
                          <Loader2 className="w-4 h-4 text-[#38A3F1] animate-spin" />
                        ) : (
                          <Camera className="w-4 h-4 text-[#38A3F1]" />
                        )}
                      </motion.button>
                    </div>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoSelect}
                    />
                    <p className="text-xs text-[#5B8DB8] text-center">
                      {photoPreview
                        ? "Tocá la cámara para cambiar la foto"
                        : "Subí una foto tuya — o skipeá este paso y la agregás después"}
                    </p>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-[#0D3A6E] mb-2">
                      {stepContent[1].title}
                    </h2>
                    <p className="text-sm text-[#5B8DB8] leading-relaxed">
                      {stepContent[1].justification}
                    </p>
                  </div>

                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#93B8D4]" />
                    <input
                      value={form.full_name}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          full_name: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => e.key === "Enter" && goNext()}
                      placeholder={stepContent[1].placeholder}
                      autoFocus
                      className="w-full text-sm pl-12 pr-4 py-3.5 rounded-xl border border-[#BAD8F7] bg-white/50 text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-[#93B8D4]">
                    Ej. &ldquo;{stepContent[1].placeholder}&rdquo;
                  </p>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-[#0D3A6E] mb-2">
                      {stepContent[2].title}
                    </h2>
                    <p className="text-sm text-[#5B8DB8] leading-relaxed">
                      {stepContent[2].justification}
                    </p>
                  </div>

                  <div className="relative">
                    <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#93B8D4]" />
                    <input
                      value={form.university}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          university: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => e.key === "Enter" && goNext()}
                      placeholder={stepContent[2].placeholder}
                      autoFocus
                      className="w-full text-sm pl-12 pr-4 py-3.5 rounded-xl border border-[#BAD8F7] bg-white/50 text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-[#93B8D4]">
                    Ej. &ldquo;{stepContent[2].placeholder}&rdquo;
                  </p>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-[#0D3A6E] mb-2">
                      {stepContent[3].title}
                    </h2>
                    <p className="text-sm text-[#5B8DB8] leading-relaxed">
                      {stepContent[3].justification}
                    </p>
                  </div>

                  <div className="relative">
                    <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#93B8D4]" />
                    <input
                      value={form.major}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          major: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => e.key === "Enter" && goNext()}
                      placeholder={stepContent[3].placeholder}
                      autoFocus
                      className="w-full text-sm pl-12 pr-4 py-3.5 rounded-xl border border-[#BAD8F7] bg-white/50 text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-[#93B8D4]">
                    Ej. &ldquo;{stepContent[3].placeholder}&rdquo;
                  </p>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-[#0D3A6E] mb-2">
                      {stepContent[4].title}
                    </h2>
                    <p className="text-sm text-[#5B8DB8] leading-relaxed">
                      {stepContent[4].justification}
                    </p>
                  </div>

                  <div className="relative">
                    <Code className="absolute left-4 top-4 w-5 h-5 text-[#93B8D4]" />
                    <textarea
                      value={form.skills}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          skills: e.target.value,
                        }))
                      }
                      placeholder={stepContent[4].placeholder}
                      autoFocus
                      rows={3}
                      className="w-full text-sm pl-12 pr-4 py-3.5 rounded-xl border border-[#BAD8F7] bg-white/50 text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all resize-none"
                    />
                  </div>
                  <p className="text-[11px] text-[#93B8D4]">
                    Separalas por comas. Ej. &ldquo;
                    {stepContent[4].placeholder}&rdquo;
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#E8F3FD]">
            {step > 1 ? (
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={goBack}
                className="flex items-center gap-2 text-sm font-medium text-[#5B8DB8] hover:text-[#0D3A6E] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Atrás
              </motion.button>
            ) : (
              <div />
            )}

            {step < STEPS_COUNT ? (
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={goNext}
                disabled={!canGoNext()}
                className="flex items-center gap-2 bg-gradient-to-r from-[#38A3F1] to-[#1D9E75] text-white text-sm font-semibold py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-[#38A3F1]/25 transition-all disabled:opacity-50"
              >
                Continuar
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={loading || !form.skills.trim()}
                className="flex items-center gap-2 bg-gradient-to-r from-[#38A3F1] to-[#1D9E75] text-white text-sm font-semibold py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-[#38A3F1]/25 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creando perfil...
                  </>
                ) : (
                  <>
                    ¡Listo!
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
