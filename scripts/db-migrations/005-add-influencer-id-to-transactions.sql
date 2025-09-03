-- Adiciona coluna influencer_id à tabela transactions
ALTER TABLE transactions
ADD COLUMN influencer_id UUID REFERENCES users(id);

-- Adiciona índice para melhorar performance de consultas
CREATE INDEX idx_transactions_influencer_id ON transactions(influencer_id);

-- Adiciona constraint de chave estrangeira
ALTER TABLE transactions
ADD CONSTRAINT fk_transactions_influencer
FOREIGN KEY (influencer_id)
REFERENCES users(id)
ON DELETE SET NULL;

-- Cria função para buscar o influencer_id do usuário
CREATE OR REPLACE FUNCTION get_user_influencer_id(user_id UUID)
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT referred_by
        FROM profiles
        WHERE user_id = $1
    );
END;
$$ LANGUAGE plpgsql;

-- Cria trigger para atualizar automaticamente o influencer_id
CREATE OR REPLACE FUNCTION update_transaction_influencer()
RETURNS TRIGGER AS $$
BEGIN
    NEW.influencer_id = get_user_influencer_id(NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplica o trigger antes de inserir novas transações
CREATE TRIGGER tr_update_transaction_influencer
    BEFORE INSERT ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_transaction_influencer();

-- Atualiza registros existentes
UPDATE transactions t
SET influencer_id = (
    SELECT referred_by
    FROM profiles p
    WHERE p.user_id = t.user_id
)
WHERE influencer_id IS NULL;

COMMENT ON COLUMN transactions.influencer_id IS 'ID do influenciador que indicou o usuário que realizou a transação';