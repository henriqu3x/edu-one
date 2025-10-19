import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react";

export default function Moderation() {
  const [pendingCourses, setPendingCourses] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [moderationLogs, setModerationLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState<{ [key: string]: string }>({});
  const [processingReports, setProcessingReports] = useState<Set<string>>(new Set());

  const { toast } = useToast();

  useEffect(() => {
    checkModeratorAccess();
    fetchData();
  }, []);

  const checkModeratorAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = "/auth";
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const isModerator = roles?.some(r => r.role === "moderator" || r.role === "admin");
    
    if (!isModerator) {
      toast({
        title: "Acesso Negado",
        description: "Você não tem permissão para acessar esta página.",
        variant: "destructive",
      });
      window.location.href = "/";
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch pending courses
      const { data: courses } = await supabase
        .from("courses")
        .select("*, profiles!courses_author_id_fkey(full_name, username, avatar_url)")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      // Fetch reports - only pending reports
      const { data: reportsData } = await supabase
        .from("course_reports")
        .select("*, courses(title), profiles!course_reports_reporter_id_fkey(username, full_name)")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      // Fetch moderation logs
      const { data: logs, error: logsError } = await supabase
        .from("moderation_logs")
        .select("*, courses(title)")
        .order("created_at", { ascending: false })
        .limit(20);



      if (courses) setPendingCourses(courses);
      if (reportsData) setReports(reportsData);
      if (logs) setModerationLogs(logs);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (courseId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("courses")
        .update({
          status: "approved",
          moderated_at: new Date().toISOString(),
          moderated_by: user?.id,
        })
        .eq("id", courseId);

      if (error) throw error;

      // Log moderation action
      await supabase.from("moderation_logs").insert({
        course_id: courseId,
        moderator_id: user?.id,
        action: "approved",
      });

      // Delete any reports for this course
      const { error: deleteError } = await supabase
        .from("course_reports")
        .delete()
        .eq("course_id", courseId);

      if (deleteError) throw deleteError;

      // Remove course from local state immediately
      setPendingCourses(prev => prev.filter(course => course.id !== courseId));

      // Remove reports for this course from local state
      setReports(prev => prev.filter(report => report.course_id !== courseId));

      toast({
        title: "Curso Aprovado",
        description: "O curso foi aprovado com sucesso.",
      });

      fetchData();
    } catch (error) {
      console.error("Error approving course:", error);
      toast({
        title: "Erro",
        description: "Erro ao aprovar curso.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (courseId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const reason = rejectionReason[courseId] || "Não especificado";

      const { error } = await supabase
        .from("courses")
        .update({
          status: "rejected",
          rejection_reason: reason,
          moderated_at: new Date().toISOString(),
          moderated_by: user?.id,
        })
        .eq("id", courseId);

      if (error) throw error;

      // Log moderation action
      await supabase.from("moderation_logs").insert({
        course_id: courseId,
        moderator_id: user?.id,
        action: "rejected",
        reason,
      });

      // Delete any reports for this course
      const { error: deleteError } = await supabase
        .from("course_reports")
        .delete()
        .eq("course_id", courseId);

      if (deleteError) throw deleteError;

      // Remove course from local state immediately
      setPendingCourses(prev => prev.filter(course => course.id !== courseId));

      // Remove reports for this course from local state
      setReports(prev => prev.filter(report => report.course_id !== courseId));

      toast({
        title: "Curso Rejeitado",
        description: "O curso foi rejeitado.",
      });

      fetchData();
      setRejectionReason({ ...rejectionReason, [courseId]: "" });
    } catch (error) {
      console.error("Error rejecting course:", error);
      toast({
        title: "Erro",
        description: "Erro ao rejeitar curso.",
        variant: "destructive",
      });
    }
  };

  const handleDismissReport = async (reportId: string) => {
    if (processingReports.has(reportId)) return;

    setProcessingReports(prev => new Set(prev).add(reportId));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("course_reports")
        .update({ 
          status: "dismissed",
          moderated_at: new Date().toISOString(),
          moderated_by: user?.id
        })
        .eq("id", reportId);

      if (error) throw error;

      toast({
        title: "Denúncia Dispensada",
        description: "A denúncia foi dispensada com sucesso.",
      });

      // Update counts in tabs
      fetchData();
    } catch (error) {
      console.error("Error dismissing report:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao dispensar denúncia.",
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
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="pending">
              <Clock className="h-4 w-4 mr-2" />
              Pendentes ({pendingCourses.length})
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
                        <a
                          href={course.content_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          Ver Conteúdo →
                        </a>
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

          <TabsContent value="reports" className="mt-6">
            {loading ? (
              <div className="text-center py-12">Carregando...</div>
            ) : reports.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  Nenhuma denúncia registrada.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <Card key={report.id}>
                    <CardHeader>
                      <CardTitle>{report.courses?.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Denunciado por: {report.profiles?.full_name || report.profiles?.username}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        <strong>Motivo:</strong> {report.reason}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(report.created_at).toLocaleString("pt-BR")}
                      </p>
                      <div className="flex gap-2 mt-4">
                        <Button
                          onClick={() => handleDismissReport(report.id)}
                          variant="outline"
                          size="sm"
                          disabled={processingReports.has(report.id)}
                        >
                          {processingReports.has(report.id) ? "Processando..." : "Dispensar Denúncia"}
                        </Button>
                        <Button
                          onClick={() => handleRemoveContent(report.course_id, report.id)}
                          variant="destructive"
                          size="sm"
                          disabled={processingReports.has(report.id)}
                        >
                          {processingReports.has(report.id) ? "Processando..." : "Remover Conteúdo"}
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
                          <p className="font-medium">{log.courses?.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Moderado por: {log.moderator_id}
                          </p>
                          {log.reason && (
                            <p className="text-sm mt-1">Motivo: {log.reason}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(log.created_at).toLocaleString("pt-BR")}
                          </p>
                        </div>
                        <Badge
                          variant={log.action === "approved" ? "default" : "destructive"}
                        >
                          {log.action === "approved" ? "Aprovado" : "Rejeitado"}
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
