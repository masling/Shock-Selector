import { NextResponse } from "next/server";
import { ContactFormSchema } from "@/lib/contact/schemas";

type RateLimitEntry = {
  count: number;
  windowStart: number;
};

const rateLimiter = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 3;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimiter.get(ip);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimiter.set(ip, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  entry.count++;
  return true;
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, message: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const validation = ContactFormSchema.safeParse(body);

    if (!validation.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of validation.error.issues) {
        const field = issue.path[0]?.toString() ?? "unknown";
        if (!errors[field]) errors[field] = [];
        errors[field].push(issue.message);
      }
      return NextResponse.json(
        { success: false, errors },
        { status: 400 },
      );
    }

    const { name, email, company, phone, message } = validation.data;

    const resendApiKey = process.env.RESEND_API_KEY;
    const contactEmailTo = process.env.CONTACT_EMAIL_TO;

    if (resendApiKey && contactEmailTo) {
      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "EKD Contact <onboarding@resend.dev>",
          to: [contactEmailTo],
          subject: `New inquiry from ${name} — EKD Contact Form`,
          text: [
            `Name: ${name}`,
            `Email: ${email}`,
            company ? `Company: ${company}` : null,
            phone ? `Phone: ${phone}` : null,
            "",
            "Message:",
            message,
          ].filter(Boolean).join("\n"),
        }),
      });

      if (!resendResponse.ok) {
        console.error("Resend API error:", await resendResponse.text());
        return NextResponse.json(
          { success: false, message: "Failed to send message. Please try again later or email us directly." },
          { status: 500 },
        );
      }
    } else {
      console.log("Contact form submission (no email service configured):", {
        name, email, company, phone, message,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Thank you for your message. We will get back to you soon.",
    });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send message. Please try again later or email us directly." },
      { status: 500 },
    );
  }
}
