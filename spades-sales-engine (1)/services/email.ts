import { User } from '../types';

export const EmailService = {
  sendVerificationEmail: async (user: User, token: string) => {
    // In a real environment, this calls an API endpoint that uses SendGrid/AWS SES.
    // Here, we simulate the delivery and provide a way to access the token.
    
    console.group('📧 [MOCK EMAIL SERVICE] Sending Verification Email');
    console.log(`To: ${user.email}`);
    console.log(`Subject: Verify your Automated Sales Engine account`);
    console.log(`Token: ${token}`);
    console.log(`Link: ${window.location.origin}/?verify_token=${token}`);
    console.groupEnd();

    // Simulating network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return true;
  }
};
