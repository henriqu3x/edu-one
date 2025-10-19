// src/providers/LenisProvider.tsx
import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import Lenis from "@studio-freight/lenis";

type LenisContextType = {
  lenis: Lenis | null;
  ready: boolean;
};

const LenisContext = createContext<LenisContextType>({
  lenis: null,
  ready: false,
});

export function useLenisContext() {
  return useContext(LenisContext);
}

interface LenisProviderProps {
  children: ReactNode;
}

export function LenisProvider({ children }: LenisProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef<number | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Evita que o navegador restaure o scroll automaticamente
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    // Cria a instância do Lenis
    const lenis = new Lenis({
      duration: 1.2,                // Duração do scroll
      easing: (t: number) => t,     // Curva de easing (ajuste conforme necessário)
      lerp: 0.1,                    // Suavização
      wheelMultiplier: 1,           // Multiplicador para o scroll com o mouse
      touchMultiplier: 1,           // Multiplicador para o scroll em dispositivos touch
    });

    lenisRef.current = lenis;
    setReady(true);

    // Loop de animação para atualizar o Lenis
    const tick = (time: number) => {
      lenis.raf(time);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    // Exposição do Lenis para testes (opcional)
    // @ts-ignore
    window.__MY_LENIS__ = lenis;

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lenis.destroy();
      lenisRef.current = null;
      setReady(false);

      // Restaura o comportamento padrão de scroll do navegador
      if ("scrollRestoration" in history) {
        try {
          history.scrollRestoration = "auto";
        } catch {}
      }
    };
  }, []);

  return (
    <LenisContext.Provider value={{ lenis: lenisRef.current, ready }}>
      {children}
    </LenisContext.Provider>
  );
}
