import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RatingComponentProps {
  courseId: string;
}

export function RatingComponent({ courseId }: RatingComponentProps) {
  const [userRating, setUserRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [existingRating, setExistingRating] = useState<any>(null);
  const [allRatings, setAllRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRatings();
  }, [courseId]);

  const fetchRatings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Fetch user's rating if logged in
      if (user) {
        const { data: rating } = await supabase
          .from("course_ratings")
          .select("*")
          .eq("course_id", courseId)
          .eq("user_id", user.id)
          .maybeSingle();

        if (rating) {
          setExistingRating(rating);
          setUserRating(rating.rating);
          setComment(rating.comment || "");
        }
      }

      // Fetch all ratings
      const { data: ratings } = await supabase
        .from("course_ratings")
        .select("*, profiles!course_ratings_user_id_fkey(display_name, avatar_url)")
        .eq("course_id", courseId)
        .order("created_at", { ascending: false });

      if (ratings) setAllRatings(ratings);
    } catch (error) {
      console.error("Error fetching ratings:", error);
    }
  };

  const handleSubmitRating = async () => {
    if (userRating === 0) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma avaliação.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para avaliar.",
          variant: "destructive",
        });
        return;
      }

      const ratingData = {
        course_id: courseId,
        user_id: user.id,
        rating: userRating,
        comment: comment.trim() || null,
      };

      if (existingRating) {
        // Update existing rating
        const { error } = await supabase
          .from("course_ratings")
          .update(ratingData)
          .eq("id", existingRating.id);

        if (error) throw error;
      } else {
        // Create new rating
        const { error } = await supabase
          .from("course_ratings")
          .insert(ratingData);

        if (error) throw error;
      }

      toast({
        title: "Sucesso",
        description: "Avaliação enviada com sucesso!",
      });

      fetchRatings();
    } catch (error: any) {
      console.error("Error submitting rating:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao enviar avaliação.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sua Avaliação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setUserRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoverRating || userRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>

          <Textarea
            placeholder="Deixe um comentário sobre este curso (opcional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
          />

          <Button onClick={handleSubmitRating} disabled={loading}>
            {loading ? "Enviando..." : existingRating ? "Atualizar Avaliação" : "Enviar Avaliação"}
          </Button>
        </CardContent>
      </Card>

      {allRatings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Avaliações da Comunidade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {allRatings.map((rating) => (
              <div key={rating.id} className="border-b pb-4 last:border-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= rating.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">
                    {rating.profiles?.display_name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(rating.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                {rating.comment && (
                  <p className="text-sm text-muted-foreground">{rating.comment}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
