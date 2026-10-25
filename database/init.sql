DROP TABLE IF EXISTS accounts CASCADE;

CREATE TABLE accounts (
    account_id SERIAL PRIMARY KEY,
    account_holder VARCHAR(100) NOT NULL,
    balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00
);

INSERT INTO accounts (account_holder, balance) VALUES ('Nyxara Nerio', 2000.00),('Dorothy Golden', 5000.00),('Golden Nerio', 3000.00),('Reagan Omondi', 8000.00),('Whicklian ario', 2000.00),('Cipher Gold', 2080.00),
('Otieno Dorothy', 8000.00);

CREATE OR REPLACE FUNCTION calculate_projected_balance(
    p_account_id INT,
    p_years INT,
    p_rate_percept NUMERIC
)
RETURNS NUMERIC AS $$ DECLARE
    v_current_balance NUMERIC;
BEGIN
    SELECT balance INTO v_current_balance FROM accounts WHERE account_id = p_account_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Account not found'; END IF;
    RETURN ROUND(v_current_balance * POWER((1 + p_rate_percent / 100.0), p_years), 2);
END;
$$ LANGUAGE plpgsql;
