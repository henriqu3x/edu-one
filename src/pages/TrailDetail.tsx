import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { CourseCard } from "@/components/CourseCard";
import { useToast } from "@/hooks/use-toast";
import { Users, Edit, Trash } from "lucide-react";

interface Trail {
  id: string;
  title: string;
  description: string | null;
  follower_count: number;
  creator_id: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

export default function TrailDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [trail, setTrail] = useState<Trail | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  useEffect(() => {
    if (id) {
      fetchTrail();
      fetchCourses();
    }
  }, [id]);

  const fetchTrail = async () => {
    const { data, error } = await supabase
      .from("learning_trails")
      .select(`
        *,
        profiles:creator_id (username, avatar_url)
      `)
      .eq("id", id)
      .single();

    if (error) {
      toast({ title: "Erro ao carregar trilha", variant: "destructive" });
      navigate("/trails");
    } else {
      setTrail(data);
    }
  };

  const fetchCourses = async () => {
    const { data } = await supabase
      .from("trail_courses")
      .select(`
        order_index,
        courses (
          *,
          profiles:author_id (username, avatar_url, is_verified_author),
          categories:category_id (name, icon)
        )
      `)
      .eq("trail_id", id)
      .order("order_index");

    if (data) {
      setCourses(data.map(tc => tc.courses).filter(Boolean));
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir esta trilha?")) return;

    const { error } = await supabase.from("learning_trails").delete().eq("id", id);

    if (error) {
      toast({ title: "Erro ao excluir trilha", variant: "destructive" });
    } else {
      toast({ title: "Trilha excluída!" });
      navigate("/trails");
    }
  };

  if (!trail) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-8">Carregando...</div>
      </div>
    );
  }

  const isCreator = user?.id === trail.creator_id;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 max-w-6xl">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{trail.title}</CardTitle>
                {trail.description && (
                  <p className="text-muted-foreground">{trail.description}</p>
                )}
                <div className="flex items-center gap-4 mt-4">
                  <Link to={`/profile/${trail.creator_id}`} className="flex items-center gap-2 hover:opacity-80">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={trail.profiles.avatar_url || undefined} />
                      <AvatarFallback>{trail.profiles.username[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">por {trail.profiles.username}</span>
                  </Link>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {trail.follower_count} seguidores
                  </Badge>
                </div>
              </div>
              {isCreator && (
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" asChild>
                    <Link to={`/trail/${id}/edit`}>
                      <Edit className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button variant="destructive" size="icon" onClick={handleDelete}>
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Cursos desta Trilha ({courses.length})</h2>
          {courses.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Nenhum curso adicionado ainda</p>
                {isCreator && (
                  <Button asChild className="mt-4">
                    <Link to={`/trail/${id}/edit`}>Adicionar Cursos</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course, index) => (
                <div key={course.id} className="relative">
                  <Badge className="absolute top-2 left-2 z-10">{index + 1}</Badge>
                  <CourseCard
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
