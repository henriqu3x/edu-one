import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, Heart, BookmarkPlus, Verified, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { CategoryIcon } from "@/lib/icons";

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  author: {
    id: string;
    username: string;
    avatar_url?: string;
    is_verified_author: boolean;
  };
  category?: {
    name: string;
    icon: string;
  };
  difficulty_level: string;
  view_count: number;
  like_count: number;
  tags?: string[];
  average_rating?: number;
  rating_count?: number;
}

const difficultyColors = {
  iniciante: "bg-green-500/10 text-green-500 border-green-500/20",
  intermediario: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  avancado: "bg-red-500/10 text-red-500 border-red-500/20",
};

export const CourseCard = ({
  id,
  title,
  description,
  thumbnail,
  author,
  category,
  difficulty_level,
  view_count,
  like_count,
  tags,
  average_rating = 0,
  rating_count = 0,
}: CourseCardProps) => {
  return (
    <Card className="group overflow-hidden border-border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <Link to={`/course/${id}`}>
        <div className="relative overflow-hidden aspect-video bg-muted">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
              {category ? (
                <CategoryIcon iconName={category.icon} className="h-12 w-12 text-foreground" />
              ) : (
                <span className="text-4xl">📚</span>
              )}
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge
              variant="secondary"
              className={difficultyColors[difficulty_level as keyof typeof difficultyColors]}
            >
              {difficulty_level}
            </Badge>
          </div>
        </div>
      </Link>

      <CardHeader className="space-y-2">
        <Link to={`/course/${id}`}>
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
      </CardHeader>

      <CardContent className="space-y-3">
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={author.avatar_url} />
            <AvatarFallback className="text-xs">
              {author.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {author.id ? (
            <Link
              to={`/profile/${author.id}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              {author.username}
              {author.is_verified_author && (
                <Verified className="h-3 w-3 text-primary fill-primary" />
              )}
            </Link>
          ) : (
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              {author.username}
              {author.is_verified_author && (
                <Verified className="h-3 w-3 text-primary fill-primary" />
              )}
            </span>
          )}
        </div>

        {/* Rating Display */}
        {average_rating > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.round(average_rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium">{average_rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({rating_count})</span>
            {average_rating >= 4.5 && rating_count >= 5 && (
              <Badge variant="default" className="text-xs">Top</Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between text-sm text-muted-foreground border-t border-border pt-4">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {view_count}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            {like_count}
          </span>
        </div>
        {category && (
          <Badge variant="secondary" className="text-xs flex items-center gap-1">
            <CategoryIcon iconName={category.icon} className="h-3 w-3" />
            {category.name}
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
};
