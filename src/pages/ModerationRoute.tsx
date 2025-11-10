import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type ModerationRouteProps = {
  children: React.ReactNode;
};

export function ModerationRoute({ children }: ModerationRouteProps) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();
  const didRedirectRef = useRef(false);

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
          const isModerator = roles?.some(
            (r:any) => r.role === "moderator" || r.role === "admin"
          );
          setAllowed(Boolean(isModerator));
        }
      } catch (err) {
        console.error("Erro na verificação:", err);
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

  useEffect(() => {
    if (!loading && !allowed && !didRedirectRef.current) {
      didRedirectRef.current = true;

      toast({
        title: "Acesso Negado",
        description: "Você não tem permissão para acessar esta página.",
        variant: "destructive",
      });

      navigate("/", { replace: true });
    }
  }, [loading, allowed, navigate, toast]);

  if (loading) return null;
  if (!allowed) return null;

  return <>{children}</>;
}
