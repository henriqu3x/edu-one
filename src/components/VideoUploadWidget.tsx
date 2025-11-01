import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { X, Play, Upload, Video } from 'lucide-react';
import { openUploadWidget } from '@/lib/cloudinary';

interface UploadedVideo {
  public_id: string;
  secure_url: string;
  thumbnail_url?: string;
  duration?: number;
  format: string;
  bytes: number;
}

interface VideoUploadWidgetProps {
  videos: UploadedVideo[];
  onVideosChange: (videos: UploadedVideo[]) => void;
  maxVideos?: number;
}

export default function VideoUploadWidget({
  videos,
  onVideosChange,
  maxVideos = 10
}: VideoUploadWidgetProps) {
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // Load Cloudinary script
    if (typeof window !== 'undefined' && !(window as any).cloudinary) {
      const script = document.createElement('script');
      script.src = 'https://upload-widget.cloudinary.com/global/all.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  const handleUpload = () => {
    if (videos.length >= maxVideos) {
      alert(`Máximo de ${maxVideos} vídeos permitido`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    openUploadWidget(
      (result) => {
        const newVideo: UploadedVideo = {
          public_id: result.public_id,
          secure_url: result.secure_url,
          thumbnail_url: result.thumbnail_url,
          duration: result.duration,
          format: result.format,
          bytes: result.bytes
        };

        onVideosChange([...videos, newVideo]);
        setIsUploading(false);
        setUploadProgress(0);
      },
      (progress) => {
        setUploadProgress(progress);
      }
    );
  };

  const removeVideo = (index: number) => {
    const newVideos = videos.filter((_, i) => i !== index);
    onVideosChange(newVideos);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Vídeos do Curso</h3>
          <p className="text-sm text-muted-foreground">
            {videos.length} de {maxVideos} vídeos
          </p>
        </div>
        <Button
          onClick={handleUpload}
          disabled={isUploading || videos.length >= maxVideos}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          {isUploading ? 'Enviando...' : 'Adicionar Vídeo'}
        </Button>
      </div>

      {isUploading && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Enviando vídeo...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {videos.map((video, index) => (
          <Card key={video.public_id}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="relative w-32 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Play className="h-6 w-6 text-white" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium truncate">
                        Vídeo {index + 1}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(video.bytes)}
                        {video.duration && ` • ${formatDuration(video.duration)}`}
                      </p>
                      <p className="text-xs text-muted-foreground uppercase">
                        {video.format}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVideo(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {videos.length === 0 && !isUploading && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum vídeo adicionado</h3>
              <p className="text-muted-foreground mb-4">
                Clique em "Adicionar Vídeo" para começar a enviar seus vídeos
              </p>
              <Button onClick={handleUpload} variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Adicionar Primeiro Vídeo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
