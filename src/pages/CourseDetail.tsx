import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Heart, Bookmark, Flag, Eye, MessageSquare, Share2, Star, AlertCircle } from "lucide-react";
import { RatingComponent } from "@/components/RatingComponent";

// Convert YouTube URL to embed format
const convertToYouTubeEmbed = (url: string): string => {
  if (!url) return url;
  
  // Check if already an embed URL
  if (url.includes("youtube.com/embed/")) return url;
  
  // Handle youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/youtube\.com\/watch\?v=([^&]+)/);
  if (watchMatch) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }
  
  // Handle youtu.be/VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([^?]+)/);
  if (shortMatch) {
    return `https://www.youtube.com/embed/${shortMatch[1]}`;
  }
  
  // Handle playlist
  const playlistMatch = url.match(/[?&]list=([^&]+)/);
  if (playlistMatch) {
    return `https://www.youtube.com/embed/videoseries?list=${playlistMatch[1]}`;
  }
  
  return url;
};

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [course, setCourse] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState<any>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  useEffect(() => {
    if (id) {
      fetchCourse();
      fetchComments();
      recordView();
      if (user) checkUserInteractions();
    }
  }, [id, user]);

  const fetchCourse = async () => {
    setLoading(true);
    try {
      const { data: courseData, error } = await supabase
        .from("courses")
        .select("*, profiles!courses_author_id_fkey(id, username, full_name, avatar_url, is_verified_author), categories(name, slug, icon)")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (!courseData) {
        navigate("/404");
        return;
      }

      // Convert YouTube URL to embed if needed
      if (courseData.content_url) {
        courseData.content_url = convertToYouTubeEmbed(courseData.content_url);
      }

      setCourse(courseData);
      setLikesCount(courseData.like_count || 0);
    } catch (error) {
      console.error("Error fetching course:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar curso.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    const { data } = await supabase
      .from("comments")
        .select("*, profiles!comments_user_id_fkey(username, full_name, avatar_url)")
      .eq("course_id", id)
      .order("created_at", { ascending: false });

    if (data) setComments(data);
  };

  const recordView = async () => {
    if (!id) return;

    try {
      // Criar identificador único para esta sessão de navegação
      const sessionId = sessionStorage.getItem(`course_view_${id}`) ||
                       `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Verificar se já registramos visualização nesta sessão
      if (sessionStorage.getItem(`course_view_${id}`)) {
        console.log("Visualização já registrada nesta sessão");
        return;
      }

      // Marcar que registramos a visualização nesta sessão
      sessionStorage.setItem(`course_view_${id}`, sessionId);

      // Registrar a visualização no banco
      const { error } = await supabase
        .from("course_views")
        .insert({
          course_id: id,
          user_id: user?.id || null,
        });

      if (error) {
        console.error("Erro ao registrar visualização:", error);
      } else {
        console.log("Visualização registrada com sucesso");
      }
    } catch (error) {
      console.error("Erro inesperado ao registrar visualização:", error);
    }
  };

  const checkUserInteractions = async () => {
    if (!user) return;

    const { data: likeData } = await supabase
      .from("course_likes")
      .select()
      .eq("course_id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    const { data: saveData } = await supabase
      .from("course_saves")
      .select()
      .eq("course_id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    setIsLiked(!!likeData);
    setIsSaved(!!saveData);
  };

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Acesso Negado",
        description: "Você precisa estar logado para curtir.",
        variant: "destructive",
      });
      return;
    }

    if (isLiked) {
      setIsLiked(false);
      setLikesCount(prev => prev - 1);
      
      const { error } = await supabase
        .from("course_likes")
        .delete()
        .eq("course_id", id)
        .eq("user_id", user.id);

      if (error) {
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } else {
      setIsLiked(true);
      setLikesCount(prev => prev + 1);
      
      const { error } = await supabase
        .from("course_likes")
        .insert({ course_id: id, user_id: user.id });

      if (error) {
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      }
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Acesso Negado",
        description: "Você precisa estar logado para salvar.",
        variant: "destructive",
      });
      return;
    }

    if (isSaved) {
      setIsSaved(false);
      
      const { error } = await supabase
        .from("course_saves")
        .delete()
        .eq("course_id", id)
        .eq("user_id", user.id);

      if (error) {
        setIsSaved(true);
      } else {
        toast({ title: "Removido dos salvos" });
      }
    } else {
      setIsSaved(true);
      
      const { error } = await supabase
        .from("course_saves")
        .insert({ course_id: id, user_id: user.id });

      if (error) {
        setIsSaved(false);
      } else {
        toast({ title: "Salvo com sucesso!" });
      }
    }
  };

  const handleReport = async () => {
    if (!user) {
      toast({
        title: "Acesso Negado",
        description: "Você precisa estar logado para denunciar.",
        variant: "destructive",
      });
      return;
    }

    const reason = prompt("Motivo da denúncia:");
    if (!reason) return;

    await supabase.from("course_reports").insert({
      course_id: id,
      reporter_id: user.id,
      reason,
    });

    toast({ title: "Denúncia enviada" });
  };

  const handleCommentSubmit = async () => {
    if (!user) {
      toast({
        title: "Acesso Negado",
        description: "Você precisa estar logado para comentar.",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) return;

    const { error } = await supabase.from("comments").insert({
      course_id: id,
      user_id: user.id,
      content: newComment,
    });

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao enviar comentário.",
        variant: "destructive",
      });
    } else {
      setNewComment("");
      fetchComments();
      toast({ title: "Comentário adicionado!" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-8 text-center">Carregando...</main>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2">{course.title}</h1>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{course.difficulty_level}</Badge>
                  {course.categories && (
                    <Badge variant="outline">{course.categories.name}</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                {/* Status Badge for Author */}
                {course.status !== "approved" && (
                  <Card className="mb-4 border-yellow-500">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                        <div>
                          <p className="font-semibold">
                            {course.status === "pending" && "Aguardando Aprovação"}
                            {course.status === "rejected" && "Conteúdo Rejeitado"}
                          </p>
                          {course.rejection_reason && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Motivo: {course.rejection_reason}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Video/Content */}
                <Card className="mb-6">
                  <CardContent className="p-0">
                    <div className="aspect-video bg-muted">
                      <iframe
                        src={course.content_url}
                        className="w-full h-full"
                        allowFullScreen
                        title={course.title}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Description */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Sobre o Curso</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{course.description}</p>
                  </CardContent>
                </Card>

                {/* Rating Display */}
                {course.average_rating > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            star <= Math.round(course.average_rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-medium">{course.average_rating.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">
                      ({course.rating_count} {course.rating_count === 1 ? "avaliação" : "avaliações"})
                    </span>
                    {course.average_rating >= 4.5 && course.rating_count >= 5 && (
                      <Badge variant="default">Recomendado pela Comunidade</Badge>
                    )}
                  </div>
                )}

                {/* Tags */}
                {course.tags && course.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {course.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Rating Component */}
                <RatingComponent courseId={course.id} />

                {/* Comments Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Comentários ({comments.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Add Comment */}
                    {user && (
                      <div className="space-y-2">
                        <Textarea
                          placeholder="Adicione um comentário..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                        />
                        <Button onClick={handleCommentSubmit}>Enviar Comentário</Button>
                      </div>
                    )}

                    <Separator />

                    {/* Comments List */}
                    <div className="space-y-4">
                      {comments.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          Nenhum comentário ainda. Seja o primeiro!
                        </p>
                      ) : (
                        comments.map((comment) => (
                          <div key={comment.id} className="flex gap-3">
                            <Avatar>
                              <AvatarImage src={comment.profiles?.avatar_url} />
                              <AvatarFallback>
                                {comment.profiles?.full_name?.[0] || comment.profiles?.username?.[0] || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold">
                                  {comment.profiles?.full_name || comment.profiles?.username || "Usuário"}
                                </p>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(comment.created_at).toLocaleDateString("pt-BR")}
                                </span>
                              </div>
                              <p className="text-sm">{comment.content}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Ações</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      onClick={handleLike}
                      variant={isLiked ? "default" : "outline"}
                      className="w-full"
                    >
                      <Heart className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
                      {isLiked ? "Curtido" : "Curtir"} ({likesCount})
                    </Button>
                    <Button
                      onClick={handleSave}
                      variant={isSaved ? "default" : "outline"}
                      className="w-full"
                    >
                      <Bookmark className={`h-4 w-4 mr-2 ${isSaved ? "fill-current" : ""}`} />
                      {isSaved ? "Salvo" : "Salvar"}
                    </Button>
                    <Button variant="outline" className="w-full" onClick={handleReport}>
                      <Flag className="h-4 w-4 mr-2" />
                      Denunciar
                    </Button>
                  </CardContent>
                </Card>

                {/* Author Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Autor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={course.profiles?.avatar_url} />
                        <AvatarFallback>
                          {course.profiles?.full_name?.[0] || course.profiles?.username?.[0] || "A"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{course.profiles?.full_name || course.profiles?.username}</p>
                        {course.profiles?.is_verified_author && (
                          <Badge variant="secondary" className="text-xs">Verificado</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>Estatísticas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Visualizações</span>
                      <span className="font-semibold">{course.view_count}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Curtidas</span>
                      <span className="font-semibold">{likesCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Salvos</span>
                      <span className="font-semibold">{course.save_count}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
