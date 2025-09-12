drop policy "Allow users to follow others" on "public"."follows";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.user_exists(search_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  return exists(select 1 from public.profiles where id = search_user_id);
END;
$function$
;

create or replace view "public"."followed_posts" as  SELECT id,
    created_at,
    body,
    link,
    comic,
    likes,
    author,
    type,
    reference,
    replies
   FROM posts
  WHERE ((type = ANY (ARRAY['post'::post_type, 'repost'::post_type, 'quote'::post_type])) AND (EXISTS ( SELECT 1
           FROM follows
          WHERE ((follows.recipient = posts.author) AND (follows.creator = auth.uid())))))
  ORDER BY created_at DESC;


create or replace view "public"."suggested_posts" as  SELECT id,
    created_at,
    body,
    link,
    comic,
    likes,
    author,
    type,
    reference,
    replies,
    (((- EXTRACT(epoch FROM (now() - created_at))) / (60)::numeric) + (power((likes)::numeric, 0.67) * (10)::numeric)) AS relevance
   FROM posts
  WHERE ((type = ANY (ARRAY['post'::post_type, 'quote'::post_type])) OR ((type = 'repost'::post_type) AND (EXISTS ( SELECT 1
           FROM follows
          WHERE ((follows.recipient = posts.author) AND (follows.creator = auth.uid()))))))
  ORDER BY (((- EXTRACT(epoch FROM (now() - created_at))) / (60)::numeric) + (power((likes)::numeric, 0.67) * (10)::numeric)) DESC;


create policy "Allow users to follow others"
on "public"."follows"
as permissive
for insert
to authenticated
with check (((creator = auth.uid()) AND user_exists(recipient) AND (NOT (EXISTS ( SELECT 1
   FROM follows follows_1
  WHERE ((follows_1.creator = follows.creator) AND (follows_1.recipient = follows.recipient)))))));



