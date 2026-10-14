import { createResendMailer } from "../src/index.js";

const mailer = createResendMailer({
  apiKey: process.env.RESEND_API_KEY!,
  from: process.env.RESEND_FROM_EMAIL!,
});

const result = await mailer.sendEmail({
  to: "customer@example.com",
  subject: "Your receipt",
  html: "<p>Your receipt is attached.</p>",
  attachments: [{ filename: "receipt.pdf", content: pdfBuffer }],
}, {
  idempotencyKey: "receipt/order-123",
});

console.log("Sent email id:", result?.id);
