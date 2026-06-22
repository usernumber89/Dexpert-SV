"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { toast } from "sonner";
import { UploadCloud, Loader2, Image as ImageIcon, Camera, User } from "lucide-react";
import { motion } from "framer-motion";

type GalleryImage = {
  id: string;
  owner_id: string;
  image_url: string;
  created_at: string;
};

type Props = {
  ownerId: string;
  type: "student" | "pyme";
  isOwner: boolean;
  mode?: "gallery" | "full";
  currentPhotoUrl?: string | null;
  userName?: string;
  onPhotoUpdate?: (url: string) => void;
};

export function ProfileGallery({
  ownerId,
  type,
  isOwner,
  mode = "gallery",
  currentPhotoUrl,
  userName,
  onPhotoUpdate,
}: Props) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const tableName = type === "student" ? "student_portfolios" : "pyme_galleries";

  useEffect(() => {
    if (!ownerId) return;
    fetchImages();

    const channel = supabase
      .channel(`realtime-gallery-${ownerId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: tableName,
          filter: `owner_id=eq.${ownerId}`,
        },
        (payload: { new: GalleryImage }) => {
          const newImg = payload.new as GalleryImage;
          setImages((current) => [newImg, ...current]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ownerId, tableName]);

  const fetchImages = async () => {
    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setImages(data);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, sube únicamente archivos de imagen.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen excede el límite permitido de 5MB.");
      return;
    }

    setUploading(true);
    const toastId = toast.loading("Subiendo imagen...");

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${type}/${ownerId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("portfolios")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("portfolios")
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from(tableName)
        .insert({ owner_id: ownerId, image_url: publicUrl });

      if (dbError) throw dbError;
      toast.success("¡Imagen publicada exitosamente!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Hubo un error al procesar la subida.", { id: toastId });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleProfilePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, sube únicamente archivos de imagen.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen excede el límite permitido de 5MB.");
      return;
    }

    setUploadingPhoto(true);
    const toastId = toast.loading("Subiendo foto de perfil...");

    try {
      const ext = file.name.split(".").pop();
      const fileName = `${ownerId}-${Date.now()}.${ext}`;
      const bucket = "avatars";
      const filePath = `profiles/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      const table = type === "student" ? "students" : "pymes";
      const column = type === "student" ? "avatar_url" : "logo_url";

      const { error: dbError } = await supabase
        .from(table)
        .update({ [column]: publicUrl })
        .eq("id", ownerId);

      if (dbError) throw dbError;

      toast.success("¡Foto de perfil actualizada!", { id: toastId });
      onPhotoUpdate?.(publicUrl);
    } catch (error) {
      console.error(error);
      toast.error("Error al subir la foto de perfil.", { id: toastId });
    } finally {
      setUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  };

  const showFullMode = mode === "full";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Profile Photo Section (only in full mode) */}
      {showFullMode && (
        <div className="flex flex-col items-center gap-4 pb-6 border-b border-[#E8F3FD]">
          <div className="relative w-28 h-28">
            {currentPhotoUrl ? (
              <Image
                src={currentPhotoUrl}
                alt={userName || "Profile photo"}
                fill
                className="rounded-full object-cover border-4 border-white shadow-xl"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-[#F0F7FF] border-4 border-white shadow-xl flex items-center justify-center">
                <span className="text-3xl font-bold text-[#93B8D4]">
                  {userName?.charAt(0)?.toUpperCase() || <User className="w-10 h-10 text-[#93B8D4]" />}
                </span>
              </div>
            )}
            {isOwner && (
              <motion.button
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
            )}
          </div>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleProfilePhotoUpload}
            disabled={uploadingPhoto}
          />
          {isOwner && !currentPhotoUrl && (
            <p className="text-xs text-[#93B8D4]">Agregá una foto de perfil para destacar</p>
          )}
        </div>
      )}

      {/* Upload Button (only for owner) */}
      {isOwner && (
        <div className="bg-white p-5 border border-[#BAD8F7] rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <h3 className="font-bold text-[#0D3A6E]">
              {type === "student" ? "Portafolio de Proyectos" : "Cultura y Equipo de la Empresa"}
            </h3>
            <p className="text-sm text-[#5B8DB8]">
              {type === "student"
                ? "Mostrá capturas de tus mejores trabajos y certificados."
                : "Subí fotos de tus oficinas, equipo o eventos corporativos."}
            </p>
          </div>

          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleUpload}
            disabled={uploading}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-[#1D5A9E] hover:bg-[#0D3A6E] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition text-sm font-bold shadow-sm disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            {uploading ? "Subiendo..." : "Añadir Foto"}
          </button>
        </div>
      )}

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((img) => (
          <div
            key={img.id}
            className="relative aspect-video bg-[#F0F7FF] rounded-xl overflow-hidden group shadow-sm border border-[#E8F3FD] animate-in fade-in zoom-in duration-300"
          >
            <Image
              src={img.image_url}
              alt="Imagen de portafolio"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        ))}

        {images.length === 0 && !uploading && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-[#93B8D4] border-2 border-dashed border-[#BAD8F7] rounded-2xl bg-white/50">
            <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
            <p className="text-sm font-medium">Aún no hay fotos en esta galería.</p>
          </div>
        )}
      </div>
    </div>
  );
}
