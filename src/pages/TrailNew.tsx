import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Navbar } from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
}

export default function TrailNew() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        toast({ title: "Faça login para criar trilhas", variant: "destructive" });
        navigate("/auth");
      }
      setUser(user);
    });

    fetchCourses();

    if (id) {
      fetchTrail();
    }
  }, [id]);

  const fetchCourses = async () => {
    const { data } = await supabase
      .from("courses")
      .select("id, title, description")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (data) setAvailableCourses(data);
  };

  const fetchTrail = async () => {
    const { data: trailData } = await supabase
      .from("learning_trails")
      .select()
      .eq("id", id)
      .single();

    if (trailData) {
      setTitle(trailData.title);
      setDescription(trailData.description || "");

      const { data: coursesData } = await supabase
        .from("trail_courses")
        .select("course_id")
        .eq("trail_id", id);

      if (coursesData) {
        setSelectedCourses(coursesData.map(tc => tc.course_id));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    if (id) {
      // Update
      const { error } = await supabase
        .from("learning_trails")
        .update({ title, description })
        .eq("id", id);

      if (error) {
        toast({ title: "Erro ao atualizar trilha", variant: "destructive" });
        setLoading(false);
        return;
      }

      // Delete existing courses
      await supabase.from("trail_courses").delete().eq("trail_id", id);

      // Add new courses
      if (selectedCourses.length > 0) {
        const coursesData = selectedCourses.map((courseId, index) => ({
          trail_id: id,
          course_id: courseId,
          order_index: index,
        }));

        await supabase.from("trail_courses").insert(coursesData);
      }

      toast({ title: "Trilha atualizada!" });
      navigate(`/trail/${id}`);
    } else {
      // Create
      const { data: trailData, error } = await supabase
        .from("learning_trails")
        .insert({ title, description, creator_id: user.id })
        .select()
        .single();

      if (error) {
        toast({ title: "Erro ao criar trilha", variant: "destructive" });
        setLoading(false);
        return;
      }

      // Add courses
      if (selectedCourses.length > 0) {
        const coursesData = selectedCourses.map((courseId, index) => ({
          trail_id: trailData.id,
          course_id: courseId,
          order_index: index,
        }));

        await supabase.from("trail_courses").insert(coursesData);
      }

      toast({ title: "Trilha criada!" });
      navigate(`/trail/${trailData.id}`);
    }

    setLoading(false);
  };

  const toggleCourse = (courseId: string) => {
    setSelectedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 max-w-3xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">
              {id ? "Editar Trilha" : "Criar Nova Trilha"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título*</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Ex: Desenvolvimento Web Completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva o objetivo desta trilha de aprendizado..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Cursos da Trilha ({selectedCourses.length})</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Selecione os cursos e organize a sequência de aprendizado
                </p>
                {availableCourses.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhum curso disponível
                  </p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto border rounded-md p-4">
                    {availableCourses.map((course) => (
                      <div key={course.id} className="flex items-start gap-2 p-2 hover:bg-accent rounded">
                        <Checkbox
                          id={course.id}
                          checked={selectedCourses.includes(course.id)}
                          onCheckedChange={() => toggleCourse(course.id)}
                        />
                        <label htmlFor={course.id} className="flex-1 cursor-pointer">
                          <p className="font-medium">{course.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {course.description}
                          </p>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                {loading ? "Salvando..." : id ? "Atualizar Trilha" : "Criar Trilha"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
