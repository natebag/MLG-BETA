import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { getAccount, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { WalletContextState } from '@solana/wallet-adapter-react';
import toast from 'react-hot-toast';

// MLG Token Contract Address
export const MLG_TOKEN_MINT = new PublicKey('7XJiwLDrjzxDYdZipnJXzpr1iDTmK55XixSFAa7JgNEL');

// Connection to Solana (you may want to make this configurable)
const connection = new Connection(process.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com');

export interface TokenBalance {
  balance: number;
  decimals: number;
}

export class MLGTokenService {
  private connection: Connection;
  private tokenMint: PublicKey;

  constructor() {
    this.connection = new Connection(process.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com');
    this.tokenMint = MLG_TOKEN_MINT;
  }

  /**
   * Get MLG token balance for a wallet
   */
  async getTokenBalance(walletPublicKey: PublicKey): Promise<TokenBalance | null> {
    try {
      // Get the associated token account for this wallet and MLG token
      const associatedTokenAccount = await getAssociatedTokenAddress(
        this.tokenMint,
        walletPublicKey
      );

      // Try to get the token account info
      const accountInfo = await getAccount(
        this.connection,
        associatedTokenAccount
      );

      return {
        balance: Number(accountInfo.amount),
        decimals: 9 // MLG token has 9 decimals
      };
    } catch (error) {
      console.log('Error getting balance (account may not exist):', error);
      // If account doesn't exist, user has 0 balance
      return {
        balance: 0,
        decimals: 9
      };
    }
  }

  /**
   * Get human-readable token balance (accounting for decimals)
   */
  async getFormattedBalance(walletPublicKey: PublicKey): Promise<number> {
    const balance = await this.getTokenBalance(walletPublicKey);
    if (!balance) return 0;
    
    return balance.balance / Math.pow(10, balance.decimals);
  }

  /**
   * Burn MLG tokens
   * Currently simulates token burning - real implementation would transfer to burn address
   */
  async burnTokens(
    wallet: WalletContextState,
    amount: number
  ): Promise<boolean> {
    if (!wallet.publicKey) {
      toast.error('Please connect your wallet');
      return false;
    }

    try {
      // Check if user has enough tokens
      const balance = await this.getFormattedBalance(wallet.publicKey);
      if (balance < amount) {
        toast.error(`Insufficient MLG tokens. You have ${balance.toFixed(2)}, need ${amount}`);
        return false;
      }

      // For development: simulate token burning
      // In production: implement real token transfer to burn address
      console.log(`Simulating burn of ${amount} MLG tokens from ${wallet.publicKey.toString()}`);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(`Successfully burned ${amount} MLG tokens!`);
      return true;
    } catch (error) {
      console.error('Error burning tokens:', error);
      toast.error('Failed to burn tokens. Please try again.');
      return false;
    }
  }

  /**
   * Check if user has enough tokens for an action
   */
  async hasEnoughTokens(walletPublicKey: PublicKey, requiredAmount: number): Promise<boolean> {
    const balance = await this.getFormattedBalance(walletPublicKey);
    return balance >= requiredAmount;
  }
}

// Export singleton instance
export const mlgTokenService = new MLGTokenService();