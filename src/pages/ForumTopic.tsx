import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MessageSquare, Send, User } from "lucide-react";

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
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

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
    if (!user) {
      toast({ title: "Faça login para responder", variant: "destructive" });
      return;
    }

    if (!newReply.trim()) {
      toast({ title: "Digite uma resposta", variant: "destructive" });
      return;
    }

    setPostingReply(true);
    try {
      const { data, error } = await supabase
        .from("forum_replies")
        .insert({
          topic_id: id,
          content: newReply.trim(),
          author_id: user.id
        })
        .select(`
          *,
          profiles!forum_replies_author_id_fkey(username, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      setReplies(prev => [...prev, data]);
      setNewReply("");

      toast({ title: "Resposta enviada com sucesso!" });
    } catch (error) {
      console.error("Error posting reply:", error);
      toast({ title: "Erro ao enviar resposta", variant: "destructive" });
    } finally {
      setPostingReply(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
                    {topic.profiles?.full_name?.[0] || topic.profiles?.username?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{topic.title}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{topic.profiles?.full_name || topic.profiles?.username || 'Usuário'}</span>
                    </div>
                    <span>{formatDate(topic.created_at)}</span>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{replies.length} respostas</span>
                    </div>
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
                      {reply.profiles?.full_name?.[0] || reply.profiles?.username?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">
                        {reply.profiles?.full_name || reply.profiles?.username || 'Usuário'}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(reply.created_at)}
                      </span>
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
  );
}
