import { Resend } from "resend";

const TO_EMAIL = process.env.CONTACT_EMAIL ?? "jauhariyuuv@gmail.com";

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, message, _hp } = body;

  // Honeypot check
  if (_hp) {
    return Response.json({ success: true }); // fake success for bots
  }

  // Validation
  if (!name || !email || !message) {
    return Response.json(
      { error: "All fields are required." },
      { status: 400 },
    );
  }

  if (typeof email !== "string" || !email.includes("@")) {
    return Response.json(
      { error: "Invalid email address." },
      { status: 400 },
    );
  }

  if (message.length > 5000) {
    return Response.json(
      { error: "Message too long (max 5000 characters)." },
      { status: 400 },
    );
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>",
      to: TO_EMAIL,
      replyTo: email,
      subject: `Portfolio Contact: ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    });

    return Response.json({ success: true });
  } catch {
    return Response.json(
      { error: "Failed to send message. Try again later." },
      { status: 500 },
    );
  }
}
