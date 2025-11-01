import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { CourseCard } from "@/components/CourseCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Clock, Heart, UserCheck } from "lucide-react";
import { CategoryIcon } from "@/lib/icons";
import { Helmet } from "react-helmet-async";

export default function Explore() {
  const [trendingCourses, setTrendingCourses] = useState<any[]>([]);
  const [recentCourses, setRecentCourses] = useState<any[]>([]);
  const [popularCourses, setPopularCourses] = useState<any[]>([]);
  const [followedCreatorsCourses, setFollowedCreatorsCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
      setUserLoading(false);
    });
  }, []);

  useEffect(() => {
    fetchData();
  }, [currentUser]);

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

      // Fetch courses from followed creators if user is logged in
      let followedCreatorsQuery = null;
      if (currentUser) {
        // First get the following IDs
        const { data: follows } = await supabase
          .from("user_follows")
          .select("following_id")
          .eq("follower_id", currentUser.id);

        if (follows && follows.length > 0) {
          const followingIds = follows.map(f => f.following_id);

          followedCreatorsQuery = await supabase
            .from("courses")
            .select("*, profiles!courses_author_id_fkey(id, username, full_name, avatar_url, is_verified_author), categories(name, slug, icon)")
            .eq("status", "approved")
            .in("author_id", followingIds)
            .order("created_at", { ascending: false })
            .limit(6);
        }
      }

      // Fetch categories
      const catsQuery = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (trendingQuery.data) setTrendingCourses(trendingQuery.data);
      if (recentQuery.data) setRecentCourses(recentQuery.data);
      if (popularQuery.data) setPopularCourses(popularQuery.data);
      if (followedCreatorsQuery?.data) setFollowedCreatorsCourses(followedCreatorsQuery.data);
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
          category={course.categories ? { name: course.categories.name, icon: course.categories.icon || 'Book' } : undefined}
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
    <>
      <Helmet>
        <title>Explorar Cursos | Educa+</title>
        <meta
          name="description"
          content="Descubra cursos gratuitos e de alta qualidade em diversas áreas do conhecimento — tudo organizado e fácil de aprender."
        />
        <meta property="og:title" content="Explorar Cursos | Educa+" />
        <meta
          property="og:description"
          content="Descubra cursos gratuitos e de alta qualidade em diversas áreas do conhecimento."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://educamais1.netlify.app/explore" />
        <meta property="og:image" content="https://educamais1.netlify.app/favicon.ico" />
      </Helmet>
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
            <TabsList className="grid w-full max-w-2xl grid-cols-4">
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
              <TabsTrigger value="followed">
                <UserCheck className="h-4 w-4 mr-2" />
                Seguindo
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
            <TabsContent value="followed" className="mt-6">
              {loading ? (
                <div className="text-center py-12">Carregando...</div>
              ) : followedCreatorsCourses.length > 0 ? (
                renderCourses(followedCreatorsCourses)
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">Você ainda não segue nenhum criador com cursos publicados</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Categorias</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((category) => (
                <Link key={category.id} to={`/category/${category.slug}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader className="flex flex-row items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <CategoryIcon iconName={category.icon} className="h-6 w-6 text-primary" />
                      </div>
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
    </>
  );
}
