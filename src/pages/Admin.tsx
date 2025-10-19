import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Users, BookOpen, Shield, TrendingUp } from "lucide-react";

export default function Admin() {
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    pendingCourses: 0,
    totalViews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    icon: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
    fetchData();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = "/auth";
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const isAdmin = roles?.some(r => r.role === "admin");
    
    if (!isAdmin) {
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
      console.log("Fetching data...");

      // Fetch all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }

      console.log("Profiles fetched:", profilesData?.length || 0);

      // Fetch user roles separately
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) {
        console.error("Error fetching roles:", rolesError);
        throw rolesError;
      }

      console.log("Roles fetched:", rolesData?.length || 0);

      // Combine profiles with their roles
      const usersWithRoles = profilesData?.map(profile => ({
        ...profile,
        user_roles: rolesData?.filter(role => role.user_id === profile.id) || []
      })) || [];

      console.log("Users with roles:", usersWithRoles.length);

      // Get total users count (all profiles, not just those with roles)
      const { count: totalUsersCount, error: countError } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      if (countError) {
        console.error("Error counting users:", countError);
      }

      // Fetch all courses
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("*, profiles!courses_author_id_fkey(username, full_name)")
        .order("created_at", { ascending: false });

      if (coursesError) {
        console.error("Error fetching courses:", coursesError);
      }

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (categoriesError) {
        console.error("Error fetching categories:", categoriesError);
      }

      // Calculate stats
      const totalViews = coursesData?.reduce((sum, course) => sum + (course.view_count || 0), 0) || 0;
      const pendingCount = coursesData?.filter(c => c.status === "pending").length || 0;

      setStats({
        totalUsers: totalUsersCount || 0,
        totalCourses: coursesData?.length || 0,
        pendingCourses: pendingCount,
        totalViews,
      });

      setUsers(usersWithRoles);
      if (coursesData) setCourses(coursesData);
      if (categoriesData) setCategories(categoriesData);

      console.log("Data fetch completed");
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId: string, role: string) => {
    try {
      // Remove existing role
      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      // Add new role if not 'user'
      if (role !== "user") {
        await supabase
          .from("user_roles")
          .insert([{ user_id: userId, role: role as any }]);
      }

      toast({
        title: "Sucesso",
        description: "Permissão atualizada com sucesso.",
      });

      fetchData();
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar permissão.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    const confirmed = window.confirm("Tem certeza que deseja excluir este curso?");
    if (!confirmed) return;

    try {
      console.log("Attempting to delete course:", courseId);

      // First, delete related records that might prevent deletion
      console.log("Deleting comments...");
      const { error: commentsError } = await supabase
        .from("comments")
        .delete()
        .eq("course_id", courseId);
      if (commentsError) console.error("Comments deletion error:", commentsError);

      console.log("Deleting course ratings...");
      const { error: ratingsError } = await supabase
        .from("course_ratings")
        .delete()
        .eq("course_id", courseId);
      if (ratingsError) console.error("Ratings deletion error:", ratingsError);

      console.log("Deleting course saves...");
      const { error: savesError } = await supabase
        .from("course_saves")
        .delete()
        .eq("course_id", courseId);
      if (savesError) console.error("Saves deletion error:", savesError);

      console.log("Deleting trail courses...");
      const { error: trailError } = await supabase
        .from("trail_courses")
        .delete()
        .eq("course_id", courseId);
      if (trailError) console.error("Trail courses deletion error:", trailError);

      console.log("Deleting course reports...");
      const { error: reportsError } = await supabase
        .from("course_reports")
        .delete()
        .eq("course_id", courseId);
      if (reportsError) console.error("Reports deletion error:", reportsError);

      console.log("Deleting course likes...");
      const { error: likesError } = await supabase
        .from("course_likes")
        .delete()
        .eq("course_id", courseId);
      if (likesError) console.error("Likes deletion error:", likesError);

      console.log("Deleting course views...");
      const { error: viewsError } = await supabase
        .from("course_views")
        .delete()
        .eq("course_id", courseId);
      if (viewsError) console.error("Views deletion error:", viewsError);

      console.log("Deleting moderation logs...");
      const { error: logsError } = await supabase
        .from("moderation_logs")
        .delete()
        .eq("course_id", courseId);
      if (logsError) console.error("Logs deletion error:", logsError);

      // Now delete the course
      console.log("Deleting the course itself...");
      const { error, data } = await supabase
        .from("courses")
        .delete()
        .eq("id", courseId)
        .select();

      console.log("Delete result:", { error, data });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Course deleted successfully");
      toast({
        title: "Sucesso",
        description: "Curso excluído com sucesso.",
      });

      fetchData();
    } catch (error) {
      console.error("Error deleting course:", error);
      toast({
        title: "Erro",
        description: `Erro ao excluir curso: ${error.message || "Erro desconhecido"}`,
        variant: "destructive",
      });
    }
  };

  const handleBanUser = async (userId: string) => {
    const confirmed = window.confirm("Tem certeza que deseja banir este usuário? Todos os dados relacionados serão deletados permanentemente.");
    if (!confirmed) return;

    try {
      console.log("Attempting to ban user:", userId);

      // First, get all courses by this user
      console.log("Fetching courses by user...");
      const { data: userCourses, error: coursesError } = await supabase
        .from("courses")
        .select("id")
        .eq("author_id", userId);

      if (coursesError) {
        console.error("Error fetching user courses:", coursesError);
        throw coursesError;
      }

      console.log("User courses found:", userCourses?.length || 0);

      // Delete related data for each course
      if (userCourses && userCourses.length > 0) {
        for (const course of userCourses) {
          console.log("Deleting data for course:", course.id);

          // Delete comments on this course
          const { error: commentsError } = await supabase.from("comments").delete().eq("course_id", course.id);
          if (commentsError) console.error("Error deleting comments for course:", course.id, commentsError);

          // Delete ratings for this course
          const { error: ratingsError } = await supabase.from("course_ratings").delete().eq("course_id", course.id);
          if (ratingsError) console.error("Error deleting ratings for course:", course.id, ratingsError);

          // Delete saves for this course
          const { error: savesError } = await supabase.from("course_saves").delete().eq("course_id", course.id);
          if (savesError) console.error("Error deleting saves for course:", course.id, savesError);

          // Delete likes for this course
          const { error: likesError } = await supabase.from("course_likes").delete().eq("course_id", course.id);
          if (likesError) console.error("Error deleting likes for course:", course.id, likesError);

          // Delete views for this course
          const { error: viewsError } = await supabase.from("course_views").delete().eq("course_id", course.id);
          if (viewsError) console.error("Error deleting views for course:", course.id, viewsError);

          // Delete trail courses
          const { error: trailError } = await supabase.from("trail_courses").delete().eq("course_id", course.id);
          if (trailError) console.error("Error deleting trail courses for course:", course.id, trailError);

          // Delete reports for this course
          const { error: reportsError } = await supabase.from("course_reports").delete().eq("course_id", course.id);
          if (reportsError) console.error("Error deleting reports for course:", course.id, reportsError);

          // Delete moderation logs for this course
          const { error: logsError } = await supabase.from("moderation_logs").delete().eq("course_id", course.id);
          if (logsError) console.error("Error deleting logs for course:", course.id, logsError);
        }

        // Delete all courses by this user
        console.log("Deleting all courses by user...");
        const { error: deleteCoursesError } = await supabase.from("courses").delete().eq("author_id", userId);
        if (deleteCoursesError) {
          console.error("Error deleting user courses:", deleteCoursesError);
          throw deleteCoursesError;
        }
        console.log("Courses deleted successfully");
      }

      // Delete comments made by this user
      console.log("Deleting comments by user...");
      const { error: userCommentsError } = await supabase.from("comments").delete().eq("user_id", userId);
      if (userCommentsError) console.error("Error deleting user comments:", userCommentsError);

      // Delete course ratings by this user
      console.log("Deleting course ratings by user...");
      const { error: userRatingsError } = await supabase.from("course_ratings").delete().eq("user_id", userId);
      if (userRatingsError) console.error("Error deleting user ratings:", userRatingsError);

      // Delete course saves by this user
      console.log("Deleting course saves by user...");
      const { error: userSavesError } = await supabase.from("course_saves").delete().eq("user_id", userId);
      if (userSavesError) console.error("Error deleting user saves:", userSavesError);

      // Delete course likes by this user
      console.log("Deleting course likes by user...");
      const { error: userLikesError } = await supabase.from("course_likes").delete().eq("user_id", userId);
      if (userLikesError) console.error("Error deleting user likes:", userLikesError);

      // Delete course views by this user
      console.log("Deleting course views by user...");
      const { error: userViewsError } = await supabase.from("course_views").delete().eq("user_id", userId);
      if (userViewsError) console.error("Error deleting user views:", userViewsError);

      // Delete user follows (both following and followers)
      console.log("Deleting user follows...");
      const { error: userFollowsError1 } = await supabase.from("user_follows").delete().eq("follower_id", userId);
      if (userFollowsError1) console.error("Error deleting user follows (follower):", userFollowsError1);
      const { error: userFollowsError2 } = await supabase.from("user_follows").delete().eq("following_id", userId);
      if (userFollowsError2) console.error("Error deleting user follows (following):", userFollowsError2);

      // Delete learning trails created by this user
      console.log("Deleting learning trails by user...");
      const { error: trailsError } = await supabase.from("learning_trails").delete().eq("creator_id", userId);
      if (trailsError) console.error("Error deleting user trails:", trailsError);

      // Delete trail courses for trails created by this user
      console.log("Deleting trail courses for user trails...");
      const { data: userTrails, error: trailsFetchError } = await supabase
        .from("learning_trails")
        .select("id")
        .eq("creator_id", userId);

      if (trailsFetchError) {
        console.error("Error fetching user trails:", trailsFetchError);
      } else if (userTrails && userTrails.length > 0) {
        const trailIds = userTrails.map(trail => trail.id);
        const { error: trailCoursesError } = await supabase
          .from("trail_courses")
          .delete()
          .in("trail_id", trailIds);
        if (trailCoursesError) console.error("Error deleting trail courses:", trailCoursesError);
      }

      // Delete course reports made by this user
      console.log("Deleting course reports by user...");
      const { error: reportsError } = await supabase.from("course_reports").delete().eq("reporter_id", userId);
      if (reportsError) console.error("Error deleting user reports:", reportsError);

      // Delete moderation logs for this user
      console.log("Deleting moderation logs for user...");
      const { error: moderationLogsError } = await supabase.from("moderation_logs").delete().eq("moderator_id", userId);
      if (moderationLogsError) console.error("Error deleting moderation logs:", moderationLogsError);

      // Delete user roles
      console.log("Deleting user roles...");
      const { error: rolesError } = await supabase.from("user_roles").delete().eq("user_id", userId);
      if (rolesError) {
        console.error("Error deleting user roles:", rolesError);
        throw rolesError;
      }
      console.log("User roles deleted successfully");

      // Update user profile to mark as banned instead of deleting
      console.log("Marking user profile as banned...");
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          banned: true,
          banned_at: new Date().toISOString()
        } as any)
        .eq("id", userId);

      if (profileError) {
        console.error("Error updating user profile:", profileError);
        throw profileError;
      }

      console.log("User profile marked as banned successfully");

      // Now call the Edge Function to delete from Supabase Auth
      console.log("Calling Edge Function to delete from Auth...");
      const { data: authData, error: authError } = await supabase.functions.invoke('delete-user', {
        body: { userId },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (authError) {
        console.error("Error calling delete-user function:", authError);
        // Don't throw here - user is already banned in database
        toast({
          title: "Aviso",
          description: "Usuário banido no banco, mas pode ser necessário remover manualmente da autenticação.",
          variant: "destructive",
        });
      } else {
        console.log("Auth deletion response:", authData);
      }

      console.log("User banned successfully");
      toast({
        title: "Sucesso",
        description: "Usuário banido com sucesso.",
      });

      fetchData();
    } catch (error) {
      console.error("Error banning user:", error);
      toast({
        title: "Erro",
        description: `Erro ao banir usuário: ${error.message || "Erro desconhecido"}`,
        variant: "destructive",
      });
    }
  };

  const handleAddCategory = async () => {
    if (!categoryForm.name || !categoryForm.slug || !categoryForm.icon) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("categories")
        .insert([{
          name: categoryForm.name,
          slug: categoryForm.slug,
          icon: categoryForm.icon,
        }]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Categoria adicionada com sucesso.",
      });

      setShowAddCategory(false);
      setCategoryForm({ name: '', slug: '', icon: '' });
      fetchData();
    } catch (error) {
      console.error("Error adding category:", error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar categoria.",
        variant: "destructive",
      });
    }
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      icon: category.icon,
    });
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !categoryForm.name || !categoryForm.slug || !categoryForm.icon) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("categories")
        .update({
          name: categoryForm.name,
          slug: categoryForm.slug,
          icon: categoryForm.icon,
        })
        .eq("id", editingCategory.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Categoria atualizada com sucesso.",
      });

      setEditingCategory(null);
      setCategoryForm({ name: '', slug: '', icon: '' });
      fetchData();
    } catch (error) {
      console.error("Error updating category:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar categoria.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const confirmed = window.confirm("Tem certeza que deseja excluir esta categoria? Todos os cursos desta categoria serão afetados.");
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", categoryId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Categoria excluída com sucesso.",
      });

      fetchData();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir categoria.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Painel Administrativo</h1>
          <p className="text-muted-foreground">
            Gerencie todos os aspectos da plataforma
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Cursos</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCourses}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingCourses}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="courses">Cursos</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Usuários</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{user.full_name || user.username}</p>
                        <p className="text-sm text-muted-foreground">
                          Nível: {user.level} | Pontos: {user.total_points}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          defaultValue={user.user_roles?.[0]?.role || "user"}
                          onValueChange={(value) => handleUpdateUserRole(user.id, value)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">Usuário</SelectItem>
                            <SelectItem value="moderator">Moderador</SelectItem>
                            <SelectItem value="admin">Administrador</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleBanUser(user.id)}
                        >
                          Banir
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Cursos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{course.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Por: {course.profiles?.full_name || course.profiles?.username} | Status: {course.status}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Views: {course.view_count} | Likes: {course.like_count}
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteCourse(course.id)}
                      >
                        Excluir
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Categorias</CardTitle>
                <Button
                  onClick={() => setShowAddCategory(true)}
                  className="w-fit"
                >
                  Adicionar Categoria
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{cat.icon}</span>
                        <div>
                          <p className="font-medium">{cat.name}</p>
                          <p className="text-sm text-muted-foreground">Slug: {cat.slug}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCategory(cat)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteCategory(cat.id)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Add/Edit Category Dialog */}
            {(showAddCategory || editingCategory) && (
              <Dialog open={showAddCategory || !!editingCategory} onOpenChange={(open) => {
                if (!open) {
                  setShowAddCategory(false);
                  setEditingCategory(null);
                  setCategoryForm({ name: '', slug: '', icon: '' });
                }
              }}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingCategory ? 'Editar Categoria' : 'Adicionar Categoria'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nome</Label>
                      <Input
                        id="name"
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Nome da categoria"
                      />
                    </div>
                    <div>
                      <Label htmlFor="slug">Slug</Label>
                      <Input
                        id="slug"
                        value={categoryForm.slug}
                        onChange={(e) => setCategoryForm(prev => ({ ...prev, slug: e.target.value }))}
                        placeholder="slug-da-categoria"
                      />
                    </div>
                    <div>
                      <Label htmlFor="icon">Ícone (Emoji)</Label>
                      <Input
                        id="icon"
                        value={categoryForm.icon}
                        onChange={(e) => setCategoryForm(prev => ({ ...prev, icon: e.target.value }))}
                        placeholder="📚"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddCategory(false);
                        setEditingCategory(null);
                        setCategoryForm({ name: '', slug: '', icon: '' });
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={editingCategory ? handleUpdateCategory : handleAddCategory}>
                      {editingCategory ? 'Atualizar' : 'Adicionar'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
