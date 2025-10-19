import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLenisContext } from "@/providers/LenisProvider";

export function ScrollToTop() {
  const { lenis } = useLenisContext();
  const location = useLocation();

  useEffect(() => {
    if (lenis) {
      // Faz o scroll animar até o topo
      lenis.scrollTo(0, { immediate: false });
    } else {
      // Fallback (caso lenis ainda não esteja pronto)
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location.pathname, lenis]);

  return null;
}
