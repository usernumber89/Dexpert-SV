"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Building2,
  User,
  FileText,
  Globe,
  MapPin,
  ArrowRight,
  Sparkles,
  Briefcase,
  Phone,
  Camera,
  Loader2,
} from "lucide-react";
import { LightbulbIcon } from "@phosphor-icons/react";
import Image from "next/image";

export default function PymeOnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: "",
    contact: "",
    description: "",
    website: "",
    location: "",
    phone: "",
    industry: "",
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

  const uploadLogo = async (userId: string): Promise<string | null> => {
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
      console.error("Error uploading logo:", error);
      return null;
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!photoFile) {
      toast.error("El logo de la empresa es obligatorio. Seleccioná una imagen para continuar.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/sign-in"); return; }

    const logoUrl = await uploadLogo(user.id);

    const { error } = await supabase.from("pymes").upsert({
      id: user.id,
      user_id: user.id,
      company_name: form.name,
      contact_person: form.contact,
      description: form.description,
      website: form.website,
      location: form.location,
      phone: form.phone,
      industry: form.industry,
      logo_url: logoUrl,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      toast.error("Error guardando tu perfil");
      console.error(error);
      setLoading(false);
      return;
    }

    toast.success("¡Perfil de negocio creado exitosamente!");
    router.push("/pyme/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F7FF] via-white to-[#E8F3FD] flex items-center justify-center p-6 relative">
      <div className="absolute top-20 left-20 w-64 h-64 bg-[#0D3A6E] rounded-full opacity-5 blur-3xl" />
      <div className="absolute bottom-20 right-20 w-64 h-64 bg-[#F59E0B] rounded-full opacity-5 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-[#BAD8F7] shadow-2xl p-8">

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-[#0D3A6E] to-[#1D5A9E] rounded-lg flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs font-medium uppercase tracking-widest text-[#0D5FA6]">
                Paso 2 de 2 • PYME
              </p>
            </div>
            <h1 className="text-2xl font-bold text-[#0D3A6E] mb-2">
              Configurá tu perfil de empresa
            </h1>
            <p className="text-sm text-[#5B8DB8]">
              Hablales a los estudiantes sobre tu empresa y empezá a publicar proyectos.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Logo Upload */}
            <div className="flex flex-col items-center gap-3 pb-4 border-b border-[#E8F3FD]">
              <div className="relative w-24 h-24">
                {photoPreview ? (
                  <Image
                    src={photoPreview}
                    alt="Company logo preview"
                    fill
                    className="rounded-2xl object-cover border-4 border-white shadow-xl"
                  />
                ) : (
                  <div className="w-full h-full rounded-2xl bg-[#F0F7FF] border-4 border-white shadow-xl flex items-center justify-center">
                    <Building2 className="w-10 h-10 text-[#93B8D4]" />
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
                {photoPreview ? "Tocá la cámara para cambiar el logo" : "Agregá el logo de tu empresa <span className='text-red-400'>*</span>"}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">
                  Nombre del Negocio <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#93B8D4]" />
                  <input
                    value={form.name}
                    onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Granja Los Campos"
                    required
                    className="w-full text-sm pl-10 pr-3 py-2.5 rounded-xl border border-[#BAD8F7] bg-white/50 text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">
                  Persona de contacto <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#93B8D4]" />
                  <input
                    value={form.contact}
                    onChange={e => setForm(prev => ({ ...prev, contact: e.target.value }))}
                    placeholder="Rodrigo Campos"
                    required
                    className="w-full text-sm pl-10 pr-3 py-2.5 rounded-xl border border-[#BAD8F7] bg-white/50 text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">
                  Industria / Giro
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#93B8D4]" />
                  <input
                    value={form.industry}
                    onChange={e => setForm(prev => ({ ...prev, industry: e.target.value }))}
                    placeholder="Agricultura, Tecnología, Minorista..."
                    className="w-full text-sm pl-10 pr-3 py-2.5 rounded-xl border border-[#BAD8F7] bg-white/50 text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">
                  Teléfono
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#93B8D4]" />
                  <input
                    value={form.phone}
                    onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+503 1234 5678"
                    className="w-full text-sm pl-10 pr-3 py-2.5 rounded-xl border border-[#BAD8F7] bg-white/50 text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">
                  Página web
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#93B8D4]" />
                  <input
                    value={form.website}
                    onChange={e => setForm(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="www.minegociosv.com"
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
                    placeholder="San Juan Opico, La Libertad"
                    className="w-full text-sm pl-10 pr-3 py-2.5 rounded-xl border border-[#BAD8F7] bg-white/50 text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">
                ¿A qué se dedica su empresa? <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-[#93B8D4]" />
                <textarea
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Somos una granja avícola especializada en..."
                  required
                  rows={3}
                  className="w-full text-sm pl-10 pr-3 py-2.5 rounded-xl border border-[#BAD8F7] bg-white/50 text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all resize-none"
                />
              </div>
              <p className="text-[10px] text-[#93B8D4] mt-1">
                Una descripción clara ayuda a los estudiantes a comprender las necesidades de su negocio.
              </p>
            </div>

            <div className="bg-gradient-to-r from-[#F0F7FF] to-[#E8F3FD] rounded-xl p-4 border border-[#BAD8F7]">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#F59E0B] rounded-lg flex items-center justify-center flex-shrink-0">
                  <LightbulbIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#0D3A6E] mb-1">
                    Los perfiles completos obtienen mejores talentos.
                  </p>
                  <p className="text-[10px] text-[#5B8DB8]">
                    Las empresas con perfiles completos reciben el doble de solicitudes de calidad.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || uploadingPhoto}
              className="relative w-full bg-gradient-to-r from-[#0D3A6E] to-[#1D5A9E] text-white text-sm font-semibold py-3 rounded-xl hover:shadow-lg hover:shadow-[#0D3A6E]/25 transition-all disabled:opacity-50 overflow-hidden group"
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
