import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { CourseCard } from "@/components/CourseCard";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const query = searchParams.get("q") || "";
    setSearchQuery(query);
    fetchCourses(query);
  }, [searchParams, selectedCategory, selectedDifficulty]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("name");
    if (data) setCategories(data);
  };

  const fetchCourses = async (query: string) => {
    setLoading(true);
    
    try {
      let queryBuilder = supabase
        .from("courses")
        .select("*, profiles!courses_author_id_fkey(id, username, full_name, avatar_url, is_verified_author), categories(name, slug, icon)")
        .eq("status", "approved");

      if (query) {
        queryBuilder = queryBuilder.or(
          `title.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`
        );
      }

      if (selectedCategory !== "all") {
        queryBuilder = queryBuilder.eq("category_id", selectedCategory);
      }

      if (selectedDifficulty !== "all") {
        queryBuilder = queryBuilder.eq("difficulty_level", selectedDifficulty);
      }

      const { data } = await queryBuilder.order("created_at", { ascending: false });

      if (data) {
        setCourses(data);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: searchQuery });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            {searchParams.get("q") ? `Resultados para "${searchParams.get("q")}"` : "Buscar Cursos"}
          </h1>
          
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar cursos, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>

          <div className="flex gap-4 flex-wrap">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Dificuldade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Dificuldades</SelectItem>
                <SelectItem value="iniciante">Iniciante</SelectItem>
                <SelectItem value="intermediario">Intermediário</SelectItem>
                <SelectItem value="avancado">Avançado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Carregando...</div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum curso encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                description={course.description}
                thumbnail={course.thumbnail_url}
                author={{
                  id: course.profiles?.id,
                  username: course.profiles?.full_name || course.profiles?.username,
                  avatar_url: course.profiles?.avatar_url,
                  is_verified_author: course.profiles?.is_verified_author || false,
                }}
                category={course.categories ? { name: course.categories.name, icon: course.categories.icon || '📚' } : undefined}
                difficulty_level={course.difficulty_level}
                view_count={course.view_count}
                like_count={course.like_count}
                tags={course.tags || []}
                average_rating={course.average_rating}
                rating_count={course.rating_count}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
