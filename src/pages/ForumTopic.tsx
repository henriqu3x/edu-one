import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MessageSquare, Send, User, Flag } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Helmet } from "react-helmet-async";

interface Topic {
  id: string;
  title: string;
  content: string;
  created_at: string;
  author_id: string;
  profiles: {
    username: string;
    full_name: string;
    avatar_url: string;
  };
  reply_count: number;
  view_count: number;
}

interface Reply {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  profiles: {
    username: string;
    full_name: string;
    avatar_url: string;
  };
}

export default function ForumTopic() {
  const { id } = useParams<{ id: string }>();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [newReply, setNewReply] = useState("");
  const [postingReply, setPostingReply] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [currentReportId, setCurrentReportId] = useState<string | null>(null);
  const [reportedReplies, setReportedReplies] = useState<Set<string>>(new Set());
  const [isTopicReported, setIsTopicReported] = useState(false);
  const [showTopicReportDialog, setShowTopicReportDialog] = useState(false);
  const [showReplyReportDialog, setShowReplyReportDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user && id) {
        // Verificar se o usuário já denunciou alguma resposta
        const { data: replyReports } = await supabase
          .from('forum_reports')
          .select('reply_id')
          .eq('reporter_id', user.id);
          
        if (replyReports) {
          setReportedReplies(new Set(replyReports.map(r => r.reply_id)));
        }
        
        // Verificar se o usuário já denunciou este tópico
        const { data: topicReport } = await supabase
          .from('forum_topic_reports')
          .select('id')
          .eq('reporter_id', user.id)
          .eq('topic_id', id)
          .single();
          
        setIsTopicReported(!!topicReport);
      }
    };

    fetchUser();

    if (id) {
      fetchTopic();
      fetchReplies();
      incrementViewCount();
    }
  }, [id]);

  const fetchTopic = async () => {
    try {
      const { data, error } = await supabase
        .from("forum_topics")
        .select(`
          *,
          profiles!forum_topics_author_id_fkey(username, full_name, avatar_url)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setTopic(data);
    } catch (error) {
      console.error("Error fetching topic:", error);
      toast({ title: "Erro ao carregar tópico", variant: "destructive" });
    }
  };

  const fetchReplies = async () => {
    try {
      const { data, error } = await supabase
        .from("forum_replies")
        .select(`
          *,
          profiles!forum_replies_author_id_fkey(username, full_name, avatar_url)
        `)
        .eq("topic_id", id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setReplies(data || []);
    } catch (error) {
      console.error("Error fetching replies:", error);
      toast({ title: "Erro ao carregar respostas", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const incrementViewCount = async () => {
    try {
      await supabase.rpc("increment_forum_topic_view", { topic_id: id });
    } catch (error) {
      console.error("Error incrementing view count:", error);
    }
  };

  const postReply = async () => {

    setPostingReply(true);

    try {
      const { data: newReplyData, error } = await supabase
        .from("forum_replies")
        .insert([
          {
            topic_id: id,
            content: newReply,
            author_id: user.id,
          },
        ])
        .select(`
          *,
          profiles!forum_replies_author_id_fkey(username, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      // Atualizar a contagem de respostas no tópico
      const { error: countError } = await supabase
        .from('forum_topics')
        .update({
          reply_count: replies.length + 1
        })
        .eq('id', id);

      if (countError) {
        console.error('Error updating reply count:', countError);
      }

      // Adicionar a nova resposta à lista existente
      if (newReplyData) {
        setReplies(prev => [...prev, newReplyData as Reply]);
      }

      setNewReply("");
      toast({
        title: "Resposta publicada",
        description: "Sua resposta foi publicada com sucesso!",
      });
    } catch (error) {
      console.error("Error posting reply:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao publicar sua resposta.",
        variant: "destructive",
      });
    } finally {
      setPostingReply(false);
    }
  };

  const handleReport = async (replyId: string) => {
    if (!reportReason.trim() || !user) return;

    setReporting(true);

    try {
      const { error } = await supabase
        .from("forum_reports")
        .insert([
          {
            reply_id: replyId,
            reporter_id: user.id,
            reason: reportReason,
            status: "pending",
          },
        ]);

      if (error) throw error;

      // Adiciona o ID da resposta ao conjunto de respostas denunciadas
      setReportedReplies(prev => new Set([...prev, replyId]));

      toast({
        title: "Denúncia enviada",
        description: "Sua denúncia foi registrada e será analisada pela equipe de moderação.",
      });

      // Fechar o dialog após o envio bem-sucedido
      setReportReason("");
      setCurrentReportId(null);
      setShowReplyReportDialog(false);
    } catch (error) {
      console.error("Error reporting reply:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao enviar sua denúncia.",
        variant: "destructive",
      });
    } finally {
      setReporting(false);
    }
  };
  
  const handleReportTopic = async () => {
    if (!reportReason.trim() || !user || !id) return;
    
    setReporting(true);
    
    try {
      const { error } = await supabase
        .from("forum_topic_reports")
        .insert([
          {
            topic_id: id,
            reporter_id: user.id,
            reason: reportReason,
            status: "pending",
          },
        ]);
        
      if (error) throw error;
      
      setIsTopicReported(true);
      setShowTopicReportDialog(false);
      
      toast({
        title: "Tópico denunciado",
        description: "Sua denúncia foi registrada e será analisada pela equipe de moderação.",
      });
      
      setReportReason("");
    } catch (error) {
      console.error("Error reporting topic:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao denunciar o tópico.",
        variant: "destructive",
      });
    } finally {
      setReporting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando tópico...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Tópico não encontrado</p>
            <Link to="/forum">
              <Button className="mt-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Fórum
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${topic.title} | Fórum EduOne`}</title>

        <meta
          name="description"
          content={
            topic.content?.slice(0, 160) ||
            "Discussão no fórum EduOne sobre educação, tecnologia e aprendizado."
          }
        />

        <meta property="og:title" content={topic.title} />
        <meta
          property="og:description"
          content={
            topic.content ||
            "Discussão completa disponível no Fórum EduOne."
          }
        />
        <meta
          property="og:image"
          content={topic.profiles?.avatar_url || "/favicon.ico"}
        />

        <meta property="og:type" content="article" />
        <meta
          property="og:url"
          content={`https://educamais1.netlify.app/forum/${id}`}
        />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "DiscussionForumPosting",
            headline: topic.title,
            articleBody: topic.content,
            author: {
              "@type": "Person",
              name:
                topic.profiles?.full_name ||
                topic.profiles?.username ||
                "Usuário",
            },
            datePublished: topic.created_at,
            discussionUrl: `https://educamais1.netlify.app/forum/${id}`,
            publisher: {
              "@type": "Organization",
              name: "EduOne",
              url: "https://educamais1.netlify.app",
            },
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-8">
          <div className="mb-6">
            <Link to="/forum">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Fórum
              </Button>
            </Link>

            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={topic.profiles?.avatar_url} />
                    <AvatarFallback>
                      {topic.profiles?.full_name?.[0] || topic.profiles?.username?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{topic.title}</CardTitle>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{topic.profiles?.full_name || topic.profiles?.username || "Usuário"}</span>
                      </div>
                      <span>{formatDate(topic.created_at)}</span>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{replies.length} respostas</span>
                      </div>
                      {user && (
                        <Dialog open={showTopicReportDialog} onOpenChange={setShowTopicReportDialog}>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-red-500"
                              disabled={isTopicReported}
                              onClick={() => setShowTopicReportDialog(true)}
                            >
                              <Flag className="h-3.5 w-3.5 mr-1" />
                              {isTopicReported ? 'Tópico denunciado' : 'Denunciar tópico'}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Denunciar Tópico</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="topic-reason" className="text-right">
                                  Motivo
                                </Label>
                                <Input
                                  id="topic-reason"
                                  value={reportReason}
                                  onChange={(e) => setReportReason(e.target.value)}
                                  className="col-span-3"
                                  placeholder="Descreva o motivo da denúncia"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                type="submit"
                                onClick={handleReportTopic}
                                disabled={!reportReason.trim() || reporting}
                              >
                                {reporting ? "Enviando..." : "Enviar Denúncia"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{topic.content}</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4 mb-8">
            <h3 className="text-xl font-semibold">Respostas ({replies.length})</h3>

            {replies.map((reply) => (
              <Card key={reply.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={reply.profiles?.avatar_url} />
                      <AvatarFallback>
                        {reply.profiles?.full_name?.[0] || reply.profiles?.username?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">
                          {reply.profiles?.full_name || reply.profiles?.username || "Usuário"}
                        </span>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-muted-foreground">
                            {new Date(reply.created_at).toLocaleString("pt-BR")}
                          </p>
                          <Dialog open={showReplyReportDialog && currentReportId === reply.id} onOpenChange={(open) => {
                            if (!open) {
                              setShowReplyReportDialog(false);
                              setCurrentReportId(null);
                              setReportReason("");
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`h-6 w-6 ${reportedReplies.has(reply.id) ? 'text-gray-500' : 'text-muted-foreground hover:text-red-500'}`}
                                onClick={() => {
                                  setCurrentReportId(reply.id);
                                  setReportReason("");
                                  setShowReplyReportDialog(true);
                                }}
                                disabled={reportedReplies.has(reply.id)}
                                title={reportedReplies.has(reply.id) ? 'Você já denunciou esta resposta' : 'Denunciar resposta'}
                              >
                                <Flag className="h-3.5 w-3.5" />
                                <span className="sr-only">
                                  {reportedReplies.has(reply.id) ? 'Você já denunciou esta resposta' : 'Denunciar resposta'}
                                </span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Denunciar Resposta</DialogTitle>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="reason" className="text-right">
                                    Motivo
                                  </Label>
                                  <Input
                                    id="reason"
                                    value={reportReason}
                                    onChange={(e) => setReportReason(e.target.value)}
                                    className="col-span-3"
                                    placeholder="Descreva o motivo da denúncia"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  type="submit"
                                  onClick={() => handleReport(reply.id)}
                                  disabled={!reportReason.trim() || reporting}
                                >
                                  {reporting ? "Enviando..." : "Enviar Denúncia"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                      <p className="text-muted-foreground whitespace-pre-wrap">{reply.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {user ? (
            <Card>
              <CardHeader>
                <CardTitle>Sua Resposta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  placeholder="Digite sua resposta..."
                  rows={4}
                />
                <div className="flex justify-end">
                  <Button
                    onClick={postReply}
                    disabled={postingReply || !newReply.trim()}
                  >
                    {postingReply ? (
                      "Enviando..."
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Resposta
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Faça login para participar da discussão
                </p>
                <Link to="/auth">
                  <Button>Entrar</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </>
  );
}
