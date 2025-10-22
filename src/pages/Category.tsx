import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { CourseCard } from "@/components/CourseCard";

export default function Category() {
  const { slug } = useParams<{ slug: string }>();
  const [courses, setCourses] = useState<any[]>([]);
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchCategoryAndCourses();
    }
  }, [slug]);

  const fetchCategoryAndCourses = async () => {
    setLoading(true);

    try {
      // Fetch category details
      const { data: categoryData } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .single();

      if (categoryData) {
        setCategory(categoryData);

        // Fetch courses for this category
        const { data: coursesData } = await supabase
          .from("courses")
          .select("*, profiles!courses_author_id_fkey(id, username, full_name, avatar_url, is_verified_author), categories(name, slug, icon)")
          .eq("status", "approved")
          .eq("category_id", categoryData.id)
          .order("created_at", { ascending: false });

        if (coursesData) {
          setCourses(coursesData);
        }
      }
    } catch (error) {
      console.error("Error fetching category and courses:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-8">
          <div className="text-center py-12">Carregando...</div>
        </main>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Categoria não encontrada.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{category.name}</h1>
          <p className="text-muted-foreground">
            {category.description || "Explore cursos desta categoria"}
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum curso encontrado nesta categoria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                description={course.description}
                thumbnail={course.thumbnail_url}
                author={{
                  id: course.profiles?.id,
                  username: course.profiles?.full_name || course.profiles?.username,
                  avatar_url: course.profiles?.avatar_url,
                  is_verified_author: course.profiles?.is_verified_author || false,
                }}
                category={course.categories ? { name: course.categories.name, icon: course.categories.icon || '📚' } : undefined}
                difficulty_level={course.difficulty_level}
                view_count={course.view_count}
                like_count={course.like_count}
                tags={course.tags || []}
                average_rating={course.average_rating}
                rating_count={course.rating_count}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
