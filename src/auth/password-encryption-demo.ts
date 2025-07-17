import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

/**
 * Password Encryption Utility
 * Demonstrates the different encryption methods available in the system
 */
export class PasswordEncryptionDemo {
  
  /**
   * Standard bcrypt encryption with configurable salt rounds
   */
  static async standardEncryption(password: string, saltRounds: number = 12): Promise<string> {
    console.log(`🔐 Standard bcrypt encryption with ${saltRounds} salt rounds`);
    const hash = await bcrypt.hash(password, saltRounds);
    console.log(`Original: ${password}`);
    console.log(`Hashed: ${hash}`);
    return hash;
  }

  /**
   * Enhanced encryption with additional salt from encryption key
   */
  static async enhancedEncryption(
    password: string, 
    encryptionKey: string, 
    saltRounds: number = 12
  ): Promise<string> {
    console.log(`🛡️ Enhanced encryption with additional salt from encryption key`);
    const additionalSalt = encryptionKey.substring(0, 16);
    const passwordWithSalt = password + additionalSalt;
    const hash = await bcrypt.hash(passwordWithSalt, saltRounds);
    console.log(`Original: ${password}`);
    console.log(`With Salt: ${passwordWithSalt}`);
    console.log(`Hashed: ${hash}`);
    return hash;
  }

  /**
   * Validation for standard encryption
   */
  static async validateStandard(password: string, hash: string): Promise<boolean> {
    const isValid = await bcrypt.compare(password, hash);
    console.log(`✅ Standard validation: ${isValid}`);
    return isValid;
  }

  /**
   * Validation for enhanced encryption
   */
  static async validateEnhanced(password: string, hash: string, encryptionKey: string): Promise<boolean> {
    const additionalSalt = encryptionKey.substring(0, 16);
    const passwordWithSalt = password + additionalSalt;
    const isValid = await bcrypt.compare(passwordWithSalt, hash);
    console.log(`✅ Enhanced validation: ${isValid}`);
    return isValid;
  }

  /**
   * Demo function to show both encryption methods
   */
  static async demo() {
    const testPassword = "MySecurePassword123";
    const encryptionKey = "Pz8Qm5Tn1Yr4Wk7Bg3Nj6Dx9Cl2Sv5Fh8Mp1Qt4Zx7Va0Ke3Rg6Ub9Lp2Wn5Y";
    
    console.log("=".repeat(60));
    console.log("🔐 PASSWORD ENCRYPTION DEMONSTRATION");
    console.log("=".repeat(60));
    
    // Standard encryption
    console.log("\n1. STANDARD BCRYPT ENCRYPTION:");
    console.log("-".repeat(30));
    const standardHash = await this.standardEncryption(testPassword, 12);
    await this.validateStandard(testPassword, standardHash);
    
    // Enhanced encryption
    console.log("\n2. ENHANCED ENCRYPTION WITH KEY:");
    console.log("-".repeat(30));
    const enhancedHash = await this.enhancedEncryption(testPassword, encryptionKey, 12);
    await this.validateEnhanced(testPassword, enhancedHash, encryptionKey);
    
    console.log("\n=".repeat(60));
    console.log("🔒 Both methods provide strong security!");
    console.log("💡 Use standard for most cases, enhanced for extra security");
    console.log("=".repeat(60));
  }
}

// Uncomment to run the demo
// PasswordEncryptionDemo.demo();
