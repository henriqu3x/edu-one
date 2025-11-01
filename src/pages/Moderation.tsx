import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, AlertTriangle, Clock, Edit, ChevronDown, ChevronUp, Info, ExternalLink, Loader2, Trash2 } from "lucide-react";
import * as Diff from 'diff';

// Função para verificar se a URL é do YouTube
const isYoutubeUrl = (url: string): boolean => {
  if (!url) return false;
  return url.includes('youtube.com') || url.includes('youtu.be');
};

// Função para verificar se é uma playlist do YouTube
const isYoutubePlaylist = (url: string): boolean => {
  if (!url) return false;
  return url.includes('list=') || url.includes('playlist');
};

// Função para converter URL do YouTube em URL de embed
const getYoutubeEmbedUrl = (url: string): string => {
  if (!url) return '';

  // Se já for uma URL de embed, retorna como está
  if (url.includes('embed')) return url;

  // Verifica se é uma playlist
  if (isYoutubePlaylist(url)) {
    // Extrai o ID da playlist
    const playlistMatch = url.match(/[&?]list=([^&]+)/);
    if (playlistMatch && playlistMatch[1]) {
      return `https://www.youtube.com/embed/videoseries?list=${playlistMatch[1]}&rel=0&modestbranding=1&showinfo=0`;
    }
  }

  // Padrões mais simples e robustos para extrair ID do vídeo
  let videoId = '';

  // Padrão para youtu.be/short-url
  const shortUrlMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortUrlMatch) {
    videoId = shortUrlMatch[1];
  }

  // Padrão para youtube.com/watch?v=VIDEO_ID
  if (!videoId) {
    const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (watchMatch) {
      videoId = watchMatch[1];
    }
  }

  // Padrão para youtube.com/embed/VIDEO_ID
  if (!videoId) {
    const embedMatch = url.match(/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch) {
      videoId = embedMatch[1];
    }
  }

  // Padrão para youtube.com/v/VIDEO_ID
  if (!videoId) {
    const vMatch = url.match(/\/v\/([a-zA-Z0-9_-]{11})/);
    if (vMatch) {
      videoId = vMatch[1];
    }
  }

  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0`;
  }

  // Se não conseguir extrair, retorna a URL original
  return url;
};

// Tipos para os dados do curso
interface Course {
  id: string;
  title: string;
  description: string;
  status: string;
  profiles?: {
    full_name?: string;
    username?: string;
    avatar_url?: string;
  };
  [key: string]: any;
}

// Tipos para as edições pendentes
interface PendingEdit {
  id: string;
  course_id: string;
  author_id: string;
  title: string;
  description: string;
  category_id: string | null;
  difficulty_level: string;
  thumbnail_url: string | null;
  tags: string[];
  video_type: string | null;
  video_urls: string[] | null;
  content_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  moderated_at: string | null;
  moderated_by: string | null;
  
  // Additional fields for display
  course_title: string;
  author_name: string;
  author_username: string | null;
  author_avatar_url: string | null;
  original_description: string;
  original_difficulty_level: string;
  original_thumbnail_url: string | null;
  original_tags: string[];
  original_video_type: string | null;
  original_video_urls: string[] | null;
  
  // Nested objects
  courses: {
    id: string;
    title: string;
    description: string;
    difficulty_level: string;
    thumbnail_url: string | null;
    tags: string[] | null;
    video_type: string | null;
    video_urls: string[] | null;
    status?: string;
  } | null;
  
  profiles: {
    id: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
}

// Tipos para os relatórios
type BaseReport = {
  id: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'resolved';
  reason: string;
  created_at: string;
  reporter_id: string;
  reporter?: {
    username?: string;
    full_name?: string;
    avatar_url?: string;
  };
  moderator_id?: string | null;
  moderator?: {
    username?: string;
    full_name?: string;
  } | null;
};

type CourseReport = BaseReport & {
  type: 'course';
  course_id: string;
  course?: {
    id: string;
    title: string;
    status: string;
  };
};

type ForumReport = BaseReport & {
  type: 'forum';
  content_type: 'topic' | 'reply';
  content_id: string;
  content?: {
    id: string;
    content?: string;
    author_id: string;
    author?: {
      username?: string;
      full_name?: string;
      avatar_url?: string;
    };
    topic?: {
      id: string;
      title: string;
      author_id: string;
      author?: {
        username?: string;
        full_name?: string;
        avatar_url?: string;
      };
    };
  };
};

type Report = CourseReport | ForumReport;


// Função para renderizar as diferenças entre textos
const renderDiff = (oldText: string = '', newText: string = '') => {
  const diff = Diff.diffWords(oldText, newText);
  return (
    <div className="whitespace-pre-wrap bg-gray-900 p-2 rounded">
      {diff.map((part, index) => {
        const color = part.added 
          ? 'bg-green-900 text-green-200' 
          : part.removed 
            ? 'bg-red-900/50 text-red-200 line-through' 
            : 'text-gray-300';
        return <span key={index} className={color}>{part.value}</span>;
      })}
    </div>
  );
};

// Componente para exibir comparativo de valores
const DiffField = ({ label, oldValue, newValue, isHtml = false }: { 
  label: string; 
  oldValue: any; 
  newValue: any; 
  isHtml?: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Se não houver diferença, não mostra o campo
  if (String(oldValue) === String(newValue)) return null;
  
  return (
    <div className="border rounded-md overflow-hidden">
      <button 
        className="w-full px-4 py-2 text-left font-medium bg-gray-800 hover:bg-gray-700 text-gray-100 flex justify-between items-center rounded-t"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="font-semibold">{label}</span>
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      
      {isExpanded && (
        <div className="p-4 space-y-4">
          <div>
            <div className="text-sm font-medium text-gray-400 mb-1">Anterior:</div>
            <div className="p-2 bg-gray-800 rounded border border-gray-700">
              {isHtml ? (
                <div className="text-gray-300" dangerouslySetInnerHTML={{ __html: oldValue || 'Não especificado' }} />
              ) : (
                <div className="text-gray-300">{String(oldValue || 'Não especificado')}</div>
              )}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-400 mb-1">Novo:</div>
            <div className="p-2 bg-gray-800 rounded border border-gray-600">
              {isHtml ? (
                <div className="text-gray-300" dangerouslySetInnerHTML={{ __html: newValue || 'Não especificado' }} />
              ) : (
                <div className="text-gray-300">{String(newValue || 'Não especificado')}</div>
              )}
            </div>
          </div>
          {!isHtml && (
            <div>
              <div className="text-sm font-medium text-gray-400 mb-1">Diferença:</div>
              <div className="bg-gray-900 rounded border border-gray-700 overflow-hidden">
                {renderDiff(String(oldValue || ''), String(newValue || ''))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function Moderation() {
  const [pendingCourses, setPendingCourses] = useState<Course[]>([]);
  const [pendingEdits, setPendingEdits] = useState<PendingEdit[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [moderationLogs, setModerationLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState<{ [key: string]: string }>({});
  const [processingReports, setProcessingReports] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    const init = async () => {
      const hasAccess = await checkModeratorAccess();
      if (hasAccess) {
        fetchData();
      }
    };
    
    init();
  }, []);

  const checkModeratorAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = "/auth";
      return false;
    }

    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    if (rolesError) {
      console.error("Error fetching user roles:", rolesError);
      return false;
    }

    const isModerator = roles?.some(r => r.role === "moderator" || r.role === "admin");
    
    if (!isModerator) {
      toast({
        title: "Acesso Negado",
        description: "Você não tem permissão para acessar esta página.",
        variant: "destructive",
      });
      window.location.href = "/";
      return false;
    }
    
    return true;
  };

  const fetchModerationLogs = async () => {
    try {
      // Primeiro, buscar os logs de moderação
      const { data: logs, error: logsError } = await supabase
        .from('moderation_logs')
        .select(`
          *,
          course:course_id(
            id,
            title,
            status
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsError) throw logsError;

      if (!logs || logs.length === 0) {
        setModerationLogs([]);
        return [];
      }

      // Obter IDs únicos de moderadores
      const moderatorIds = [...new Set(logs.map(log => log.moderator_id))];
      
      // Buscar informações dos moderadores em lote
      const { data: moderators, error: moderatorsError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', moderatorIds);

      if (moderatorsError) throw moderatorsError;

      // Criar um mapa de moderadores para acesso rápido
      const moderatorsMap = new Map(moderators?.map(m => [m.id, m]));

      // Combinar os dados
      const logsWithModerators = logs.map(log => {
        // Extrair o título do curso ou usar um valor padrão
        let courseTitle = log.course?.title || 'Curso removido';
        let courseStatus = log.course?.status || 'removed';
        
        // Se o curso não estiver disponível, tentar extrair o título do motivo (se existir)
        if (courseTitle === 'Curso removido' && log.reason) {
          const titleMatch = log.reason.match(/"([^"]+)"/);
          if (titleMatch && titleMatch[1]) {
            courseTitle = titleMatch[1];
          }
        }
        
        return {
          ...log,
          course: log.course ? {
            ...log.course,
            title: courseTitle,
            status: courseStatus
          } : {
            id: log.course_id,
            title: courseTitle,
            status: courseStatus
          },
          moderator: moderatorsMap.get(log.moderator_id) || {
            id: log.moderator_id,
            username: 'Usuário desconhecido',
            full_name: 'Usuário desconhecido',
            avatar_url: null
          }
        };
      });

      setModerationLogs(logsWithModerators);
      return logsWithModerators;
    } catch (error) {
      console.error('Error fetching moderation logs:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o histórico de moderação.',
        variant: 'destructive',
      });
      return [];
    }
  };
      
  const formatEdits = (edits: any[], coursesMap: Map<any, any>, profilesMap: Map<any, any>) => {
    return edits.map(edit => {
      const course = coursesMap.get(edit.course_id);
      const profile = profilesMap.get(edit.author_id);
      
      return {
        ...edit,
        course_title: course?.title || 'Curso não encontrado',
        author_name: profile?.full_name || profile?.username || 'Usuário anônimo',
        author_username: profile?.username || null,
        author_avatar_url: profile?.avatar_url || null,
        original_thumbnail_url: edit.thumbnail_url,
        original_tags: edit.tags,
        original_description: edit.description,
        original_difficulty_level: edit.difficulty_level,
        original_video_type: edit.video_type,
        original_video_urls: edit.video_urls
      };
    });
  };

  const fetchData = async () => {
    setLoading(true);
    
    try {
      // Buscar cursos pendentes
      const { data: pendingCourses, error: coursesError } = await supabase
        .from('courses')
        .select('*, profiles(full_name, username, avatar_url)')
        .eq('status', 'pending');
      
      if (coursesError) throw coursesError;
      setPendingCourses(pendingCourses || []);
      
      // Buscar edições pendentes
      const fetchPendingEdits = async () => {
        try {
          // Buscar as edições pendentes
          const { data: editsData, error } = await supabase
            .from('course_edits')
            .select(`
              *,
              courses (
                id,
                title,
                description,
                difficulty_level,
                thumbnail_url,
                tags,
                video_type,
                video_urls
              )
            `)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

          if (error) throw error;
          if (!editsData) return [];

          // Buscar os perfis dos autores
          const authorIds = editsData
            .map(edit => edit.author_id)
            .filter((id): id is string => !!id);

          let authors: { id: string; full_name: string | null; username: string | null; avatar_url: string | null }[] = [];
          
          if (authorIds.length > 0) {
            const { data: authorsData, error: authorsError } = await supabase
              .from('profiles')
              .select('id, full_name, username, avatar_url')
              .in('id', authorIds);

            if (authorsError) throw authorsError;
            authors = authorsData || [];
          }

          // Mapear os dados para o formato esperado
          const editsWithDetails: PendingEdit[] = editsData.map(edit => {
            const author = authors.find(a => a.id === edit.author_id);
            const courseData = edit.courses || {
              id: edit.course_id,
              title: edit.title,
              description: '',
              difficulty_level: 'beginner',
              thumbnail_url: null,
              tags: [],
              video_type: null,
              video_urls: []
            };

            // Debug logging for difficulty level

            const editData: PendingEdit = {
              ...edit,
              video_urls: edit.video_urls || [],
              course_title: courseData.title || 'Curso não encontrado',
              author_name: author?.full_name || author?.username || 'Usuário desconhecido',
              author_username: author?.username || null,
              author_avatar_url: author?.avatar_url || null,
              original_description: courseData.description || '',
              original_difficulty_level: courseData.difficulty_level || 'beginner',
              original_thumbnail_url: courseData.thumbnail_url || null,
              original_tags: courseData.tags || [],
              original_video_type: courseData.video_type || null,
              original_video_urls: courseData.video_urls || [],
              courses: courseData,
              profiles: author ? {
                id: author.id,
                full_name: author.full_name,
                username: author.username,
                avatar_url: author.avatar_url
              } : null
            };

            return editData;
          });

          setPendingEdits(editsWithDetails);
        } catch (error) {
          console.error('Error fetching pending edits:', error);
          toast({
            title: 'Erro',
            description: 'Não foi possível carregar as edições pendentes.',
            variant: 'destructive',
          });
        }
      };
      await fetchPendingEdits();
      
      // 1. Buscar denúncias de cursos
      const { data: courseReports, error: courseReportError } = await supabase
        .from('course_reports')
        .select(`
          *,
          reporter:profiles!course_reports_reporter_id_fkey(username, full_name, avatar_url),
          course:courses!course_reports_course_id_fkey(
            id,
            title,
            status,
            author_id,
            profiles:profiles!courses_author_id_fkey(
              id,
              username,
              full_name,
              avatar_url
            )
          )
        `)
        .eq('status', 'pending');

      if (courseReportError) throw courseReportError;
      // 2. Buscar denúncias de respostas do fórum
      const { data: forumReplyReports, error: replyError } = await supabase
        .from('forum_reports')
        .select(`
          *,
          reporter:profiles!forum_reports_reporter_id_fkey(username, full_name, avatar_url),
          reply:forum_replies!forum_reports_reply_id_fkey(
            id,
            content,
            author_id,
            created_at,
            author:profiles!forum_replies_author_id_fkey(username, full_name, avatar_url),
            topic:forum_topics!forum_replies_topic_id_fkey(
              id,
              title,
              author_id,
              author:profiles!forum_topics_author_id_fkey(username, full_name, avatar_url)
            )
          )
        `)
        .eq("status", "pending");

      if (replyError) throw replyError;

      // 3. Buscar denúncias de tópicos do fórum
      const { data: forumTopicReports, error: topicError } = await supabase
        .from('forum_topic_reports')
        .select(`
          *,
          reporter:profiles!forum_topic_reports_reporter_id_fkey(username, full_name, avatar_url),
          topic:forum_topics!forum_topic_reports_topic_id_fkey(
            id,
            title,
            content,
            author_id,
            author:profiles!forum_topics_author_id_fkey(username, full_name, avatar_url)
          )
        `)
        .eq("status", "pending");

      if (topicError) throw topicError;

      // Processar relatórios de cursos
      const processedCourseReports = (courseReports || [])
        .filter(report => report.course)
        .map(report => ({
          id: report.id,
          type: 'course' as const,
          course_id: report.course_id,
          reason: report.reason,
          status: report.status,
          created_at: report.created_at,
          reporter_id: report.reporter_id,
          reporter: {
            username: report.reporter?.username,
            full_name: report.reporter?.full_name,
            avatar_url: report.reporter?.avatar_url
          },
          course: {
            id: report.course.id,
            title: report.course.title,
            status: report.course.status,
            author: report.course.profiles ? {
              id: report.course.profiles.id,
              username: report.course.profiles.username,
              full_name: report.course.profiles.full_name,
              avatar_url: report.course.profiles.avatar_url
            } : undefined
          }
        }));

      // Processar relatórios de respostas do fórum
      const processedReplyReports = (forumReplyReports || [])
        .filter(report => report.reply)
        .map(report => ({
          id: report.id,
          type: 'forum' as const,
          content_type: 'reply' as const,
          content_id: report.reply_id,
          reason: report.reason,
          status: report.status,
          created_at: report.created_at,
          reporter_id: report.reporter_id,
          reporter: {
            username: report.reporter?.username,
            full_name: report.reporter?.full_name,
            avatar_url: report.reporter?.avatar_url
          },
          content: {
            id: report.reply.id,
            content: report.reply.content,
            author_id: report.reply.author_id,
            author: report.reply.author,
            topic: report.reply.topic ? {
              id: report.reply.topic.id,
              title: report.reply.topic.title,
              author_id: report.reply.topic.author_id,
              author: report.reply.topic.author
            } : undefined
          }
        }));

      // Processar relatórios de tópicos do fórum
      const processedTopicReports = (forumTopicReports || [])
        .filter(report => report.topic)
        .map(report => ({
          id: report.id,
          type: 'forum' as const,
          content_type: 'topic' as const,
          content_id: report.topic_id,
          reason: report.reason,
          status: report.status,
          created_at: report.created_at,
          reporter_id: report.reporter_id,
          reporter: {
            username: report.reporter?.username,
            full_name: report.reporter?.full_name,
            avatar_url: report.reporter?.avatar_url
          },
          content: {
            id: report.topic.id,
            content: report.topic.content,
            author_id: report.topic.author_id,
            author: report.topic.author,
            topic: {
              id: report.topic.id,
              title: report.topic.title,
              author_id: report.topic.author_id,
              author: report.topic.author
            }
          }
        }));

      // Combinar e ordenar todos os relatórios
      const allReports = [
        ...processedCourseReports,
        ...processedReplyReports,
        ...processedTopicReports
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setReports(allReports);
      
      // Buscar logs de moderação
      await fetchModerationLogs();
    } catch (error) {
      console.error('Error in fetchData:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados de moderação.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (courseId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Primeiro, obter informações do curso para registro no histórico
      const { data: course, error: fetchError } = await supabase
        .from('courses')
        .select('title, author_id, status')
        .eq('id', courseId)
        .single();

      if (fetchError || !course) throw fetchError || new Error('Curso não encontrado');

      // Atualizar status do curso
      const { error } = await supabase
        .from("courses")
        .update({
          status: "approved",
          moderated_at: new Date().toISOString(),
          moderated_by: user.id,
        })
        .eq("id", courseId);

      if (error) throw error;

      // Registrar a ação de aprovação no histórico de moderação
      const { error: logError } = await supabase
        .from('moderation_logs')
        .insert({
          course_id: courseId,
          moderator_id: user.id,
          action: 'approved',
          reason: `Curso "${course.title}" aprovado pelo moderador`
        });

      if (logError) {
        console.error('Erro ao registrar ação de aprovação:', logError);
        throw new Error('Erro ao registrar ação de moderação');
      }

      // Remover quaisquer denúncias para este curso
      const { error: deleteError } = await supabase
        .from("course_reports")
        .delete()
        .eq("course_id", courseId);

      if (deleteError) console.error("Erro ao remover denúncias:", deleteError);

      // Atualizar estado local
      setPendingCourses(prev => prev.filter(c => c.id !== courseId));
      
      // Atualizar os logs de moderação
      await fetchModerationLogs();
      
      // Limpar o motivo de rejeição, se houver
      setRejectionReason(prev => {
        const newReasons = { ...prev };
        delete newReasons[courseId];
        return newReasons;
      });
      
      toast({
        title: "Sucesso",
        description: "Curso aprovado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao aprovar curso:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao aprovar curso",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (courseId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');
      
      const reason = rejectionReason[courseId]?.trim() || "Não especificado";
      if (!reason) {
        toast({
          title: "Atenção",
          description: "Por favor, informe um motivo para a rejeição.",
          variant: "destructive",
        });
        return;
      }

      // Primeiro, obter informações do curso para registro no histórico
      const { data: course, error: fetchError } = await supabase
        .from('courses')
        .select('title, author_id, status')
        .eq('id', courseId)
        .single();

      if (fetchError || !course) throw fetchError || new Error('Curso não encontrado');

      // Atualizar status do curso
      const { error } = await supabase
        .from("courses")
        .update({
          status: "rejected",
          rejection_reason: reason,
          moderated_at: new Date().toISOString(),
          moderated_by: user.id,
        })
        .eq("id", courseId);

      if (error) throw error;

      // Registrar ação de rejeição no histórico
      const logDetails = {
        course_title: course.title,
        author_id: course.author_id,
        previous_status: course.status,
        new_status: 'rejected',
        action_type: 'course_rejection',
        rejection_reason: reason,
        timestamp: new Date().toISOString()
      };

      const { error: logError } = await supabase
        .from("moderation_logs")
        .insert({
          course_id: courseId,
          moderator_id: user.id,
          action: "rejected",
          reason: reason,
          details: JSON.stringify(logDetails)
        });

      if (logError) {
        console.error('Erro ao registrar ação de rejeição:', logError);
        throw new Error('Erro ao registrar ação de moderação');
      }

      // Remover quaisquer denúncias para este curso
      const { error: deleteError } = await supabase
        .from("course_reports")
        .delete()
        .eq("course_id", courseId);

      if (deleteError) console.error("Erro ao remover denúncias:", deleteError);

      // Atualizar estado local
      setPendingCourses(prev => prev.filter(c => c.id !== courseId));
      setReports(prev => prev.filter(r => r.type !== 'course' || (r as CourseReport).course_id !== courseId));
      
      // Limpar o motivo de rejeição
      setRejectionReason(prev => {
        const newReasons = { ...prev };
        delete newReasons[courseId];
        return newReasons;
      });
      
      // Atualizar os logs de moderação
      await fetchModerationLogs();
      
      toast({
        title: "Curso Rejeitado",
        description: "O curso foi rejeitado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao rejeitar curso:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao rejeitar curso.",
        variant: "destructive",
      });
    }
  };

  const handleDismissReport = async (reportId: string) => {
  if (processingReports.has(reportId)) return;
  setProcessingReports(prev => new Set(prev).add(reportId));

  try {
    // Get the current user
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    if (!currentUser) {
      throw new Error('Usuário não autenticado');
    }

    // Find the report to determine its type
    const report = reports.find(r => r.id === reportId);
    if (!report) {
      throw new Error('Denúncia não encontrada');
    }

    let tableName = '';
    let updateData: any = {
      status: 'dismissed',
      admin_id: currentUser.id,
      updated_at: new Date().toISOString()
    };

    // Update the report status in the database based on type
    let error: any = null;

    if (report.type === 'forum') {
      if (report.content_type === 'topic') {
        const result = await supabase
          .from('forum_topic_reports')
          .update(updateData)
          .eq('id', reportId);
        error = result.error;
      } else {
        const result = await supabase
          .from('forum_reports')
          .update(updateData)
          .eq('id', reportId);
        error = result.error;
      }
    } else if (report.type === 'course') {
      const result = await supabase
        .from('course_reports')
        .update(updateData)
        .eq('id', reportId);
      error = result.error;
    }

    if (error) throw error;

    // Remove the report from the UI
    setReports(prev => prev.filter(r => r.id !== reportId));

    toast({
      title: "Denúncia dispensada",
      description: "A denúncia foi marcada como dispensada.",
    });
  } catch (error) {
    console.error('Error dismissing report:', error);
    toast({
      title: "Erro",
      description: error instanceof Error ? error.message : "Não foi possível dispensar a denúncia.",
      variant: "destructive",
    });
  } finally {
    setProcessingReports(prev => {
      const newSet = new Set(prev);
      newSet.delete(reportId);
      return newSet;
    });
  }
};

  const handleApproveEdit = async (editId: string) => {
    try {
      const editData = pendingEdits.find(edit => edit.id === editId);
      if (!editData) throw new Error('Edição não encontrada');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Atualizar o curso com as alterações
      const updateData: any = {
        title: editData.title,
        description: editData.description,
        difficulty_level: editData.difficulty_level,
        status: 'approved',
        updated_at: new Date().toISOString(),
        moderated_at: new Date().toISOString(),
        moderated_by: user.id,
      };

      // Apenas atualiza a thumbnail se houver uma nova
      if (editData.thumbnail_url) {
        updateData.thumbnail_url = editData.thumbnail_url;
      }

      // Atualiza as tags se houver alterações
      if (editData.tags) {
        updateData.tags = editData.tags;
      }

      // Atualiza o tipo de vídeo e URLs se houver alterações
      if (editData.video_type) {
        updateData.video_type = editData.video_type;
      }
      
      if (editData.video_urls) {
        updateData.video_urls = editData.video_urls;
      }
      
      if (editData.content_url) {
        updateData.content_url = editData.content_url;
      }

      const { error: updateError } = await supabase
        .from('courses')
        .update(updateData)
        .eq("id", editData.course_id);

      if (updateError) throw updateError;

      // Atualizar o status da edição para aprovada
      const { error: updateEditError } = await supabase
        .from("course_edits")
        .update({
          status: 'approved',
          moderated_at: new Date().toISOString(),
          moderated_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq("id", editId);

      if (updateEditError) throw updateEditError;

      // Registrar a ação de aprovação no histórico
      const courseTitle = editData.courses?.title || editData.title || 'Curso desconhecido';
      
      const { error: logError } = await supabase
        .from("moderation_logs")
        .insert({
          course_id: editData.course_id,
          moderator_id: user.id,
          action: "approved",
          reason: `Edição de curso "${courseTitle}" aprovada`
        });

      if (logError) {
        console.error('Erro ao registrar ação de aprovação de edição:', logError);
        throw new Error('Erro ao registrar ação de moderação');
      }

      // Atualizar a lista de edições pendentes
      setPendingEdits(prev => prev.filter(e => e.id !== editId));
      
      // Atualizar os logs de moderação
      await fetchModerationLogs();
      
      toast({
        title: "Edição Aprovada",
        description: "As alterações no curso foram aplicadas com sucesso.",
      });
    } catch (error) {
      console.error("Error approving edit:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao aprovar edição.",
        variant: "destructive",
      });
    }
  };

  const handleRejectEdit = async (editId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');
      
      // Obter os dados da edição para registro no histórico
      const { data: editData, error: fetchError } = await supabase
        .from("course_edits")
        .select("*, courses!inner(title, status, author_id)")
        .eq("id", editId)
        .single();

      if (fetchError || !editData || !editData.courses) throw fetchError || new Error('Edição não encontrada');

      // Atualizar o status da edição para rejeitada
      const { error: updateError } = await supabase
        .from("course_edits")
        .update({
          status: 'rejected',
          moderated_at: new Date().toISOString(),
          moderated_by: user.id,
          rejection_reason: 'Rejeitado pelo moderador'
        })
        .eq("id", editId);

      if (updateError) throw updateError;

      // Registrar a ação de rejeição no histórico
      const logDetails = {
        course_title: editData.courses.title,
        author_id: editData.courses.author_id,
        previous_status: editData.courses.status,
        new_status: 'rejected',
        action_type: 'edit_rejection',
        rejection_reason: 'Rejeitado pelo moderador',
        timestamp: new Date().toISOString()
      };

      const { error: logError } = await supabase
        .from("moderation_logs")
        .insert({
          course_id: editData.course_id,
          moderator_id: user.id,
          action: "rejected",
          reason: "Edição de curso rejeitada"
        });

      if (logError) {
        console.error('Erro ao registrar ação de rejeição de edição:', logError);
        throw new Error('Erro ao registrar ação de moderação');
      }

      // Atualizar a lista de edições pendentes
      setPendingEdits(prev => prev.filter(e => e.id !== editId));
      
      // Atualizar os logs de moderação
      await fetchModerationLogs();
      toast({
        title: "Edição Rejeitada",
        description: "A edição do curso foi rejeitada.",
      });
    } catch (error) {
      console.error("Error rejecting edit:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao rejeitar edição.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveForumContent = async (reportId: string, contentId: string, contentType: 'topic' | 'reply') => {
  if (processingReports.has(reportId)) return;
  setProcessingReports(prev => new Set(prev).add(reportId));

  try {
    // Get the current user
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Auth error:', authError);
      throw new Error('Erro de autenticação: ' + authError.message);
    }
    
    if (!currentUser) {
      throw new Error('Usuário não autenticado');
    }

    // First, remove the content from the forum
    const { error: deleteError } = await supabase
      .from(contentType === 'topic' ? 'forum_topics' : 'forum_replies')
      .delete()
      .eq('id', contentId);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      throw new Error('Erro ao remover o conteúdo: ' + deleteError.message);
    }

    // Then update the report status - removed .single() since we don't need the returned data
    const { error: reportError } = await supabase
      .from('forum_reports')
      .update({ 
        status: 'reviewed',
        admin_id: currentUser.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', reportId);

    if (reportError) {
      console.error('Report update error:', reportError);
      throw new Error('Erro ao atualizar a denúncia: ' + reportError.message);
    }

    // Remove the report from the UI
    setReports(prev => prev.filter(r => r.id !== reportId));

    toast({
      title: "Conteúdo removido",
      description: "O conteúdo foi removido do fórum e a denúncia foi resolvida.",
    });
  } catch (error) {
    console.error('Error in handleRemoveForumContent:', {
      error,
      reportId,
      contentId,
      contentType,
      timestamp: new Date().toISOString()
    });
    
    toast({
      title: "Erro",
      description: error instanceof Error ? error.message : "Não foi possível remover o conteúdo do fórum.",
      variant: "destructive",
    });
  } finally {
    setProcessingReports(prev => {
      const newSet = new Set(prev);
      newSet.delete(reportId);
      return newSet;
    });
  }
};

  const handleRemoveContent = async (courseId: string, reportId: string) => {
    if (processingReports.has(reportId)) return;

    setProcessingReports(prev => new Set(prev).add(reportId));

    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Update course status to rejected
      const { error: courseError } = await supabase
        .from("courses")
        .update({
          status: "rejected",
          rejection_reason: "Conteúdo removido devido a denúncia",
          moderated_at: new Date().toISOString(),
          moderated_by: user?.id,
        })
        .eq("id", courseId);

      if (courseError) throw courseError;

      // Update report status to resolved
      const { error: reportError } = await supabase
        .from("course_reports")
        .update({ 
          status: "resolved",
          moderated_at: new Date().toISOString(),
          moderated_by: user?.id
        })
        .eq("id", reportId);

      if (reportError) throw reportError;

      // Log moderation action
      await supabase.from("moderation_logs").insert({
        course_id: courseId,
        moderator_id: user?.id,
        action: "rejected",
        reason: "Conteúdo removido devido a denúncia",
      });

      toast({
        title: "Conteúdo Removido",
        description: "O curso foi rejeitado devido à denúncia.",
      });

      // Update counts in tabs
      fetchData();
    } catch (error) {
      console.error("Error removing content:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover conteúdo.",
        variant: "destructive",
      });
    } finally {
      setProcessingReports(prev => {
        const newSet = new Set(prev);
        newSet.delete(reportId);
        return newSet;
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Painel de Moderação</h1>
          <p className="text-muted-foreground">
            Gerencie conteúdos pendentes e denúncias
          </p>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="pending">
              <Clock className="h-4 w-4 mr-2" />
              Novos Cursos ({pendingCourses.length})
            </TabsTrigger>
            <TabsTrigger value="edits">
              <Edit className="h-4 w-4 mr-2" />
              Edições ({pendingEdits.length})
            </TabsTrigger>
            <TabsTrigger value="reports">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Denúncias ({reports.length})
            </TabsTrigger>
            <TabsTrigger value="logs">
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            {loading ? (
              <div className="text-center py-12">Carregando...</div>
            ) : pendingCourses.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  Nenhum curso pendente de aprovação.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingCourses.map((course) => (
                  <Card key={course.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle>{course.title}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            Por: {course.profiles?.full_name || course.profiles?.username}
                          </p>
                        </div>
                        <Badge variant="secondary">Pendente</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p>{course.description}</p>
                      
                      {course.thumbnail_url && (
                        <img
                          src={course.thumbnail_url}
                          alt={course.title}
                          className="w-full h-48 object-cover rounded-md"
                        />
                      )}

                      <div className="flex gap-2">
                        {course.video_type === 'external' && course.content_url && (
                          <a
                            href={course.content_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            Ver Conteúdo →
                          </a>
                        )}
                        {(course.video_type === 'cloudinary_single' || course.video_type === 'cloudinary_playlist') && (
                          <a
                            href={`/course/${course.id}`}
                            className="text-sm text-primary hover:underline"
                          >
                            Ver Conteúdo →
                          </a>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Textarea
                          placeholder="Motivo da rejeição (opcional)"
                          value={rejectionReason[course.id] || ""}
                          onChange={(e) =>
                            setRejectionReason({
                              ...rejectionReason,
                              [course.id]: e.target.value,
                            })
                          }
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApprove(course.id)}
                            className="flex-1"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Aprovar
                          </Button>
                          <Button
                            onClick={() => handleReject(course.id)}
                            variant="destructive"
                            className="flex-1"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Rejeitar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="edits" className="mt-6">
            {loading ? (
              <div className="text-center py-12">Carregando...</div>
            ) : pendingEdits.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  Nenhuma edição pendente de aprovação.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingEdits.map((edit) => (
                  <Card key={edit.id} className="overflow-hidden">
                    <CardHeader className="bg-muted/50">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{edit.title}</h3>
                            <Badge variant="outline" className="text-xs">
                              ID: {edit.course_id}
                            </Badge>
                          </div>
                          <div className="mt-1 text-sm text-muted-foreground">
                            <p>Editado por: <span className="font-medium">
                              {edit.profiles?.full_name || edit.profiles?.username || 
                               edit.author_name || edit.author_username || 'Usuário desconhecido'}
                            </span></p>
                            <p>Data da edição: {new Date(edit.created_at).toLocaleString('pt-BR')}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="secondary" className="whitespace-nowrap">
                            <Edit className="h-3 w-3 mr-1" />
                            Edição Pendente
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                      {/* Seção de Dados do Curso Original */}
                      <div className="space-y-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
                        <h3 className="font-semibold text-blue-300 flex items-center gap-2">
                          <Info className="h-4 w-4" />
                          Dados Atuais do Curso
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-400">Título Atual</h4>
                            <p className="font-medium text-gray-100">{edit.course_title || 'Não especificado'}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-400">Dificuldade Atual</h4>
                            <p className="font-medium text-gray-100">
                              {(() => {
                                const level = edit.original_difficulty_level?.toLowerCase();
                                switch (level) {
                                  case 'iniciante':
                                    return 'Iniciante';
                                  case 'intermediario':
                                    return 'Intermediário';
                                  case 'avancado':
                                    return 'Avançado';
                                  default:
                                    return 'Não especificada';
                                }
                              })()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Seção de Alterações Propostas */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Alterações Propostas</h3>
                        
                        {/* Título */}
                        <DiffField 
                          label="Título" 
                          oldValue={edit.course_title} 
                          newValue={edit.title} 
                        />
                        
                        {/* Descrição */}
                        <DiffField 
                          label="Descrição" 
                          oldValue={edit.original_description} 
                          newValue={edit.description} 
                        />
                        
                        {/* Dificuldade */}
                        <DiffField 
                          label="Nível de Dificuldade" 
                          oldValue={
                            edit.original_difficulty_level === 'beginner' ? 'Iniciante' :
                            edit.original_difficulty_level === 'intermediate' ? 'Intermediário' :
                            edit.original_difficulty_level === 'advanced' ? 'Avançado' :
                            'Não especificada'
                          }
                          newValue={
                            edit.difficulty_level === 'beginner' ? 'Iniciante' :
                            edit.difficulty_level === 'intermediate' ? 'Intermediário' :
                            edit.difficulty_level === 'advanced' ? 'Avançado' :
                            'Não especificada'
                          }
                        />

                        {/* Tags */}
                        <DiffField 
                          label="Tags" 
                          oldValue={edit.original_tags?.join(', ') || 'Nenhuma'} 
                          newValue={edit.tags?.join(', ') || 'Nenhuma'}
                        />

                        {/* Thumbnail */}
                        <div className="space-y-2">
                          <h4 className="font-medium">Thumbnail</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-400 mb-1">Atual:</p>
                              {edit.original_thumbnail_url ? (
                                <img 
                                  src={edit.original_thumbnail_url} 
                                  alt="Thumbnail atual"
                                  className="w-full h-auto rounded border border-gray-600"
                                />
                              ) : (
                                <div className="bg-gray-800 rounded border border-dashed border-gray-600 p-4 text-center text-gray-400">
                                  Nenhuma thumbnail definida
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm text-gray-400 mb-1">Nova:</p>
                              {edit.thumbnail_url ? (
                                <img 
                                  src={edit.thumbnail_url} 
                                  alt="Nova thumbnail"
                                  className="w-full h-auto rounded border border-gray-600"
                                />
                              ) : (
                                <div className="bg-gray-800 rounded border border-dashed border-gray-600 p-4 text-center text-gray-400">
                                  Nenhuma nova thumbnail
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* URL do Conteúdo */}
                        <DiffField 
                          label="URL do Conteúdo" 
                          oldValue={edit.content_url || 'Não especificada'}
                          newValue={edit.content_url || 'Não especificada'}
                        />

                        {/* Categoria */}
                        <DiffField 
                          label="Categoria" 
                          oldValue={edit.category_id || 'Não especificada'}
                          newValue={edit.category_id || 'Não especificada'}
                        />

                        {/* Conteúdo de Vídeo */}
                        <div className="space-y-4">
                          <h4 className="font-medium">Conteúdo de Vídeo</h4>
                        
                        {/* Tipo de Vídeo */}
                        <DiffField 
                          label="Tipo de Vídeo" 
                          oldValue={
                            edit.original_video_type === 'external' ? 'Link Externo' : 
                            edit.original_video_type === 'cloudinary_single' ? 'Vídeo Único' :
                            edit.original_video_type === 'cloudinary_playlist' ? 'Playlist de Vídeos' :
                            'Não especificado'
                          }
                          newValue={
                            edit.video_type === 'external' ? 'Link Externo' : 
                            edit.video_type === 'cloudinary_single' ? 'Vídeo Único' :
                            edit.video_type === 'cloudinary_playlist' ? 'Playlist de Vídeos' :
                            'Não especificado'
                          }
                        />

                        {/* Visualização do Vídeo */}
                        {edit.video_type === 'external' && edit.content_url && (
                          <div className="space-y-2">
                            <h4 className="font-medium text-gray-300">Visualização do Vídeo</h4>
                            <div className="bg-black rounded-lg overflow-hidden w-full max-w-2xl mx-auto">
                              {isYoutubeUrl(edit.content_url) ? (
                                <div className="aspect-video">
                                  <iframe
                                    src={getYoutubeEmbedUrl(edit.content_url)}
                                    className="w-full h-full"
                                    allowFullScreen
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    title={`Vídeo: ${edit.title}`}
                                  />
                                </div>
                              ) : (
                                <div className="aspect-video">
                                  <iframe
                                    src={edit.content_url}
                                    className="w-full h-full"
                                    allowFullScreen
                                    title={`Vídeo: ${edit.title}`}
                                  />
                                </div>
                              )}
                            </div>
                            <a 
                              href={edit.content_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-400 hover:text-blue-300 hover:underline inline-block mt-2"
                            >
                              Abrir vídeo em nova aba →
                            </a>
                          </div>
                        )}

                        {(edit.video_type === 'cloudinary_single' || edit.video_type === 'cloudinary_playlist') && (
                          <div className="space-y-4">
                            <h4 className="font-medium text-gray-300">
                              {edit.video_type === 'cloudinary_single' ? 'Vídeo' : 'Playlist de Vídeos'}
                            </h4>
                            
                            {edit.video_type === 'cloudinary_single' ? (
                              <div className="space-y-2">
                                <div className="bg-black rounded-lg overflow-hidden w-full max-w-2xl mx-auto">
                                  {edit.content_url || (edit.video_urls && edit.video_urls[0]) ? (
                                    <>
                                      <div className="relative aspect-video bg-gray-900">
                                        <video 
                                          key={`video-${edit.id}`}
                                          width="100%"
                                          height="100%"
                                          controls
                                          preload="metadata"
                                          className="w-full h-full object-contain"
                                          controlsList="nodownload"
                                          disablePictureInPicture
                                        >
                                          <source src={edit.content_url || (edit.video_urls && edit.video_urls[0])} type="video/mp4" />
                                          Seu navegador não suporta a reprodução de vídeos.
                                        </video>
                                        <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                                          <a 
                                            href={(() => {
                                              const videoUrl = edit.content_url || (edit.video_urls && edit.video_urls[0]);
                                              if (isYoutubeUrl(videoUrl)) {
                                                return isYoutubePlaylist(videoUrl) 
                                                  ? `https://www.youtube.com/playlist?list=${videoUrl.match(/[&?]list=([^&]+)/)?.[1] || ''}`
                                                  : videoUrl;
                                              }
                                              return videoUrl;
                                            })()}
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="bg-black/70 hover:bg-black/90 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                                            onClick={(e) => {
                                              const videoUrl = edit.content_url || (edit.video_urls && edit.video_urls[0]);
                                              if (!videoUrl) {
                                                e.preventDefault();
                                                console.error('Nenhuma URL de vídeo disponível');
                                              }
                                            }}
                                          >
                                            <ExternalLink className="h-3 w-3" />
                                            Abrir em nova aba
                                          </a>
                                        </div>
                                      </div>
                                      <div className="p-2 bg-gray-900 text-xs text-gray-400 overflow-x-auto">
                                        <p className="font-mono break-all">{edit.content_url || (edit.video_urls && edit.video_urls[0])}</p>
                                      </div>
                                    </>
                                  ) : (
                                    <div className="p-6 text-center text-gray-400 space-y-2">
                                      <AlertTriangle className="h-8 w-8 mx-auto text-yellow-500" />
                                      <p>URL do vídeo não disponível</p>
                                      <div className="text-xs bg-gray-900 p-3 rounded-md text-left mt-2">
                                        <pre className="whitespace-pre-wrap">
                                          {JSON.stringify({
                                            video_type: edit.video_type,
                                            has_content_url: !!edit.content_url,
                                            content_url: edit.content_url,
                                            video_urls: edit.video_urls,
                                            has_video_urls: !!edit.video_urls,
                                            first_video_url: edit.video_urls?.[0]
                                          }, null, 2)}
                                        </pre>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-6">
                                {(edit.video_urls || []).map((url, index) => (
                                  <div key={index} className="space-y-2">
                                    <p className="text-sm font-medium text-gray-300">Vídeo {index + 1}:</p>
                                    <div className="space-y-2">
                                      <div className="bg-black rounded-lg overflow-hidden w-full max-w-2xl mx-auto">
                                        <div className="relative aspect-video bg-gray-900">
                                          <video 
                                            key={`video-${edit.id}-${index}`}
                                            width="100%"
                                            height="100%"
                                            controls
                                            preload="metadata"
                                            className="w-full h-full object-contain"
                                            controlsList="nodownload"
                                            disablePictureInPicture
                                          >
                                            <source 
                                            src={url} 
                                            type="video/mp4" 
                                            onError={(e) => {
                                              console.error('Erro ao carregar o vídeo:', url, e);
                                              const target = e.target as HTMLSourceElement;
                                              const video = target.parentElement as HTMLVideoElement;
                                              if (video) {
                                                const errorDiv = document.createElement('div');
                                                errorDiv.className = 'p-4 text-red-400 bg-red-900/50 rounded';
                                                errorDiv.textContent = 'Erro ao carregar o vídeo. Tente abrir em uma nova aba.';
                                                video.parentNode?.insertBefore(errorDiv, video.nextSibling);
                                                video.style.display = 'none';
                                              }
                                            }}
                                          />
                                            Seu navegador não suporta a reprodução de vídeos.
                                          </video>
                                          <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                                            <a 
                                              href={url} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="bg-black/70 hover:bg-black/90 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                                            >
                                              <ExternalLink className="h-3 w-3" />
                                              Abrir em nova aba
                                            </a>
                                          </div>
                                        </div>
                                        <div className="p-2 bg-gray-800 text-xs text-gray-400 overflow-x-auto">
                                          <p className="font-mono break-all">
                                            <a 
                                              href={url} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="text-blue-400 hover:underline"
                                            >
                                              {url}
                                            </a>
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                        <Button
                          onClick={() => handleApproveEdit(edit.id)}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Aprovar Edição
                        </Button>
                        <Button
                          onClick={() => handleRejectEdit(edit.id)}
                          variant="destructive"
                          className="flex-1"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Rejeitar Edição
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            {loading ? (
              <div className="text-center py-12">Carregando...</div>
            ) : reports.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  Nenhuma denúncia pendente.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <Card key={`${report.type}-${report.id}`}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {report.type === 'course' ? 'Curso' : 'Fórum'}
                            </Badge>
                            <CardTitle>
                              {report.type === 'course' 
                              ? (report as CourseReport).course?.title 
                              : (report as ForumReport).content?.topic?.title || 'Tópico sem título'}
                            </CardTitle>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Denunciado por: {report.reporter?.full_name || report.reporter?.username || 'Anônimo'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {new Date(report.created_at).toLocaleString('pt-BR')}
                          </span>
                          <Link 
                            to={
                              report.type === 'course' 
                                ? `/course/${(report as CourseReport).course_id}`
                                : report.type === 'forum' && report.content?.topic
                                  ? `/forum/${report.content.topic.id}`
                                  : '#'
                            }
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-gray-900 dark:hover:bg-gray-900 h-8 px-3 py-1" 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Ver {report.type === 'course' ? 'Curso' : 'Tópico'}
                          </Link>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <p className="font-medium">Motivo da denúncia:</p>
                        <div className="text-sm text-muted-foreground bg-gray-800 dark:bg-gray-800 p-3 rounded">
                          {report.reason}
                        </div>
                      </div>

                      {report.type === 'forum' && report.content && (
                        <div className="mt-2 p-3 bg-gray-800 dark:bg-gray-800/50 rounded border border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-medium mb-1">Conteúdo denunciado:</p>
                          <div className="text-sm text-muted-foreground">
                            {report.content.content || 'Nenhum conteúdo disponível'}
                          </div>
                          {report.content.author && (
                            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                              Postado por: {report.content.author.full_name || report.content.author.username || 'Usuário'}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => handleDismissReport(report.id)}
                          variant="outline"
                          size="sm"
                          disabled={processingReports.has(report.id)}
                        >
                          {processingReports.has(report.id) ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <XCircle className="h-4 w-4 mr-2" />
                          )}
                          Dispensar
                        </Button>
                      <Button
                        onClick={() => {
                          if (report.type === 'forum' && report.content_id) {
                            if (confirm('Tem certeza que deseja remover este conteúdo do fórum?')) {
                              handleRemoveForumContent(
                                report.id, 
                                report.content_id, 
                                (report as ForumReport).content_type
                              );
                            }
                          } else if (report.type === 'course') {
                            handleRemoveContent((report as CourseReport).course_id, report.id);
                          }
                        }}
                        variant="destructive"
                        size="sm"
                        disabled={processingReports.has(report.id)}
                      >
                        {processingReports.has(report.id) ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        Remover Conteúdo
                      </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="logs" className="mt-6">
            {loading ? (
              <div className="text-center py-12">Carregando...</div>
            ) : moderationLogs.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  Nenhum histórico de moderação.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {moderationLogs.map((log) => (
                  <Card key={log.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <div>
                            <p className="font-medium">
                              {log.course?.title || 'Curso removido'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {log.moderator ? (
                                `Moderado por: ${log.moderator.full_name || log.moderator.username || 'Usuário desconhecido'}`
                              ) : (
                                log.moderator_id && `Moderado por: ID ${log.moderator_id}`
                              )}
                            </p>
                          </div>
                          <p className="mt-2">
                            <span className="font-medium">Ação:</span> {log.action}
                            {log.reason && (
                              <span> - {log.reason}</span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(log.created_at).toLocaleString("pt-BR")}
                          </p>
                        </div>
                        <Badge variant={log.action === 'approved' ? 'default' : log.action === 'rejected' ? 'destructive' : 'outline'}>
                          {log.action === 'approved' ? 'Aprovado' : log.action === 'rejected' ? 'Rejeitado' : 'Pendente'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
