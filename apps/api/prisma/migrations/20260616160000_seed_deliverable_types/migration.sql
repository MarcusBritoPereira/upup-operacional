INSERT INTO deliverable_types (id, name, description, is_active, created_at)
VALUES 
  (gen_random_uuid(), 'Planejamento Estratégico Mensal (Mensal)', 'Planejamento Estratégico Mensal (mensal)', true, NOW()),
  (gen_random_uuid(), 'Calendário Editorial (Mensal)', 'Calendário Editorial (mensal)', true, NOW()),
  (gen_random_uuid(), 'Reel (Un)', 'Reel (un)', true, NOW()),
  (gen_random_uuid(), 'Carrossel (Un)', 'Carrossel (un)', true, NOW()),
  (gen_random_uuid(), 'Story Estático (Un)', 'Story Estático (un)', true, NOW()),
  (gen_random_uuid(), 'Story Animado (Un)', 'Story Animado (un)', true, NOW()),
  (gen_random_uuid(), 'Captação de Conteúdo Presencial (Diária)', 'Captação de Conteúdo Presencial (diária)', true, NOW()),
  (gen_random_uuid(), 'Sessão Fotográfica (Diária)', 'Sessão Fotográfica (diária)', true, NOW()),
  (gen_random_uuid(), 'Gestão de Perfil Instagram (Mensal)', 'Gestão de Perfil Instagram (mensal)', true, NOW()),
  (gen_random_uuid(), 'Relatório Mensal (Mensal)', 'Relatório Mensal (mensal)', true, NOW()),
  (gen_random_uuid(), 'Reunião de Alinhamento (Mensal)', 'Reunião de Alinhamento (mensal)', true, NOW()),
  (gen_random_uuid(), 'Impulsionamento de Publicação (Un)', 'Impulsionamento de Publicação (un)', true, NOW()),
  (gen_random_uuid(), 'Gestão de Tráfego Pago (Mensal)', 'Gestão de Tráfego Pago (mensal)', true, NOW())
ON CONFLICT (name) DO NOTHING;
