-- scripts/db-migrations/002-create-lottery-tickets-table.sql

-- Cria a nova tabela lottery_tickets para armazenar cada título individual
CREATE TABLE lottery_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    edition_id UUID NOT NULL REFERENCES lottery_editions(id) ON DELETE CASCADE,
    ticket_number TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'disponivel', -- 'disponivel', 'comprado'
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- ID do usuário que comprou o título (nullable)
    payment_status TEXT, -- 'pago', 'pendente', NULL se não comprado
    prize_type TEXT, -- 'raspadinha', 'sorteio', NULL se não premiado
    prize_value TEXT, -- Valor do prêmio (pode ser numérico como texto ou nome do item, ex: '50.00', 'iPhone 16')
    is_instant_prize_winner BOOLEAN DEFAULT FALSE,
    is_lottery_prize_winner BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adiciona uma restrição de unicidade para garantir que o número do título seja único por edição
ALTER TABLE lottery_tickets
ADD CONSTRAINT unique_ticket_number_per_edition UNIQUE (edition_id, ticket_number);

-- Adiciona índices para otimizar consultas comuns
CREATE INDEX idx_lottery_tickets_edition_id ON lottery_tickets (edition_id);
CREATE INDEX idx_lottery_tickets_ticket_number ON lottery_tickets (ticket_number);
CREATE INDEX idx_lottery_tickets_status ON lottery_tickets (status);
CREATE INDEX idx_lottery_tickets_user_id ON lottery_tickets (user_id);
CREATE INDEX idx_lottery_tickets_prize_type ON lottery_tickets (prize_type);
CREATE INDEX idx_lottery_tickets_is_instant_prize_winner ON lottery_tickets (is_instant_prize_winner);
CREATE INDEX idx_lottery_tickets_is_lottery_prize_winner ON lottery_tickets (is_lottery_prize_winner);
