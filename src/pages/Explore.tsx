import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { CourseCard } from "@/components/CourseCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Clock, Heart } from "lucide-react";

export default function Explore() {
  const [trendingCourses, setTrendingCourses] = useState<any[]>([]);
  const [recentCourses, setRecentCourses] = useState<any[]>([]);
  const [popularCourses, setPopularCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    try {
      const trendingQuery = await supabase
        .from("courses")
        .select("*, profiles!courses_author_id_fkey(id, username, full_name, avatar_url, is_verified_author), categories(name, slug, icon)")
        .eq("status", "approved")
        .order("view_count", { ascending: false })
        .limit(6);

      const recentQuery = await supabase
        .from("courses")
        .select("*, profiles!courses_author_id_fkey(id, username, full_name, avatar_url, is_verified_author), categories(name, slug, icon)")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(6);

      const popularQuery = await supabase
        .from("courses")
        .select("*, profiles!courses_author_id_fkey(id, username, full_name, avatar_url, is_verified_author), categories(name, slug, icon)")
        .eq("status", "approved")
        .order("like_count", { ascending: false })
        .limit(6);

      // Fetch categories
      const catsQuery = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (trendingQuery.data) setTrendingCourses(trendingQuery.data);
      if (recentQuery.data) setRecentCourses(recentQuery.data);
      if (popularQuery.data) setPopularCourses(popularQuery.data);
      if (catsQuery.data) setCategories(catsQuery.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderCourses = (courses: any[]) => (
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
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Explorar Cursos</h1>
          <p className="text-muted-foreground">
            Descubra novos conhecimentos e amplie suas habilidades
          </p>
        </div>

        <Tabs defaultValue="trending" className="mb-12">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="trending">
              <TrendingUp className="h-4 w-4 mr-2" />
              Em Alta
            </TabsTrigger>
            <TabsTrigger value="recent">
              <Clock className="h-4 w-4 mr-2" />
              Recentes
            </TabsTrigger>
            <TabsTrigger value="popular">
              <Heart className="h-4 w-4 mr-2" />
              Populares
            </TabsTrigger>
          </TabsList>
          <TabsContent value="trending" className="mt-6">
            {loading ? (
              <div className="text-center py-12">Carregando...</div>
            ) : (
              renderCourses(trendingCourses)
            )}
          </TabsContent>
          <TabsContent value="recent" className="mt-6">
            {loading ? (
              <div className="text-center py-12">Carregando...</div>
            ) : (
              renderCourses(recentCourses)
            )}
          </TabsContent>
          <TabsContent value="popular" className="mt-6">
            {loading ? (
              <div className="text-center py-12">Carregando...</div>
            ) : (
              renderCourses(popularCourses)
            )}
          </TabsContent>
        </Tabs>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Categorias</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link key={category.id} to={`/category/${category.slug}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {category.description || "Explore cursos desta categoria"}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
