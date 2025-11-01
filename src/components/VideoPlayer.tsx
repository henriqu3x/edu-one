import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

interface VideoData {
  public_id: string;
  secure_url: string;
  thumbnail_url?: string;
  duration?: number;
}

interface VideoPlayerProps {
  videos: VideoData[];
  title?: string;
}

export default function VideoPlayer({ videos, title }: VideoPlayerProps) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentVideo = videos[currentVideoIndex];

  const nextVideo = () => {
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
      setIsPlaying(false);
    }
  };

  const prevVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
      setIsPlaying(false);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentVideo) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhum vídeo disponível</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Video Player */}
      <Card>
        <CardContent className="p-0">
          <div className="aspect-video bg-black relative">
            <video
              key={currentVideo.public_id} // Force re-render when video changes
              className="w-full h-full"
              controls
              poster={currentVideo.thumbnail_url}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => {
                setIsPlaying(false);
                if (currentVideoIndex < videos.length - 1) {
                  nextVideo();
                }
              }}
            >
              <source src={currentVideo.secure_url} type="video/mp4" />
              Seu navegador não suporta o elemento de vídeo.
            </video>

            {/* Navigation Overlay */}
            {videos.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                  onClick={prevVideo}
                  disabled={currentVideoIndex === 0}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                  onClick={nextVideo}
                  disabled={currentVideoIndex === videos.length - 1}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Video Info and Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">
                {title || `Vídeo ${currentVideoIndex + 1} de ${videos.length}`}
              </h3>
              {currentVideo.duration && (
                <p className="text-sm text-muted-foreground">
                  Duração: {formatDuration(currentVideo.duration)}
                </p>
              )}
            </div>

            {videos.length > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevVideo}
                  disabled={currentVideoIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  {currentVideoIndex + 1} / {videos.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextVideo}
                  disabled={currentVideoIndex === videos.length - 1}
                >
                  Próximo
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </div>

          {/* Video Thumbnails for Navigation */}
          {videos.length > 1 && (
            <div className="mt-4 grid grid-cols-5 gap-2">
              {videos.map((video, index) => (
                <button
                  key={video.public_id}
                  onClick={() => {
                    setCurrentVideoIndex(index);
                    setIsPlaying(false);
                  }}
                  className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-colors ${
                    index === currentVideoIndex
                      ? 'border-primary'
                      : 'border-transparent hover:border-muted-foreground'
                  }`}
                >
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={`Vídeo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Play className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
                    {index + 1}
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
