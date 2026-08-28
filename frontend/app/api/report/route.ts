import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Initialize Resend
// Note: You must add RESEND_API_KEY to your .env.local file
const resend = new Resend(process.env.RESEND_API_KEY);

// Simple in-memory rate limiting map
// In production, you'd use Redis or Vercel KV for this
const rateLimit = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 3;

export async function POST(req: NextRequest) {
  try {
    // 1. Basic Rate Limiting (by IP)
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const now = Date.now();
    const limiter = rateLimit.get(ip);

    if (limiter && now < limiter.resetTime) {
      if (limiter.count >= MAX_REQUESTS_PER_WINDOW) {
        return NextResponse.json(
          { error: "Too many requests. Please try again later." },
          { status: 429 }
        );
      }
      limiter.count += 1;
    } else {
      rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    }

    // 2. Parse and Validate Request
    const body = await req.json();
    const { name, contact, subject, description, severity, reportType } = body;

    if (!name || !contact || !description || !reportType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 3. Construct Email Content
    // Make it look clean and readable
    const htmlContent = `
      <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #5B3DF5;">New Report Submitted: ${
          reportType === "missing_app"
            ? "Missing App"
            : reportType === "bug"
            ? "Bug Report"
            : reportType === "suggestion"
            ? "Suggestion"
            : reportType === "security"
            ? "Security Issue"
            : "Other"
        }</h2>
        
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Contact:</strong> ${contact}</p>
        
        ${
          (reportType === "bug" || reportType === "security") && severity
            ? `<p><strong>Severity:</strong> <span style="background: #fee2e2; color: #ef4444; padding: 2px 6px; border-radius: 4px;">${severity}</span></p>`
            : ""
        }
        
        <p><strong>Subject:</strong> ${subject || "N/A"}</p>
        
        <div style="background: #f4f4f5; padding: 16px; border-radius: 8px; margin-top: 16px; white-space: pre-wrap;">
          <strong>Description:</strong><br/>
          ${description}
        </div>
      </div>
    `;

    // 4. Send Email via Resend
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is not set. Simulating success for testing.");
      await new Promise((r) => setTimeout(r, 1000));
      return NextResponse.json({ success: true, simulated: true });
    }

    const data = await resend.emails.send({
      from: "BulkStoreInstaller <onboarding@resend.dev>", // Resend's default testing email
      to: "akilanraidsb25@gmail.com", // Must be your registered Resend email when using onboarding@resend.dev
      subject: `New ${reportType.replace("_", " ")}: ${subject || "No Subject"}`,
      html: htmlContent,
      replyTo: contact, // Allows you to reply directly to the person who submitted the report
    });

    if (data.error) {
      console.error("Resend API Error:", data.error);
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Server Error parsing report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
