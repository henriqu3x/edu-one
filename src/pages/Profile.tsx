import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/Navbar";
import { CourseCard } from "@/components/CourseCard";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { UserPlus, UserMinus } from "lucide-react";

interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_verified_author: boolean;
  level: number;
  total_points: number;
}

export default function Profile() {
  const { id } = useParams();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [savedCourses, setSavedCourses] = useState<any[]>([]);
  const [trails, setTrails] = useState<any[]>([]);
  const [followedCreators, setFollowedCreators] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUser(user));
  }, []);

  useEffect(() => {
    if (id) {
      fetchProfile();
      fetchCourses();
      fetchSavedCourses();
      fetchTrails();
      fetchFollowedCreators();
      fetchFollowStats();
      checkFollowing();
    }
  }, [id, currentUser]);

  const createProfileIfNeeded = async () => {
    if (!currentUser) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }

    try {
      // Tentar obter dados do usuário autenticado
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData.user) {
        console.error("Erro ao obter dados do usuário:", userError);
        toast({
          title: "Erro",
          description: "Não foi possível obter dados do usuário",
          variant: "destructive"
        });
        return;
      }

      // Criar perfil automaticamente
      const { data, error } = await supabase
        .from("profiles")
        .insert({
          id: userData.user.id,
          username: userData.user.email?.split('@')[0] || `user_${userData.user.id.slice(0, 8)}`,
          full_name: userData.user.user_metadata?.full_name || '',
        })
        .select()
        .single();

      if (error) {
        console.error("Erro ao criar perfil:", error);
        toast({
          title: "Erro ao criar perfil",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      if (data) {
        setProfile(data);
        toast({
          title: "Perfil criado",
          description: "Seu perfil foi criado automaticamente!",
        });

        // Recarregar outras informações após criar o perfil
        if (currentUser.id === id) {
          fetchCourses();
          fetchSavedCourses();
          fetchTrails();
          fetchFollowStats();
        }
      }
    } catch (error) {
      console.error("Erro inesperado ao criar perfil:", error);
      toast({
        title: "Erro inesperado",
        description: "Não foi possível criar o perfil",
        variant: "destructive"
      });
    }
  };

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select()
        .eq("id", id);

      if (error) {
        console.error("Erro ao buscar perfil:", error);
        toast({
          title: "Erro ao carregar perfil",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      // Se não encontrou perfil, tenta criar um automaticamente
      if (!data || data.length === 0) {
        await createProfileIfNeeded();
        return;
      }

      // Se encontrou exatamente um perfil, usa ele
      if (data.length === 1) {
        setProfile(data[0]);
      } else {
        console.error("Encontrados múltiplos perfis para o mesmo ID");
        toast({
          title: "Erro",
          description: "Perfil duplicado encontrado",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erro inesperado ao buscar perfil:", error);
      toast({
        title: "Erro inesperado",
        description: "Não foi possível carregar o perfil",
        variant: "destructive"
      });
    }
  };

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select(`
          *,
          profiles:author_id (username, avatar_url, is_verified_author),
          categories:category_id (name, icon)
        `)
        .eq("author_id", id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar cursos:", error);
        toast({
          title: "Erro ao carregar cursos",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      if (data) setCourses(data);
    } catch (error) {
      console.error("Erro inesperado ao buscar cursos:", error);
    }
  };

  const fetchSavedCourses = async () => {
    if (!currentUser || currentUser.id !== id) return;

    try {
      const { data, error } = await supabase
        .from("course_saves")
        .select(`
          course_id,
          courses (
            *,
            profiles:author_id (id, username, avatar_url, is_verified_author),
            categories:category_id (name, icon)
          )
        `)
        .eq("user_id", id);

      if (error) {
        console.error("Erro ao buscar cursos salvos:", error);
        return;
      }

      if (data) setSavedCourses(data.map(s => s.courses).filter(Boolean).filter(course => course && course.profiles && course.profiles.id));
    } catch (error) {
      console.error("Erro inesperado ao buscar cursos salvos:", error);
    }
  };

  const fetchTrails = async () => {
    try {
      const { data, error } = await supabase
        .from("learning_trails")
        .select()
        .eq("creator_id", id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar trilhas:", error);
        return;
      }

      if (data) setTrails(data);
    } catch (error) {
      console.error("Erro inesperado ao buscar trilhas:", error);
    }
  };

  const fetchFollowedCreators = async () => {
    if (!currentUser || currentUser.id !== id) {
      console.log("");
      return;
    }

    try {

      // First, get the following IDs
      const { data: follows, error: followsError } = await supabase
        .from("user_follows")
        .select("following_id")
        .eq("follower_id", id);

      if (followsError) {
        console.error("Erro ao buscar follows:", followsError);
        return;
      }

      if (!follows || follows.length === 0) {
        console.log("");
        setFollowedCreators([]);
        return;
      }

      const followingIds = follows.map(f => f.following_id);

      // Then, fetch the profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, is_verified_author")
        .in("id", followingIds);

      if (profilesError) {
        console.error("Erro ao buscar profiles:", profilesError);
        return;
      }


      // Then, for each profile, fetch their latest content
      const creatorsWithContent = await Promise.all(
        profiles.map(async (profile) => {
          // Fetch latest course
          const { data: courses } = await supabase
            .from("courses")
            .select("id, title, created_at")
            .eq("author_id", profile.id)
            .order("created_at", { ascending: false })
            .limit(1);

          // Fetch latest trail
          const { data: trails } = await supabase
            .from("learning_trails")
            .select("id, title, created_at")
            .eq("creator_id", profile.id)
            .order("created_at", { ascending: false })
            .limit(1);

          const allContent = [
            ...(courses || []).map(c => ({ ...c, type: 'course' })),
            ...(trails || []).map(t => ({ ...t, type: 'trail' }))
          ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

          const lastContent = allContent[0];

          return {
            ...profile,
            lastContent
          };
        })
      );

      setFollowedCreators(creatorsWithContent);
    } catch (error) {
      console.error("Erro inesperado ao buscar criadores seguidos:", error);
    }
  };

  const fetchFollowStats = async () => {
    try {
      const { count: followers, error: followersError } = await supabase
        .from("user_follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", id);

      const { count: following, error: followingError } = await supabase
        .from("user_follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", id);

      if (followersError || followingError) {
        console.error("Erro ao buscar estatísticas de seguidores:", followersError || followingError);
        return;
      }

      setFollowerCount(followers || 0);
      setFollowingCount(following || 0);
    } catch (error) {
      console.error("Erro inesperado ao buscar estatísticas:", error);
    }
  };

  const checkFollowing = async () => {
    if (!currentUser || currentUser.id === id) return;

    try {
      const { data, error } = await supabase
        .from("user_follows")
        .select()
        .eq("follower_id", currentUser.id)
        .eq("following_id", id)
        .maybeSingle();

      if (error) {
        console.error("Erro ao verificar seguindo:", error);
        return;
      }

      setIsFollowing(!!data);
    } catch (error) {
      console.error("Erro inesperado ao verificar seguindo:", error);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      toast({ title: "Faça login para seguir", variant: "destructive" });
      return;
    }

    try {
      if (isFollowing) {
        const { error: deleteError } = await supabase
          .from("user_follows")
          .delete()
          .eq("follower_id", currentUser.id)
          .eq("following_id", id);

        if (deleteError) {
          console.error("Erro ao deixar de seguir:", deleteError);
          toast({ title: "Erro ao deixar de seguir", variant: "destructive" });
          return;
        }

        setIsFollowing(false);
        toast({ title: "Deixou de seguir" });
      } else {
        const { error: insertError } = await supabase
          .from("user_follows")
          .insert({
            follower_id: currentUser.id,
            following_id: id,
          });

        if (insertError) {
          console.error("Erro ao seguir:", insertError);
          toast({ title: "Erro ao seguir", variant: "destructive" });
          return;
        }

        setIsFollowing(true);
        toast({ title: "Seguindo!" });
      }
      fetchFollowStats();
    } catch (error) {
      console.error("Erro inesperado ao seguir/deixar de seguir:", error);
      toast({ title: "Erro inesperado", variant: "destructive" });
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-8">Carregando...</div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === id;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 max-w-6xl">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-2xl">{profile.username[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{profile.username}</h1>
                  {profile.is_verified_author && (
                    <Badge>✓ Verificado</Badge>
                  )}
                  <Badge variant="secondary">Nível {profile.level}</Badge>
                </div>
                {profile.full_name && (
                  <p className="text-muted-foreground">{profile.full_name}</p>
                )}
                {profile.bio && (
                  <p className="mt-2">{profile.bio}</p>
                )}
                <div className="flex items-center gap-4 mt-4 text-sm">
                  <span><strong>{followerCount}</strong> Seguidores</span>
                  <span><strong>{followingCount}</strong> Seguindo</span>
                  <span><strong>{profile.total_points}</strong> Pontos</span>
                </div>
                {!isOwnProfile && (
                  <Button onClick={handleFollow} className="mt-4" variant={isFollowing ? "outline" : "default"}>
                    {isFollowing ? <UserMinus className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                    {isFollowing ? "Deixar de seguir" : "Seguir"}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="courses">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="courses">{isMobile ? "Cursos" : "Cursos Criados"} ({courses.length})</TabsTrigger>
            {isOwnProfile && <TabsTrigger value="saved">Salvos ({savedCourses.length})</TabsTrigger>}
            <TabsTrigger value="trails">Trilhas ({trails.length})</TabsTrigger>
            {isOwnProfile && <TabsTrigger value="following">{isMobile ? "Seguindo" : "Criadores que você segue"} ({followedCreators.length})</TabsTrigger>}
          </TabsList>

          <TabsContent value="courses" className="space-y-4 mt-6">
            {courses.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum curso criado ainda</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map(course => (
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
            )}
          </TabsContent>

          {isOwnProfile && (
            <TabsContent value="saved" className="space-y-4 mt-6">
              {savedCourses.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhum curso salvo ainda</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedCourses.map(course => (
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
              )}
            </TabsContent>
          )}

          <TabsContent value="trails" className="space-y-4 mt-6">
            {trails.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Nenhuma trilha criada ainda</p>
                {isOwnProfile && (
                  <Button asChild>
                    <Link to="/trail/new">Criar Trilha</Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {trails.map(trail => (
                  <Link key={trail.id} to={`/trail/${trail.id}`}>
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle>{trail.title}</CardTitle>
                        {trail.description && <p className="text-sm text-muted-foreground">{trail.description}</p>}
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          {isOwnProfile && (
            <TabsContent value="following" className="space-y-4 mt-6">
              {followedCreators.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Você ainda não segue nenhum criador</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {followedCreators.map(creator => (
                    <Card key={creator.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={creator.avatar_url || undefined} />
                            <AvatarFallback>{creator.username[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{creator.username}</h3>
                              {creator.is_verified_author && (
                                <Badge variant="secondary" className="text-xs">✓</Badge>
                              )}
                            </div>
                            {creator.lastContent && (
                              <p className="text-sm text-muted-foreground">
                                Último {creator.lastContent.type === 'course' ? 'curso' : 'trilha'}: {creator.lastContent.title}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button asChild variant="outline" size="sm" className="w-full">
                          <Link to={`/profile/${creator.id}`}>Ver cursos</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
