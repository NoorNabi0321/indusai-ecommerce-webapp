import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../config/env';
import { logger } from './logger';

let cachedTransporter: Transporter | null = null;
let resolved = false;

/**
 * Lazily build an SMTP transporter from configured providers. Currently wired
 * for Resend SMTP; any SMTP provider can be swapped in here. Returns `null`
 * when no provider is configured — callers then log to the console (dev).
 */
function getTransporter(): Transporter | null {
  if (resolved) return cachedTransporter;
  resolved = true;

  if (env.RESEND_API_KEY) {
    cachedTransporter = nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 465,
      secure: true,
      auth: { user: 'resend', pass: env.RESEND_API_KEY },
    });
    logger.info('Email transport: Resend SMTP.');
  } else {
    logger.warn('Email transport: none configured — emails will be logged to console.');
  }
  return cachedTransporter;
}

async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<void> {
  const transporter = getTransporter();

  if (!transporter) {
    logger.info(
      `📧 [console-email] To: ${params.to}\n   Subject: ${params.subject}\n   ${params.text}`,
    );
    return;
  }

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
  });
  logger.info(`📧 Email sent to ${params.to}: "${params.subject}"`);
}

// ─────────────────────────── Branded template ────────────────────────────

function wrapTemplate(heading: string, bodyHtml: string): string {
  return `
  <div style="background:#0D0D0F;padding:32px 0;font-family:Inter,Arial,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#161618;border:1px solid rgba(255,255,255,0.08);border-radius:14px;overflow:hidden;">
      <div style="padding:24px 32px;border-bottom:1px solid rgba(255,255,255,0.08);">
        <span style="font-size:18px;font-weight:700;color:#FFFFFF;">Indus<span style="color:#E4A93A;">AI</span></span>
      </div>
      <div style="padding:32px;">
        <h1 style="margin:0 0 16px;font-size:20px;color:#FFFFFF;">${heading}</h1>
        <div style="font-size:15px;line-height:1.6;color:#B0AFAC;">${bodyHtml}</div>
      </div>
      <div style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.08);font-size:12px;color:#6E6D69;">
        © ${new Date().getFullYear()} IndusAI Technology · Premium shopping, powered by AI.
      </div>
    </div>
  </div>`;
}

function otpBlock(code: string): string {
  return `<div style="margin:24px 0;text-align:center;">
    <span style="display:inline-block;padding:14px 28px;background:#1F1F22;border:1px solid #C9902A;border-radius:10px;font-size:28px;letter-spacing:8px;font-weight:700;color:#FDD98A;">${code}</span>
  </div>`;
}

// ─────────────────────────────── Senders ─────────────────────────────────

export function sendVerificationEmail(to: string, name: string, otp: string): Promise<void> {
  const html = wrapTemplate(
    'Verify your email',
    `<p>Hi ${name},</p><p>Use this code to verify your IndusAI account. It expires in 10 minutes.</p>${otpBlock(otp)}<p>If you didn't sign up, you can ignore this email.</p>`,
  );
  return sendEmail({
    to,
    subject: 'Verify your IndusAI account',
    html,
    text: `Hi ${name}, your IndusAI verification code is ${otp} (expires in 10 minutes).`,
  });
}

export function sendPasswordResetEmail(to: string, name: string, otp: string): Promise<void> {
  const html = wrapTemplate(
    'Reset your password',
    `<p>Hi ${name},</p><p>Use this code to reset your password. It expires in 10 minutes.</p>${otpBlock(otp)}<p>If you didn't request this, your account is still safe — just ignore this email.</p>`,
  );
  return sendEmail({
    to,
    subject: 'Reset your IndusAI password',
    html,
    text: `Hi ${name}, your IndusAI password reset code is ${otp} (expires in 10 minutes).`,
  });
}

export function sendAdminWelcomeEmail(
  to: string,
  name: string,
  tempPassword: string,
): Promise<void> {
  const html = wrapTemplate(
    'Welcome to the IndusAI Admin Portal',
    `<p>Hi ${name},</p><p>An administrator account has been created for you. Sign in with the temporary password below and change it on first login.</p>${otpBlock(tempPassword)}`,
  );
  return sendEmail({
    to,
    subject: 'Your IndusAI administrator account',
    html,
    text: `Hi ${name}, your temporary IndusAI admin password is ${tempPassword}. Please change it after signing in.`,
  });
}

export function sendOrderConfirmationEmail(
  to: string,
  name: string,
  orderNumber: string,
  total: string,
): Promise<void> {
  const html = wrapTemplate(
    'Order confirmed 🎉',
    `<p>Hi ${name},</p><p>Thanks for your order! We've received <strong style="color:#FFFFFF;">${orderNumber}</strong> and are getting it ready.</p><p style="font-size:17px;color:#FDD98A;">Total: ${total}</p>`,
  );
  return sendEmail({
    to,
    subject: `Order ${orderNumber} confirmed`,
    html,
    text: `Hi ${name}, your IndusAI order ${orderNumber} is confirmed. Total: ${total}.`,
  });
}
