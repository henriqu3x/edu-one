import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { ArrowLeft, Link as LinkIcon, Upload } from "lucide-react";
import { CategoryIcon } from "@/lib/icons";
import VideoUploadWidget from "@/components/VideoUploadWidget";

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface UploadedVideo {
  public_id: string;
  secure_url: string;
  thumbnail_url?: string;
  duration?: number;
  format: string;
  bytes: number;
}

export default function CourseEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [videoType, setVideoType] = useState<'external' | 'cloudinary_single' | 'cloudinary_playlist'>('external');
  const [uploadedVideos, setUploadedVideos] = useState<UploadedVideo[]>([]);
  const [course, setCourse] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    difficulty_level: "iniciante",
    content_url: "",
    thumbnail_url: "",
    tags: "",
  });

  useEffect(() => {
    checkAuth();
    fetchCategories();
    if (id) {
      fetchCourse();
    }
  }, [id]);

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Você precisa estar logado para editar um curso");
      navigate("/auth");
    }
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase.from("categories").select("*").order("name");
    if (error) {
      console.error("Error fetching categories:", error);
    } else {
      setCategories(data || []);
    }
  };

  const fetchCourse = async () => {
    setFetchLoading(true);
    try {
      const { data: courseData, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      // Check if user is the author and course is approved
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || courseData.author_id !== user.id || courseData.status !== 'approved') {
        toast.error("Você não tem permissão para editar este curso");
        navigate(`/course/${id}`);
        return;
      }

      // Check if there's already a pending edit
      const { data: pendingEdit } = await supabase
        .from("course_edits")
        .select("*")
        .eq("course_id", id)
        .eq("status", "pending")
        .single();

      if (pendingEdit) {
        toast.error("Já existe uma edição pendente para este curso");
        navigate(`/course/${id}`);
        return;
      }

      setCourse(courseData);

      // Populate form data
      setFormData({
        title: courseData.title,
        description: courseData.description,
        category_id: courseData.category_id || "",
        difficulty_level: courseData.difficulty_level,
        content_url: courseData.content_url || "",
        thumbnail_url: courseData.thumbnail_url || "",
        tags: courseData.tags ? courseData.tags.join(", ") : "",
      });

      setVideoType(
        (courseData.video_type === 'cloudinary_single' || 
         courseData.video_type === 'cloudinary_playlist') 
          ? courseData.video_type 
          : 'external'
      );

      // Populate uploaded videos if Cloudinary
      if (courseData.video_type === 'cloudinary_single' || courseData.video_type === 'cloudinary_playlist') {
        if (courseData.video_urls && courseData.video_urls.length > 0) {
          setUploadedVideos(courseData.video_urls.map((url: string, index: number) => ({
            public_id: `video_${index}`,
            secure_url: url,
            thumbnail_url: null,
            duration: null,
            format: 'mp4',
            bytes: 0
          })));
        }
      }
    } catch (error: any) {
      console.error("Error fetching course:", error);
      toast.error("Erro ao carregar curso");
      navigate("/404");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Validate video requirements
      if (videoType === 'external' && !formData.content_url.trim()) {
        throw new Error("Link do conteúdo é obrigatório para vídeos externos");
      }

      if ((videoType === 'cloudinary_single' || videoType === 'cloudinary_playlist') && uploadedVideos.length === 0) {
        throw new Error("Pelo menos um vídeo deve ser enviado");
      }

      if (videoType === 'cloudinary_single' && uploadedVideos.length > 1) {
        throw new Error("Vídeo único permite apenas um arquivo");
      }

      const tags = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      // Prepare video data
      let contentUrl = formData.content_url;
      let videoUrls = null;

      if (videoType === 'cloudinary_single' || videoType === 'cloudinary_playlist') {
        contentUrl = null; // Not used for Cloudinary videos
        videoUrls = uploadedVideos.map(video => video.secure_url);
      }

      const { data, error } = await supabase
        .from("course_edits")
        .insert({
          course_id: id,
          author_id: user.id,
          title: formData.title,
          description: formData.description,
          category_id: formData.category_id || null,
          difficulty_level: formData.difficulty_level,
          content_url: contentUrl,
          thumbnail_url: formData.thumbnail_url || null,
          tags: tags.length > 0 ? tags : null,
          video_type: videoType,
          video_urls: videoUrls,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Edição enviada para moderação!");
      navigate(`/course/${id}`);
    } catch (error: any) {
      console.error("Error creating edit:", error);
      toast.error(error.message || "Erro ao enviar edição");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-8 text-center">Carregando...</div>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 max-w-3xl">
        <Button
          variant="ghost"
          onClick={() => navigate(`/course/${id}`)}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao Curso
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Editar Curso</CardTitle>
            <p className="text-muted-foreground">
              Suas alterações serão enviadas para moderação antes de serem aplicadas.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título do Curso *</Label>
                <Input
                  id="title"
                  placeholder="Ex: Introdução ao React"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o que os alunos aprenderão..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                  rows={4}
                  maxLength={500}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <CategoryIcon iconName={category.icon} className="h-4 w-4" />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Nível de Dificuldade</Label>
                  <Select
                    value={formData.difficulty_level}
                    onValueChange={(value) =>
                      setFormData({ ...formData, difficulty_level: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iniciante">Iniciante</SelectItem>
                      <SelectItem value="intermediario">Intermediário</SelectItem>
                      <SelectItem value="avancado">Avançado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Video Type Selection */}
              <div className="space-y-4">
                <Label>Tipo de Vídeo *</Label>
                <RadioGroup
                  value={videoType}
                  onValueChange={(value: 'external' | 'cloudinary_single' | 'cloudinary_playlist') =>
                    setVideoType(value)
                  }
                  className="grid grid-cols-1 gap-4"
                >
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50">
                    <RadioGroupItem value="external" id="external" />
                    <div className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4" />
                      <Label htmlFor="external" className="cursor-pointer">
                        Link Externo (YouTube, Vimeo, etc.)
                      </Label>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50">
                    <RadioGroupItem value="cloudinary_single" id="cloudinary_single" />
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      <Label htmlFor="cloudinary_single" className="cursor-pointer">
                        Vídeo Único (Upload)
                      </Label>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50">
                    <RadioGroupItem value="cloudinary_playlist" id="cloudinary_playlist" />
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      <Label htmlFor="cloudinary_playlist" className="cursor-pointer">
                        Múltiplos Vídeos (Playlist)
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* External Link Input */}
              {videoType === 'external' && (
                <div className="space-y-2">
                  <Label htmlFor="content_url">Link do Conteúdo *</Label>
                  <Input
                    id="content_url"
                    type="url"
                    placeholder="https://youtube.com/..."
                    value={formData.content_url}
                    onChange={(e) =>
                      setFormData({ ...formData, content_url: e.target.value })
                    }
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Link para vídeo, playlist ou artigo
                  </p>
                </div>
              )}

              {/* Cloudinary Video Upload */}
              {(videoType === 'cloudinary_single' || videoType === 'cloudinary_playlist') && (
                <VideoUploadWidget
                  videos={uploadedVideos}
                  onVideosChange={setUploadedVideos}
                  maxVideos={videoType === 'cloudinary_single' ? 1 : 10}
                />
              )}

              <div className="space-y-2">
                <Label htmlFor="thumbnail_url">URL da Thumbnail (opcional)</Label>
                <Input
                  id="thumbnail_url"
                  type="url"
                  placeholder="https://..."
                  value={formData.thumbnail_url}
                  onChange={(e) =>
                    setFormData({ ...formData, thumbnail_url: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                <Input
                  id="tags"
                  placeholder="react, javascript, frontend"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/course/${id}`)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Enviando..." : "Enviar para Moderação"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
