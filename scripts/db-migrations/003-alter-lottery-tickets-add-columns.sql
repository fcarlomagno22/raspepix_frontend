-- scripts/db-migrations/003-alter-lottery-tickets-add-columns.sql

-- Adiciona colunas à tabela lottery_tickets, se elas ainda não existirem
ALTER TABLE lottery_tickets
ADD COLUMN IF NOT EXISTS payment_status TEXT, -- 'pago', 'pendente', NULL se não comprado
ADD COLUMN IF NOT EXISTS prize_type TEXT, -- 'raspadinha', 'sorteio', NULL se não premiado
ADD COLUMN IF NOT EXISTS prize_value TEXT, -- Valor do prêmio (pode ser numérico como texto ou nome do item, ex: '50.00', 'iPhone 16')
ADD COLUMN IF NOT EXISTS is_instant_prize_winner BOOLEAN DEFAULT FALSE, -- Flag se é ganhador de prêmio instantâneo
ADD COLUMN IF NOT EXISTS is_lottery_prize_winner BOOLEAN DEFAULT FALSE, -- Flag se é ganhador do sorteio principal (capitalizadora)
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(), -- Adiciona created_at se não existir
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(); -- Adiciona updated_at se não existir

-- Adiciona a restrição de unicidade para garantir que o número do título seja único por edição
-- Esta operação pode falhar se a restrição já existir ou se houver dados duplicados.
-- Se falhar, você pode precisar remover a restrição existente primeiro ou limpar dados.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_ticket_number_per_edition' AND conrelid = 'lottery_tickets'::regclass) THEN
        ALTER TABLE lottery_tickets
        ADD CONSTRAINT unique_ticket_number_per_edition UNIQUE (edition_id, ticket_number);
    END IF;
END
$$;

-- Adiciona índices para otimizar consultas comuns, se eles ainda não existirem
CREATE INDEX IF NOT EXISTS idx_lottery_tickets_edition_id ON lottery_tickets (edition_id);
CREATE INDEX IF NOT EXISTS idx_lottery_tickets_ticket_number ON lottery_tickets (ticket_number);
CREATE INDEX IF NOT EXISTS idx_lottery_tickets_status ON lottery_tickets (status);
CREATE INDEX IF NOT EXISTS idx_lottery_tickets_user_id ON lottery_tickets (user_id);
CREATE INDEX IF NOT EXISTS idx_lottery_tickets_prize_type ON lottery_tickets (prize_type);
CREATE INDEX IF NOT EXISTS idx_lottery_tickets_is_instant_prize_winner ON lottery_tickets (is_instant_prize_winner);
CREATE INDEX IF NOT EXISTS idx_lottery_tickets_is_lottery_prize_winner ON lottery_tickets (is_lottery_prize_winner);
