-- Cor visual por categoria (paleta fixa usada pelo app).

alter table public.categorias
  add column if not exists cor text not null default 'slate' check (
    cor in ('slate', 'blue', 'violet', 'emerald', 'amber', 'rose', 'cyan', 'orange')
  );
