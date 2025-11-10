import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type AdminRouteProps = {
  children: React.ReactNode;
};

export function AdminRoute({ children }: AdminRouteProps) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();
  const didRedirectRef = useRef(false); // evita múltiplos toasts/navigate

  useEffect(() => {
    let mounted = true;

    async function verify() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!mounted) return;

        if (!user) {
          setAllowed(false);
          setLoading(false);
          return;
        }

        const { data: roles, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        if (!mounted) return;

        if (error) {
          console.error("Erro ao buscar roles:", error);
          setAllowed(false);
        } else {
          const isAdmin = roles?.some((r: any) => r.role === "admin");
          setAllowed(Boolean(isAdmin));
        }
      } catch (err) {
        console.error("Erro na verificação de admin:", err);
        setAllowed(false);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    verify();

    return () => {
      mounted = false;
    };
  }, []);

  // Side effect: quando loading terminar e não for permitido -> toast + navigate
  useEffect(() => {
    if (!loading && !allowed && !didRedirectRef.current) {
      didRedirectRef.current = true;

      // dispara o toast
      toast({
        title: "Acesso Negado",
        description: "Você não tem permissão para acessar esta página.",
        variant: "destructive",
      });

      // navega para home (substitui histórico)
      navigate("/", { replace: true });
    }
  }, [loading, allowed, navigate, toast]);

  // Enquanto estiver verificando, retorne null ou um loader leve — NÃO execute side effects aqui.
  if (loading) {
    // você pode retornar um spinner leve em vez de null para não ficar "tela preta"
    return null;
  }

  // se não permitido, já fez toast+navigate via efeito; retorna null (sem render)
  if (!allowed) {
    return null;
  }

  // autorizado → renderiza children normalmente
  return <>{children}</>;
}
