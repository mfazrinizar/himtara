import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const CONTACT_EMAIL = process.env.CONTACT_EMAIL;

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute (ms)
const RATE_LIMIT_MAX = 3;
const ipCache = new Map<string, { count: number; last: number }>();

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const entry = ipCache.get(ip);

  if (entry) {
    if (now - entry.last < RATE_LIMIT_WINDOW) {
      if (entry.count >= RATE_LIMIT_MAX) {
        return NextResponse.json(
          { error: "Terlalu banyak permintaan. Silakan tunggu sebentar." },
          { status: 429 }
        );
      }
      entry.count += 1;
      ipCache.set(ip, entry);
    } else {
      ipCache.set(ip, { count: 1, last: now });
    }
  } else {
    ipCache.set(ip, { count: 1, last: now });
  }

  const body = await req.json();
  const { name, email, subject, message } = body;

  if (!name || !email || !subject || !message) {
    return NextResponse.json(
      { error: "Semua field harus diisi" },
      { status: 400 }
    );
  }

  try {
    await resend.emails.send({
      from: "Hidden Gems Contact <" + CONTACT_EMAIL + ">",
      to: [process.env.CONTACT_TO_EMAIL!],
      subject: `[Hidden Gems] ${subject}`,
      replyTo: email,
      html: `
        <h2>Pesan Baru dari Contact Form</h2>
        <p><strong>Nama:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subjek:</strong> ${subject}</p>
        <p><strong>Pesan:</strong><br/>${message.replace(/\n/g, "<br/>")}</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
