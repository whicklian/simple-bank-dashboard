const express = require('express');
const router = express.Router();
const db = require('../database/db');

/**
 * @route   GET /api/accounts
 * @desc    Fetch all bank accounts sorted by account ID
 */
router.get('/', async (req, res) => {
    try {
        // Query all accounts from the database
        const result = await db.query('SELECT * FROM accounts ORDER BY account_id ASC');
        // Send the rows back as JSON
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error while fetching accounts' });
    }
});

/**
 * @route   POST /api/transfer
 * @desc    Transfer funds safely between two accounts using a database transaction
 */
router.post('/transfer', async (req, res) => {
    const { from_account, to_account, amount } = req.body;
    
    // Acquire a dedicated client from the pool for transaction management
    const client = await db.getClient();

    try {
        // 1. Start the transaction block
        await client.query('BEGIN');
        
        // 2. Lock the sender's row ('FOR UPDATE') to prevent race conditions 
        // if multiple transfers happen simultaneously from the same account
        const senderCheck = await client.query(
          'SELECT balance FROM accounts WHERE account_id = $1 FOR UPDATE',
          [from_account]  
        );

        // 3. Validate that the sender account actually exists
        if (senderCheck.rows.length === 0) {
            throw new Error('Sender Account not found.');
        }

        // 4. Validate that the sender has enough money for the transfer
        const senderBalance = parseFloat(senderCheck.rows[0].balance);
        if (senderBalance < parseFloat(amount)) {
            throw new Error('Insufficient funds.');
        }

        // 5. Deduct the amount from the sender's account
        await client.query(
            'UPDATE accounts SET balance = balance - $1 WHERE account_id = $2',
            [amount, from_account]
        );

        // 6. Add the amount to the receiver's account
        await client.query(
            'UPDATE accounts SET balance = balance + $1 WHERE account_id = $2',
            [amount, to_account]
        );

        // 7. Commit the transaction if everything succeeded
        await client.query('COMMIT');
        res.json({ success: true, messages: 'Transfer successful!' });

    } catch (err) {
        // If any error occurs above, roll back all database changes
        await client.query('ROLLBACK');
        res.status(400).json({ success: false, errmessage: err.message });
    } finally {
        // Always release the client back to the pool when finished
        client.release();
    }
});

module.exports = router;