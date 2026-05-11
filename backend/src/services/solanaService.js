import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

const connection = new Connection(
    `https://api.${process.env.SOLANA_NETWORK || 'devnet'}.solana.com`,
    'confirmed'
);

export const verifyQuizPayment = async (txHash, expectedAmount, senderWallet) => {
    try {
        const treasuryWallet = process.env.TREASURY_WALLET;
        if (!treasuryWallet) {
            throw new Error('TREASURY_WALLET not configured in backend');
        }

        // Wait a little bit just to ensure tx is visible
        await new Promise(res => setTimeout(res, 2000));

        // Get parsed transaction
        // We use maxSupportedTransactionVersion: 0 to support versioned transactions
        const tx = await connection.getParsedTransaction(txHash, {
            maxSupportedTransactionVersion: 0,
            commitment: 'confirmed'
        });

        if (!tx) {
            return { success: false, message: 'Transaction not found on blockchain.' };
        }

        if (tx.meta?.err) {
            return { success: false, message: 'Transaction failed on blockchain.' };
        }

        // Verify the instructions
        let paymentValid = false;

        const instructions = tx.transaction.message.instructions;
        
        for (const ix of instructions) {
            // Check if it's a System Program transfer
            if (ix.program === 'system' && ix.parsed?.type === 'transfer') {
                const info = ix.parsed.info;
                const from = info.source;
                const to = info.destination;
                const lamports = info.lamports;

                const amountInSol = lamports / LAMPORTS_PER_SOL;

                if (
                    from === senderWallet &&
                    to === treasuryWallet &&
                    amountInSol >= expectedAmount // Allow slightly more if needed, but exact is fine too
                ) {
                    paymentValid = true;
                    break;
                }
            }
        }

        if (!paymentValid) {
            return { success: false, message: 'Transaction details (sender, receiver, or amount) do not match expected values.' };
        }

        return { success: true, message: 'Payment verified successfully.' };
    } catch (error) {
        console.error('verifyQuizPayment error:', error);
        return { success: false, message: 'Internal server error verifying payment.' };
    }
};
