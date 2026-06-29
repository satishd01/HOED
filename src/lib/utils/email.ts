import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function sendInvitationEmail(
  to: string,
  documentTitle: string,
  inviterName: string,
  documentId: string,
  role: string
) {
  const documentUrl = `${APP_URL}/documents/${documentId}`;

  const mailOptions = {
    from: `"House of EdTech" <${process.env.MAIL_USER}>`,
    to,
    subject: `${inviterName} invited you to collaborate on "${documentTitle}"`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #333;">You've been invited!</h2>
        <p style="font-size: 16px; color: #555;">
          <strong>${inviterName}</strong> has invited you to collaborate on the document <strong>"${documentTitle}"</strong> as a <strong>${role}</strong>.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${documentUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Open Document
          </a>
        </div>
        <p style="font-size: 14px; color: #888;">
          If you don't have an account yet, you'll be able to create one using this email address after clicking the link.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendAccessRequestEmail(
  ownerEmail: string,
  documentTitle: string,
  requesterName: string,
  requesterEmail: string,
  documentId: string
) {
  const documentUrl = `${APP_URL}/documents/${documentId}`;

  const mailOptions = {
    from: `"House of EdTech" <${process.env.MAIL_USER}>`,
    to: ownerEmail,
    subject: `Request for access: "${documentTitle}"`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #333;">Access Request</h2>
        <p style="font-size: 16px; color: #555;">
          <strong>${requesterName}</strong> (${requesterEmail}) is requesting access to your document <strong>"${documentTitle}"</strong>.
        </p>
        <p style="font-size: 16px; color: #555;">
          To grant them access, please open your document and click the <strong>Share</strong> button.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${documentUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Open Document Settings
          </a>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
