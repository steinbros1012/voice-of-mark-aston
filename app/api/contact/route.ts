import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// --- Rate limiting (in-memory, per IP, 5 requests per minute) ---
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }

  rateLimitMap.set(ip, { ...entry, count: entry.count + 1 });
  return false;
}

// --- Input sanitization ---
function sanitizeString(value: unknown, maxLength = 1000): string {
  if (typeof value !== "string") return "";
  return value
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, "");
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// --- Route handler ---
export async function POST(request: NextRequest) {
  // IP-based rate limiting
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429 }
    );
  }

  // Parse body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;

  // Sanitize inputs
  const name = sanitizeString(raw.name, 100);
  const email = sanitizeString(raw.email, 200);
  const phone = sanitizeString(raw.phone, 30);
  const projectType = sanitizeString(raw.projectType, 100);
  const budget = sanitizeString(raw.budget, 50);
  const message = sanitizeString(raw.message, 5000);

  // Validate required fields
  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 422 });
  }
  if (!email || !isValidEmail(email)) {
    return NextResponse.json(
      { error: "A valid email address is required." },
      { status: 422 }
    );
  }
  if (!projectType) {
    return NextResponse.json(
      { error: "Project type is required." },
      { status: 422 }
    );
  }
  if (!message) {
    return NextResponse.json(
      { error: "Message is required." },
      { status: 422 }
    );
  }

  // Send email
  const gmailUser = process.env.GMAIL_USER;
  const gmailPassword = process.env.GMAIL_APP_PASSWORD;
  const contactEmail = process.env.CONTACT_EMAIL ?? "steinbros1012@gmail.com";

  if (!gmailUser || !gmailPassword) {
    return NextResponse.json(
      { error: "Mail service is not configured." },
      { status: 503 }
    );
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser,
      pass: gmailPassword,
    },
  });

  const emailBody = `
New booking inquiry from The Voice of Mark Aston website.

---

Name:          ${name}
Email:         ${email}
Phone:         ${phone || "Not provided"}
Project Type:  ${projectType}
Budget:        ${budget || "Not specified"}

Message:
${message}

---

Submitted from IP: ${ip}
`.trim();

  const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px; color: #111111;">
  <div style="border-bottom: 2px solid #1A3A5C; padding-bottom: 16px; margin-bottom: 24px;">
    <h1 style="font-size: 20px; color: #1A3A5C; margin: 0;">New Booking Inquiry</h1>
    <p style="font-size: 13px; color: #6B7280; margin: 4px 0 0;">The Voice of Mark Aston</p>
  </div>

  <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
    <tr><td style="padding: 8px 0; color: #6B7280; width: 120px; vertical-align: top;">Name</td><td style="padding: 8px 0; font-weight: 600;">${name}</td></tr>
    <tr><td style="padding: 8px 0; color: #6B7280; vertical-align: top;">Email</td><td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #1A3A5C;">${email}</a></td></tr>
    <tr><td style="padding: 8px 0; color: #6B7280; vertical-align: top;">Phone</td><td style="padding: 8px 0;">${phone || "Not provided"}</td></tr>
    <tr><td style="padding: 8px 0; color: #6B7280; vertical-align: top;">Project Type</td><td style="padding: 8px 0;">${projectType}</td></tr>
    <tr><td style="padding: 8px 0; color: #6B7280; vertical-align: top;">Budget</td><td style="padding: 8px 0;">${budget || "Not specified"}</td></tr>
  </table>

  <div style="border-top: 1px solid #E5E5E5; padding-top: 16px;">
    <p style="color: #6B7280; font-size: 12px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.1em;">Message</p>
    <p style="font-size: 14px; line-height: 1.7; white-space: pre-wrap;">${message}</p>
  </div>

  <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #E5E5E5; font-size: 11px; color: #9CA3AF;">
    Submitted from IP: ${ip}
  </div>
</body>
</html>
`.trim();

  try {
    await transporter.sendMail({
      from: `"VOMA Website" <${gmailUser}>`,
      to: contactEmail,
      replyTo: email,
      subject: `New Booking Inquiry — ${name} (${projectType})`,
      text: emailBody,
      html: htmlBody,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown error sending email.";
    console.error("[contact/route] Failed to send email:", err);
    return NextResponse.json(
      { error: `Failed to send message: ${message}` },
      { status: 500 }
    );
  }
}
