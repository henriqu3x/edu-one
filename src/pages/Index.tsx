import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { CourseCard } from "@/components/CourseCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, TrendingUp, BookOpen } from "lucide-react";
import { User as SupabaseUser } from "@supabase/supabase-js";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  difficulty_level: string;
  view_count: number;
  like_count: number;
  tags?: string[];
  profiles: {
    id: string;
    username: string;
    avatar_url?: string;
    is_verified_author: boolean;
  };
  categories?: {
    name: string;
    icon: string;
  };
}

export default function Index() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select(
          `
          *,
          profiles!courses_author_id_fkey (
            id,
            username,
            avatar_url,
            is_verified_author
          ),
          categories (
            name,
            icon
          )
        `
        )
        .order("created_at", { ascending: false })
        .limit(12);

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
        <div className="container relative py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <span className="text-sm font-medium">Feita pela comunidade, para a comunidade</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-fade-in animate-gradient">
              Compartilhe e Aprenda com a Comunidade
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Descubra minicursos gratuitos, dicas de estudo e conteúdos abertos criados por
              pessoas apaixonadas por compartilhar conhecimento.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              {user ? (
                <>
                  <Button size="lg" onClick={() => navigate("/course/new")} className="gap-2">
                    <Sparkles className="h-5 w-5" />
                    Criar Curso
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate("/explore")}>
                    <BookOpen className="h-5 w-5 mr-2" />
                    Explorar
                  </Button>
                </>
              ) : (
                <>
                  <Button size="lg" onClick={() => navigate("/auth")} className="gap-2">
                    Começar Agora
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
                    Entrar
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-primary" />
              Cursos Recentes
            </h2>
            <p className="text-muted-foreground">
              Descubra os conteúdos mais novos adicionados pela comunidade
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                description={course.description}
                thumbnail={course.thumbnail_url}
                author={course.profiles}
                category={course.categories}
                difficulty_level={course.difficulty_level}
                view_count={course.view_count}
                like_count={course.like_count}
                tags={course.tags}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum curso encontrado</h3>
            <p className="text-muted-foreground mb-6">
              Seja o primeiro a compartilhar conhecimento!
            </p>
            {user && (
              <Button onClick={() => navigate("/course/new")}>
                Criar Primeiro Curso
              </Button>
            )}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background/50 backdrop-blur-sm">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 Educa+. Todos os direitos reservados.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                Termos de Uso
              </a>
              <a href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                Política de Privacidade
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
