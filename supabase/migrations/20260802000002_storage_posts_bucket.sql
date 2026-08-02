-- Create storage bucket for post photos
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'posts',
  'posts',
  false,
  5242880,  -- 5MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Authenticated users can upload to posts bucket (own subfolder)
create policy "posts storage: authenticated upload"
  on storage.objects for insert
  with check (
    bucket_id = 'posts'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can read posts bucket
create policy "posts storage: authenticated read"
  on storage.objects for select
  using (
    bucket_id = 'posts'
    and auth.uid() is not null
  );

-- Users can delete their own uploads
create policy "posts storage: self delete"
  on storage.objects for delete
  using (
    bucket_id = 'posts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
