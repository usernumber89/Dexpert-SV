"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  GraduationCap,
  Code,
  ArrowRight,
  Sparkles,
  BookOpen,
  MapPin,
  Globe,
  Camera,
  Loader2,
} from "lucide-react";
import { LightbulbIcon } from "@phosphor-icons/react";
import Image from "next/image";

export default function StudentOnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    university: "",
    skills: "",
    linkedin: "",
    location: "",
    major: "",
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

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading photo:", error);
      return null;
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!photoFile) {
      toast.error("La foto de perfil es obligatoria. Seleccioná una imagen para continuar.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/sign-in"); return; }

    const skillsArray = form.skills.split(",").map(s => s.trim()).filter(Boolean);
    const avatarUrl = await uploadPhoto(user.id);

    const { error } = await supabase.from("students").upsert({
      user_id: user.id,
      full_name: form.full_name,
      email: form.email,
      university: form.university,
      major: form.major,
      skills: skillsArray,
      linkedin: form.linkedin,
      location: form.location,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
    );

    if (error) {
      toast.error("Error guardando el perfil");
      console.error(error);
      setLoading(false);
      return;
    }

    toast.success("¡Perfil completado! Bienvenido a bordo.");
    router.push("/student/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F7FF] via-white to-[#E8F3FD] flex items-center justify-center p-6 relative">
      <div className="absolute top-20 right-20 w-64 h-64 bg-[#38A3F1] rounded-full opacity-5 blur-3xl" />
      <div className="absolute bottom-20 left-20 w-64 h-64 bg-[#1D9E75] rounded-full opacity-5 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-[#BAD8F7] shadow-2xl p-8">

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-[#38A3F1] to-[#1D9E75] rounded-lg flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs font-medium uppercase tracking-widest text-[#38A3F1]">
                Paso 2 de 2: Perfil del estudiante
              </p>
            </div>
            <h1 className="text-2xl font-bold text-[#0D3A6E] mb-2">
              Completá tu perfil para empezar
            </h1>
            <p className="text-sm text-[#5B8DB8]">
              Esto ayuda a las empresas a encontrar la coincidencia perfecta para sus proyectos
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Photo Upload */}
            <div className="flex flex-col items-center gap-3 pb-4 border-b border-[#E8F3FD]">
              <div className="relative w-24 h-24">
                {photoPreview ? (
                  <Image
                    src={photoPreview}
                    alt="Profile preview"
                    fill
                    className="rounded-full object-cover border-4 border-white shadow-xl"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-[#F0F7FF] border-4 border-white shadow-xl flex items-center justify-center">
                    <User className="w-10 h-10 text-[#93B8D4]" />
                  </div>
                )}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => photoInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-lg border-2 border-[#BAD8F7] hover:border-[#38A3F1] transition-all"
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
              <p className="text-xs text-[#5B8DB8]">
                {photoPreview ? "Tocá la cámara para cambiar la foto" : "Agregá una foto de perfil <span className='text-red-400'>*</span>"}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">
                  Nombre completo <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#93B8D4]" />
                  <input
                    value={form.full_name}
                    onChange={e => setForm(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Rodrigo Campos"
                    required
                    className="w-full text-sm pl-10 pr-3 py-2.5 rounded-xl border border-[#BAD8F7] bg-white/50 text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">
                  Email <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#93B8D4]" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="rodrigo@email.com"
                    required
                    className="w-full text-sm pl-10 pr-3 py-2.5 rounded-xl border border-[#BAD8F7] bg-white/50 text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">
                  Universidad/Institución
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#93B8D4]" />
                  <input
                    value={form.university}
                    onChange={e => setForm(prev => ({ ...prev, university: e.target.value }))}
                    placeholder="Universidad Dr. José Matías Delgado"
                    className="w-full text-sm pl-10 pr-3 py-2.5 rounded-xl border border-[#BAD8F7] bg-white/50 text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">
                  Carrera/Area de Estudio
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#93B8D4]" />
                  <input
                    value={form.major}
                    onChange={e => setForm(prev => ({ ...prev, major: e.target.value }))}
                    placeholder="Ciencias de la computación"
                    className="w-full text-sm pl-10 pr-3 py-2.5 rounded-xl border border-[#BAD8F7] bg-white/50 text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">
                  Ubicación
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#93B8D4]" />
                  <input
                    value={form.location}
                    onChange={e => setForm(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="San Salvador"
                    className="w-full text-sm pl-10 pr-3 py-2.5 rounded-xl border border-[#BAD8F7] bg-white/50 text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">
                  Perfil de LinkedIn
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#93B8D4]" />
                  <input
                    value={form.linkedin}
                    onChange={e => setForm(prev => ({ ...prev, linkedin: e.target.value }))}
                    placeholder="linkedin.com/in/username"
                    className="w-full text-sm pl-10 pr-3 py-2.5 rounded-xl border border-[#BAD8F7] bg-white/50 text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">
                Habilidades principales <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Code className="absolute left-3 top-3 w-4 h-4 text-[#93B8D4]" />
                <textarea
                  value={form.skills}
                  onChange={e => setForm(prev => ({ ...prev, skills: e.target.value }))}
                  placeholder="React, Python, Marketing, Diseño... (separado por comas)"
                  rows={2}
                  className="w-full text-sm pl-10 pr-3 py-2.5 rounded-xl border border-[#BAD8F7] bg-white/50 text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all resize-none"
                />
              </div>
              <p className="text-[10px] text-[#93B8D4] mt-1">
                Agregá tus habilidades principales para ser emparejado con proyectos relevantes
              </p>
            </div>

            <div className="bg-gradient-to-r from-[#F0F7FF] to-[#E8F3FD] rounded-xl p-4 border border-[#BAD8F7]">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#38A3F1] rounded-lg flex items-center justify-center flex-shrink-0">
                  <LightbulbIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#0D3A6E] mb-1">
                    Perfil completo = Mejores resultados
                  </p>
                  <p className="text-[10px] text-[#5B8DB8]">
                    Los estudiantes con perfiles completos reciben 3 veces más invitaciones a proyectos.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || uploadingPhoto}
              className="relative w-full bg-gradient-to-r from-[#38A3F1] to-[#1D9E75] text-white text-sm font-semibold py-3 rounded-xl hover:shadow-lg hover:shadow-[#38A3F1]/25 transition-all disabled:opacity-50 overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creando perfil...
                  </>
                ) : (
                  <>
                    Perfil completo
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
