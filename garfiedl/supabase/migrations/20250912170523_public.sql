create or replace view "public"."suggested_posts" as  SELECT posts.id,
    posts.created_at,
    posts.body,
    posts.link,
    posts.comic,
    posts.likes,
    posts.author,
    posts.type,
    posts.reference,
    posts.replies,
    (((- EXTRACT(epoch FROM (now() - posts.created_at))) / (60)::numeric) + (power((posts.likes)::numeric, 0.67) * (10)::numeric)) AS relevance
   FROM posts
  WHERE ((posts.type = ANY (ARRAY['post'::post_type, 'quote'::post_type])) OR ((posts.type = 'repost'::post_type) AND (EXISTS ( SELECT 1
           FROM follows
          WHERE ((follows.recipient = posts.author) AND (follows.creator = auth.uid()))))))
  ORDER BY (((- EXTRACT(epoch FROM (now() - posts.created_at))) / (60)::numeric) + (power((posts.likes)::numeric, 0.67) * (10)::numeric)) DESC;



