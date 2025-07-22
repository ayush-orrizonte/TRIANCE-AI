import nodemailer from 'nodemailer';
import { LoggerUtils } from "../audit";
import { EnvUtils } from "../config/envUtils";

export class MailerUtils {
  private transporter: nodemailer.Transporter;
  private logger = LoggerUtils.getLogger("MailerUtils");
  private static instance: MailerUtils | null = null;

  constructor() {
    const nodemailerUser = EnvUtils.getString("NODEMAILER_USER");
    const nodemailerPassword = EnvUtils.getString("NODEMAILER_PASSWORD");

    this.transporter = nodemailer.createTransport({
      service: EnvUtils.getString("NODEMAILER_SERVICE", "Gmail"),
      host: EnvUtils.getString("NODEMAILER_HOST", "smtp.gmail.com"),
      port: EnvUtils.getNumber("NODEMAILER_PORT", 465),
      secure: EnvUtils.getBoolean("NODEMAILER_SECURE_ACCESS", true),
      requireTLS: EnvUtils.getBoolean("NODEMAILER_TLS_REQUIRED", true),
      auth: {
        user: nodemailerUser,
        pass: nodemailerPassword,
      },
    });

    this.logger.info("Transporter initialized successfully");
  }

  public static getInstance(): MailerUtils {
    if (!MailerUtils.instance) {
      MailerUtils.instance = new MailerUtils();
    }
    return MailerUtils.instance;
  }

  public async sendEmail(
    subject: string,
    bodyHTML: string,
    toEmail: string,
    cc: string[] = [],
    bcc: string[] = [],
    attachments: { filename: string; content: string }[] = []
  ): Promise<void> {
    try {
      if (!this.transporter) {
        throw new Error("Mailer transporter is not initialized.");
      }

      await this.transporter.sendMail({
        from: EnvUtils.getString("NODEMAILER_USER"),
        to: toEmail ? toEmail : EnvUtils.getString("NODEMAILER_USER"),
        cc,
        bcc,
        subject,
        html: bodyHTML,
        attachments: attachments.map((attachment) => ({
          filename: attachment.filename,
          content: attachment.content,
          encoding: "base64",
        })),
      });

      this.logger.info(
        `sendEmail :: Email sent successfully to ${toEmail} :: CC :: ${cc.join(
          ","
        )} :: BCC: ${bcc.join(",")}`
      );
    } catch (error: any) {
      this.logger.error(`sendEmail :: Failed to send email :: ${error.message}`);
      throw error;
    }
  }
}