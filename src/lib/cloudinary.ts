import { Cloudinary } from '@cloudinary/url-gen';

export const cld = new Cloudinary({
  cloud: {
    cloudName: 'your-cloud-name' // Will be configured with actual credentials
  }
});

export const CLOUDINARY_CONFIG = {
  cloudName: 'duik3k8uv',
  uploadPreset: 'public_uploads',
  apiKey: '633838297767365',
  apiSecret: 'SWJovTu5ZWFUyZtxl5gHfRZejPE'
};

// Cloudinary Upload Widget configuration
export const getUploadWidgetConfig = (onSuccess: (result: any) => void, onProgress?: (progress: number) => void) => ({
  cloudName: CLOUDINARY_CONFIG.cloudName,
  uploadPreset: CLOUDINARY_CONFIG.uploadPreset,
  sources: ['local', 'url', 'camera'],
  multiple: true,
  maxFiles: 10,
  resourceType: 'video',
  clientAllowedFormats: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'],
  maxFileSize: 100000000, // 100MB
  folder: 'course-videos',
  cropping: false,
  showSkipCropButton: false,
  showPoweredBy: false,
  styles: {
    palette: {
      window: "#FFFFFF",
      windowBorder: "#90A0B3",
      tabIcon: "#0078FF",
      menuIcons: "#5A616A",
      textDark: "#000000",
      textLight: "#FFFFFF",
      link: "#0078FF",
      action: "#FF620C",
      inactiveTabIcon: "#0E2F5A",
      error: "#F44235",
      inProgress: "#0078FF",
      complete: "#20B832",
      sourceBg: "#E4EBF1"
    },
    fonts: {
      default: null,
      "'Poppins', sans-serif": {
        url: "https://fonts.googleapis.com/css?family=Poppins",
        active: true
      }
    }
  }
});

export const openUploadWidget = (onSuccess: (result: any) => void, onProgress?: (progress: number) => void) => {
  if (typeof window !== 'undefined' && (window as any).cloudinary) {
    const widget = (window as any).cloudinary.createUploadWidget(
      getUploadWidgetConfig(onSuccess, onProgress),
      (error: any, result: any) => {
        if (!error && result && result.event === "success") {
          onSuccess(result.info);
        }
        if (result && result.event === "upload-progress") {
          onProgress?.(result.info.percent);
        }
      }
    );
    widget.open();
  }
};
