"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Scale,
  Ruler,
  Target,
  ChefHat,
  Save,
  Camera,
  Upload,
  Loader,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Image from "next/image";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  physicalData: {
    height?: number;
    startWeight?: number;
    targetWeight?: number;
    currentWeight?: number;
    dietType?: string;
    cookingLevel?: string;
  };
}

const dietTypes = [
  { value: "tradicional", label: "Tradicional" },
  { value: "vegetariana", label: "Vegetariana" },
  { value: "vegana", label: "Vegana" },
  { value: "low_carb", label: "Low Carb" },
  { value: "cetogenica", label: "Cetogênica" },
  { value: "mediterranea", label: "Mediterrânea" },
  { value: "sem_gluten", label: "Sem Glúten" },
  { value: "sem_lactose", label: "Sem Lactose" },
];

const cookingLevels = [
  { value: "iniciante", label: "Iniciante" },
  { value: "intermediario", label: "Intermediário" },
  { value: "avancado", label: "Avançado" },
  { value: "chef", label: "Chef" },
];

export default function EditProfileModal({
  isOpen,
  onClose,
  physicalData,
}: EditProfileModalProps) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    height: physicalData?.height || "",
    currentWeight: physicalData?.currentWeight || "",
    targetWeight: physicalData?.targetWeight || "",
    startWeight: physicalData?.startWeight || "",
    dietType: physicalData?.dietType || "",
    cookingLevel: physicalData?.cookingLevel || "",
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  // Mutation para atualizar dados físicos
  const updatePhysicalData = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/user/physical-data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erro ao atualizar perfil");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["physical-data"] });
      toast.success("Perfil atualizado com sucesso!");
      onClose();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Upload de imagem para o Clerk
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem válida");
      return;
    }

    // Validar tamanho (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    setUploadingImage(true);

    try {
      // Fazer upload para o Clerk
      await user.setProfileImage({ file });
      toast.success("Foto atualizada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["user"] });
    } catch (error) {
      console.error("Erro no upload:", error);
      toast.error("Erro ao atualizar foto");
    } finally {
      setUploadingImage(false);
      // Limpar o input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Converter strings para números
    const dataToSend = {
      height: formData.height
        ? parseFloat(formData.height as string)
        : undefined,
      currentWeight: formData.currentWeight
        ? parseFloat(formData.currentWeight as string)
        : undefined,
      targetWeight: formData.targetWeight
        ? parseFloat(formData.targetWeight as string)
        : undefined,
      startWeight: formData.startWeight
        ? parseFloat(formData.startWeight as string)
        : undefined,
      dietType: formData.dietType || undefined,
      cookingLevel: formData.cookingLevel || undefined,
    };

    updatePhysicalData.mutate(dataToSend);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-slate-800">
                Editar Perfil
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Seção de Foto */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <Camera size={16} className="text-[#007BFF]" />
                  Foto do Perfil
                </h3>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {user?.imageUrl ? (
                      <Image
                        src={user.imageUrl}
                        alt="Profile"
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-full object-cover border-4 border-slate-100"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gradient-to-br from-[#007BFF] to-[#28A745] rounded-full flex items-center justify-center text-3xl text-white">
                        {user?.firstName?.charAt(0) || "👤"}
                      </div>
                    )}
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <Loader size={24} className="text-white animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="profile-image-upload"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="w-full py-2 px-4 border-2 border-dashed border-[#007BFF]/30 rounded-xl text-sm font-medium text-[#007BFF] hover:bg-[#007BFF]/5 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Upload size={16} />
                      {uploadingImage ? "Enviando..." : "Trocar foto"}
                    </button>
                    <p className="text-xs text-slate-400 mt-2">
                      Formatos: JPG, PNG, GIF • Máx 5MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Dados Físicos */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <Scale size={16} className="text-[#007BFF]" />
                  Dados Físicos
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      Altura (m)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="height"
                      value={formData.height}
                      onChange={handleChange}
                      placeholder="1.75"
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007BFF]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      Peso Atual (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="currentWeight"
                      value={formData.currentWeight}
                      onChange={handleChange}
                      placeholder="75.5"
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007BFF]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      Peso Inicial (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="startWeight"
                      value={formData.startWeight}
                      onChange={handleChange}
                      placeholder="82.0"
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007BFF]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      Peso Meta (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="targetWeight"
                      value={formData.targetWeight}
                      onChange={handleChange}
                      placeholder="70.0"
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007BFF]"
                    />
                  </div>
                </div>
              </div>

              {/* Preferências Alimentares */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <ChefHat size={16} className="text-[#28A745]" />
                  Preferências
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      Tipo de Dieta
                    </label>
                    <select
                      name="dietType"
                      value={formData.dietType}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007BFF]"
                    >
                      <option value="">Selecione</option>
                      {dietTypes.map((diet) => (
                        <option key={diet.value} value={diet.value}>
                          {diet.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      Nível na Cozinha
                    </label>
                    <select
                      name="cookingLevel"
                      value={formData.cookingLevel}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007BFF]"
                    >
                      <option value="">Selecione</option>
                      {cookingLevels.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={updatePhysicalData.isPending}
                  className="flex-1 py-3 bg-gradient-to-r from-[#007BFF] to-[#28A745] text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {updatePhysicalData.isPending ? (
                    "Salvando..."
                  ) : (
                    <>
                      <Save size={16} />
                      Salvar
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
