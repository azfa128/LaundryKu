alter table public.orders
  add column if not exists payment_proof_path text,
  add column if not exists bag_photo_path text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'laundryku-order-attachments',
  'laundryku-order-attachments',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Customers upload own order attachments" on storage.objects;
create policy "Customers upload own order attachments"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'laundryku-order-attachments'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Customers and admins read order attachments" on storage.objects;
create policy "Customers and admins read order attachments"
on storage.objects for select to authenticated
using (
  bucket_id = 'laundryku-order-attachments'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  )
);

drop policy if exists "Customers remove own order attachments" on storage.objects;
create policy "Customers remove own order attachments"
on storage.objects for delete to authenticated
using (
  bucket_id = 'laundryku-order-attachments'
  and (storage.foldername(name))[1] = auth.uid()::text
);
