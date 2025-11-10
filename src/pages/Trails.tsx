import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { Plus, Users } from "lucide-react";
import { Helmet } from "react-helmet-async";

interface Trail {
  id: string;
  title: string;
  description: string | null;
  follower_count: number;
  created_at: string;
  creator_id: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

export default function Trails() {
  const [trails, setTrails] = useState<Trail[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    fetchTrails();
  }, []);

  const fetchTrails = async () => {
    const { data } = await supabase
      .from("learning_trails")
      .select(`
        *,
        profiles:creator_id (username, avatar_url)
      `)
      .order("follower_count", { ascending: false });

    if (data) setTrails(data);
  };

  return (
    <>
      <Helmet>
        <title>Explorar Trilhas | EduOne</title>

        <meta
          name="description"
          content="Explore trilhas de aprendizado completas e organizadas — avance passo a passo em áreas como tecnologia, carreira, ciência e muito mais."
        />

        <meta property="og:title" content="Explorar Trilhas | EduOne" />
        <meta
          property="og:description"
          content="Encontre trilhas de aprendizado gratuitas e bem estruturadas para evoluir no seu ritmo."
        />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://educamais1.netlify.app/trails" />
        <meta property="og:image" content="https://educamais1.netlify.app/favicon.ico" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-8 max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Trilhas de Aprendizado</h1>
              <p className="text-muted-foreground">Sequências curadas de cursos para seu aprendizado</p>
            </div>
            {user && (
              <Button asChild>
                <Link to="/trail/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Trilha
                </Link>
              </Button>
            )}
          </div>

          {trails.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Nenhuma trilha criada ainda</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {trails.map((trail) => (
                <Link key={trail.id} to={`/trail/${trail.id}`}>
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-2xl mb-2">{trail.title}</CardTitle>
                          {trail.description && (
                            <CardDescription>{trail.description}</CardDescription>
                          )}
                        </div>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {trail.follower_count}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={trail.profiles.avatar_url || undefined} />
                          <AvatarFallback>{trail.profiles.username[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">
                          por {trail.profiles.username}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
