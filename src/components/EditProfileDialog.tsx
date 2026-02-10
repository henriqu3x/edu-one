import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
}

interface EditProfileDialogProps {
  profile: Profile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileUpdated: () => void;
}

export function EditProfileDialog({ profile, open, onOpenChange, onProfileUpdated }: EditProfileDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [originalEmail, setOriginalEmail] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    bio: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (open && profile) {
      setFormData({
        username: profile.username || "",
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [open, profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!profile) return;

    // Validate password confirmation
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      // 1. Update Public Profiles Table FIRST
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          username: formData.username,
          full_name: formData.full_name,
          bio: formData.bio,
        })
        .eq("id", user.id);

      if (profileError) {
        throw profileError;
      }

      // 2. Update Auth metadata and password
      const hasPasswordChange = formData.password && formData.password.trim() !== "";

      const metadataUpdate: any = {
        data: {
          full_name: formData.full_name,
          username: formData.username,
        },
      };

      if (hasPasswordChange) {
        metadataUpdate.password = formData.password;
      }

      const { error: metadataError } = await supabase.auth.updateUser(metadataUpdate);

      if (metadataError) {
        throw metadataError;
      }

      // Refresh session
      if (hasPasswordChange) {
        await supabase.auth.refreshSession();
      }

      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });

      onProfileUpdated();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error);
      toast({
        title: "Erro ao atualizar",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription>
            Faça alterações em seu perfil aqui. Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Informações do Perfil</h3>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="full_name" className="text-right">
                Nome
              </Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bio" className="text-right">
                Bio
              </Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Segurança da Conta</h3>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Nova Senha
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Deixe em branco para manter"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="confirmPassword" className="text-right">
                Confirmar
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirme a nova senha"
                className="col-span-3"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave} disabled={loading}>
            {loading ? "Salvando..." : "Salvar alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
