import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { CourseCard } from "@/components/CourseCard";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, Users, MessageSquare, BookOpen } from "lucide-react";
import { CategoryIcon } from "@/lib/icons";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [users, setUsers] = useState<any[]>([]);
  const [forumTopics, setForumTopics] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("courses");

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const query = searchParams.get("q") || "";
    setSearchQuery(query);
    if (query) {
      fetchCourses(query);
      fetchUsers(query);
      fetchForumTopics(query);
    }
  }, [searchParams]);

  useEffect(() => {
    const query = searchParams.get("q") || "";
    if (query) {
      fetchCourses(query);
    }
  }, [selectedCategory, selectedDifficulty]);

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

  const fetchUsers = async (query: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .order("username");

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchForumTopics = async (query: string) => {
    try {
      const { data, error } = await supabase
        .from("forum_topics")
        .select(`
          *,
          profiles!forum_topics_author_id_fkey(username, full_name, avatar_url),
          reply_count:forum_replies(count)
        `)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const processedTopics = data?.map(topic => ({
        ...topic,
        reply_count: topic.reply_count?.[0]?.count || 0
      })) || [];

      setForumTopics(processedTopics);
    } catch (error) {
      console.error("Error fetching forum topics:", error);
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
            {searchParams.get("q") ? `Resultados para "${searchParams.get("q")}"` : "Buscar"}
          </h1>

          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar cursos, usuários, fórum..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>

          {searchParams.get("q") && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="courses" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Cursos ({courses.length})
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Usuários ({users.length})
                </TabsTrigger>
                <TabsTrigger value="forum" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Fórum ({forumTopics.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="courses" className="mt-6">
                <div className="flex gap-4 flex-wrap mb-6">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Categorias</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <div className="flex items-center gap-2">
                            <CategoryIcon iconName={cat.icon} className="h-4 w-4" />
                            {cat.name}
                          </div>
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
              </TabsContent>

              <TabsContent value="users" className="mt-6">
                {/* Users filters can be added here if needed */}
              </TabsContent>

              <TabsContent value="forum" className="mt-6">
                {/* Forum filters can be added here if needed */}
              </TabsContent>
            </Tabs>
          )}
        </div>

        {searchParams.get("q") ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="courses">
              {loading ? (
                <div className="text-center py-12">Carregando cursos...</div>
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
              )}
            </TabsContent>

            <TabsContent value="users">
              {users.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Nenhum usuário encontrado.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {users.map((user) => (
                    <Card key={user.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <Link to={`/profile/${user.id}`} className="flex items-center gap-4">
                          <Avatar className="w-16 h-16">
                            <AvatarImage src={user.avatar_url} />
                            <AvatarFallback>{user.username[0]?.toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{user.username}</h3>
                            {user.full_name && (
                              <p className="text-muted-foreground">{user.full_name}</p>
                            )}
                            {user.bio && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{user.bio}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              {user.is_verified_author && (
                                <Badge variant="secondary">✓ Verificado</Badge>
                              )}
                              <Badge variant="outline">Nível {user.level || 1}</Badge>
                            </div>
                          </div>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="forum">
              {forumTopics.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Nenhum tópico encontrado.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {forumTopics.map((topic) => (
                    <Card key={topic.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={topic.profiles?.avatar_url} />
                            <AvatarFallback>
                              {topic.profiles?.full_name?.[0] || topic.profiles?.username?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <Link to={`/forum/${topic.id}`}>
                              <h3 className="text-lg font-semibold hover:text-primary transition-colors line-clamp-1">
                                {topic.title}
                              </h3>
                            </Link>
                            <p className="text-muted-foreground mt-1 line-clamp-2">
                              {topic.content}
                            </p>
                            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                              <span>{topic.profiles?.full_name || topic.profiles?.username || 'Usuário'}</span>
                              <span>{new Date(topic.created_at).toLocaleDateString('pt-BR')}</span>
                              <span>{topic.reply_count} respostas</span>
                              <span>{topic.view_count} visualizações</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Digite algo para buscar cursos, usuários e tópicos do fórum.</p>
          </div>
        )}
      </main>
    </div>
  );
}
