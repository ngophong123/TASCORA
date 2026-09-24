import nodemailer, { Transporter, TestAccount } from 'nodemailer';
import { logger } from '../../server';

export class EmailService {
  private static transporter: Transporter;
  private static testAccount: TestAccount | null = null;

  static async init() {
    if (this.transporter) return;

    // In production, you would use actual SMTP credentials
    // For this MVP/Phase 22, we use Ethereal Mail if no SMTP config is provided
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true', 
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });
      logger.info('Email service initialized with real SMTP credentials');
    } else {
      // Use Ethereal for testing
      this.testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: this.testAccount.user, // generated ethereal user
          pass: this.testAccount.pass, // generated ethereal password
        },
      });
      logger.info('Email service initialized with Ethereal Test Account');
    }
  }

  private static async sendMail(to: string, subject: string, html: string) {
    await this.init();

    try {
      const info = await this.transporter.sendMail({
        from: '"Taskora System" <noreply@taskora.com>', // sender address
        to, // list of receivers
        subject, // Subject line
        html, // html body
      });

      logger.info(`Message sent: ${info.messageId}`);
      
      // If we are using Ethereal, log the preview URL so the developer can see the email
      if (this.testAccount) {
        logger.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }

      return info;
    } catch (error) {
      logger.error('Error sending email:', error);
      throw error;
    }
  }

  // --- Specific Email Templates ---

  static async sendTestEmail(to: string) {
    const html = `
      <h1>Hello from Taskora!</h1>
      <p>This is a test email to verify the email system is working.</p>
      <p>Welcome aboard!</p>
    `;
    return this.sendMail(to, 'Test Email - Taskora', html);
  }

  static async sendOrderUpdateEmail(to: string, orderId: string, status: string) {
    const html = `
      <h2>Order Status Update</h2>
      <p>Your order <strong>#${orderId}</strong> has been updated to: <span style="color: blue;">${status}</span>.</p>
      <p>Please log in to Taskora to view the details.</p>
    `;
    return this.sendMail(to, `Order Update: #${orderId}`, html);
  }

  static async sendNewMessageEmail(to: string, senderName: string) {
    const html = `
      <h2>You have a new message!</h2>
      <p><strong>${senderName}</strong> just sent you a message on Taskora.</p>
      <a href="${process.env.NEXT_PUBLIC_WEB_URL}/messages">Click here to reply</a>
    `;
    return this.sendMail(to, `New Message from ${senderName}`, html);
  }
}
