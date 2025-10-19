// src/components/PageTransition.tsx
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}    // página entra levemente abaixo e transparente
      animate={{ opacity: 1, y: 0 }}     // estado final: opacidade total e posição normal
      exit={{ opacity: 0, y: -20 }}      // página sai levemente para cima e some
      transition={{
        duration: 0.6,                   // tempo da animação
        ease: [0.25, 0.1, 0.25, 1],      // curva de easing suave
      }}
      className="min-h-screen w-full"
    >
      {children}
    </motion.div>
  );
}
