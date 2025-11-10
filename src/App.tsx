// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useRef } from "react";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import CourseNew from "./pages/CourseNew";
import CourseEdit from "./pages/CourseEdit";
import CourseDetail from "./pages/CourseDetail";
import Profile from "./pages/Profile";
import Trails from "./pages/Trails";
import TrailDetail from "./pages/TrailDetail";
import TrailNew from "./pages/TrailNew";
import Search from "./pages/Search";
import Explore from "./pages/Explore";
import Category from "./pages/Category";
import Forum from "./pages/Forum";
import ForumTopic from "./pages/ForumTopic";
import Moderation from "./pages/Moderation";
import Admin from "./pages/Admin";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import { AdminRoute } from "./pages/AdminRoute";

import { LenisProvider, useLenisContext } from "@/providers/LenisProvider";
import PageTransition from "@/components/PageTransition";
import { ModerationRoute } from "./pages/ModerationRoute";

const queryClient = new QueryClient();

function AppRoutes() {
  const location = useLocation();
  const { lenis } = useLenisContext();
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;

  return (
    <AnimatePresence
      mode="wait"
      initial={false}
      onExitComplete={() => {
        // Scroll suave rápido apenas ao topo na troca de página
        if (lenisRef.current) {
          lenisRef.current.scrollTo(0, {
            immediate: false,  // animação suave
            duration: 0.6      // mais rápido que o scroll normal
          });
        }
      }}
    >
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/explore" element={<PageTransition><Explore /></PageTransition>} />
        <Route path="/category/:slug" element={<PageTransition><Category /></PageTransition>} />
        <Route path="/forum" element={<PageTransition><Forum /></PageTransition>} />
        <Route path="/forum/:id" element={<PageTransition><ForumTopic /></PageTransition>} />
        <Route path="/search" element={<PageTransition><Search /></PageTransition>} />
        <Route path="/course/new" element={<PageTransition><CourseNew /></PageTransition>} />
        <Route path="/course/:id" element={<PageTransition><CourseDetail /></PageTransition>} />
        <Route path="/course/:id/edit" element={<PageTransition><CourseEdit /></PageTransition>} />
        <Route path="/profile/:id" element={<PageTransition><Profile /></PageTransition>} />
        <Route path="/trails" element={<PageTransition><Trails /></PageTransition>} />
        <Route path="/trail/:id" element={<PageTransition><TrailDetail /></PageTransition>} />
        <Route path="/trail/new" element={<PageTransition><TrailNew /></PageTransition>} />
        <Route path="/trail/:id/edit" element={<PageTransition><TrailNew /></PageTransition>} />
        <Route path="/moderation" element={<ModerationRoute><PageTransition><Moderation /></PageTransition></ModerationRoute>} />
        <Route path="/admin" element={<AdminRoute><PageTransition><Admin /></PageTransition></AdminRoute>} />
        <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
        <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LenisProvider>
          <AppRoutes />
        </LenisProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
