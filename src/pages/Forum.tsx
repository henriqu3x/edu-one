import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Plus, User, Clock, Eye } from "lucide-react";
import { Link } from "react-router-dom";

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

export default function Forum() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicContent, setNewTopicContent] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [creatingTopic, setCreatingTopic] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("forum_topics")
        .select(`
          *,
          profiles!forum_topics_author_id_fkey(username, full_name, avatar_url),
          reply_count:forum_replies(count),
          view_count
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Process reply count
      const processedTopics = data?.map(topic => ({
        ...topic,
        reply_count: topic.reply_count?.[0]?.count || 0
      })) || [];

      setTopics(processedTopics);
    } catch (error) {
      console.error("Error fetching topics:", error);
      toast({ title: "Erro ao carregar tópicos", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const createTopic = async () => {
    if (!user) {
      toast({ title: "Faça login para criar tópicos", variant: "destructive" });
      return;
    }

    if (!newTopicTitle.trim() || !newTopicContent.trim()) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }

    setCreatingTopic(true);
    try {
      const { data, error } = await supabase
        .from("forum_topics")
        .insert({
          title: newTopicTitle.trim(),
          content: newTopicContent.trim(),
          author_id: user.id
        })
        .select(`
          *,
          profiles!forum_topics_author_id_fkey(username, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      setTopics(prev => [{
        ...data,
        reply_count: 0,
        view_count: 0
      }, ...prev]);

      setNewTopicTitle("");
      setNewTopicContent("");
      setIsDialogOpen(false);

      toast({ title: "Tópico criado com sucesso!" });
    } catch (error) {
      console.error("Error creating topic:", error);
      toast({ title: "Erro ao criar tópico", variant: "destructive" });
    } finally {
      setCreatingTopic(false);
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Fórum</h1>
            <p className="text-muted-foreground">
              Espaço de discussão para tirar dúvidas e compartilhar conhecimentos
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Tópico
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Tópico</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="topic-title">Título*</Label>
                  <Input
                    id="topic-title"
                    value={newTopicTitle}
                    onChange={(e) => setNewTopicTitle(e.target.value)}
                    placeholder="Digite o título do tópico..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topic-content">Conteúdo*</Label>
                  <Textarea
                    id="topic-content"
                    value={newTopicContent}
                    onChange={(e) => setNewTopicContent(e.target.value)}
                    placeholder="Descreva sua dúvida ou compartilhe seu conhecimento..."
                    rows={6}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={createTopic}
                    disabled={creatingTopic}
                  >
                    {creatingTopic ? "Criando..." : "Criar Tópico"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando tópicos...</p>
          </div>
        ) : topics.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nenhum tópico ainda</h3>
              <p className="text-muted-foreground mb-4">
                Seja o primeiro a iniciar uma discussão!
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Tópico
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {topics.map((topic) => (
              <Card key={topic.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                    </div>
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
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{topic.profiles?.full_name || topic.profiles?.username || 'Usuário'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(topic.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>{topic.reply_count} respostas</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{topic.view_count} visualizações</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
