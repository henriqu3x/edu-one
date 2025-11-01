-- Add Cloudinary video support to courses table
ALTER TABLE public.courses
ADD COLUMN video_type TEXT CHECK (video_type IN ('external', 'cloudinary_single', 'cloudinary_playlist')) DEFAULT 'external',
ADD COLUMN video_urls TEXT[];

-- Update existing courses to have video_type = 'external'
UPDATE public.courses SET video_type = 'external' WHERE video_type IS NULL;

-- Make video_type NOT NULL after setting defaults
ALTER TABLE public.courses ALTER COLUMN video_type SET NOT NULL;

-- For Cloudinary videos, content_url can be null
ALTER TABLE public.courses ALTER COLUMN content_url DROP NOT NULL;
