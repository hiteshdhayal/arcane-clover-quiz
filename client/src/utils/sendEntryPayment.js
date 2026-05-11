import {
    Connection,
    PublicKey,
    SystemProgram,
    Transaction,
    LAMPORTS_PER_SOL
} from '@solana/web3.js';

/**
 * Sends an entry payment in SOL to the treasury wallet.
 * 
 * @param {object} wallet - The wallet object from useWallet() hook
 * @param {number} amount - The amount of SOL to send (e.g., 0.1)
 * @param {string} network - The Solana network (e.g., 'devnet')
 * @returns {Promise<string>} The transaction signature/hash
 */
export const sendEntryPayment = async (wallet, amount = 0.1, network = 'devnet') => {
    try {
        if (!wallet.publicKey || !wallet.signTransaction) {
            throw new Error('Wallet not connected');
        }

        const treasuryWalletAddress = import.meta.env.VITE_TREASURY_WALLET;
        if (!treasuryWalletAddress) {
            throw new Error('Treasury wallet address not configured in environment variables');
        }

        const connection = new Connection(
            `https://api.${network}.solana.com`,
            'confirmed'
        );

        const treasuryPublicKey = new PublicKey(treasuryWalletAddress);
        const fromPublicKey = wallet.publicKey;

        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: fromPublicKey,
                toPubkey: treasuryPublicKey,
                lamports: amount * LAMPORTS_PER_SOL,
            })
        );

        // Get recent blockhash and set fee payer
        const { blockhash } = await connection.getLatestBlockhash('confirmed');
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = fromPublicKey;

        // Request user signature
        const signedTransaction = await wallet.signTransaction(transaction);

        // Send the transaction
        const signature = await connection.sendRawTransaction(signedTransaction.serialize());

        // Wait for confirmation
        const confirmation = await connection.confirmTransaction(signature, 'confirmed');

        if (confirmation.value.err) {
            throw new Error('Transaction failed to confirm');
        }

        return signature;
    } catch (error) {
        console.error('Payment Error:', error);
        throw error;
    }
};
