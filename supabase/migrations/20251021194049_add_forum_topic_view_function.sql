-- Function to increment forum topic view count
CREATE OR REPLACE FUNCTION increment_forum_topic_view(topic_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE forum_topics
  SET view_count = view_count + 1
  WHERE id = topic_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
