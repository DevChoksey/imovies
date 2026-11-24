const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const SMTP_TIMEOUTS = {
  connectionTimeout: 8000,
  greetingTimeout: 8000,
  socketTimeout: 10000,
};

// Configure Email Transporter
const createTransporter = () => {
  // Ensure fresh .env is loaded dynamically
  require('dotenv').config({ path: path.join(__dirname, '../.env') });

  // If user provided custom SMTP or Gmail credentials in .env
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      ...SMTP_TIMEOUTS,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Gmail App Password
      },
    });
  }

  // If custom SMTP host provided
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      ...SMTP_TIMEOUTS,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return null;
};

/**
 * Send over HTTPS Port 443 via Google Apps Script Webhook (works on Render free tier)
 */
const sendViaWebhook = async ({ to, subject, text, html }) => {
  const webhookUrl = (process.env.EMAIL_WEBHOOK_URL || '').trim();
  if (!webhookUrl) return null;

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to,
      subject,
      text,
      html,
      secret: process.env.EMAIL_WEBHOOK_SECRET || '',
    }),
  });

  if (!response.ok) {
    throw new Error(`Email webhook returned HTTP ${response.status}`);
  }

  const data = await response.json().catch(() => ({ success: true }));
  if (data.success === false) {
    throw new Error(data.error || 'Email webhook rejected request');
  }
  return { success: true, provider: 'https_webhook', targetEmail: to };
};

/**
 * Send over HTTPS Port 443 via Brevo REST API (works on Render free tier)
 */
const sendViaBrevo = async ({ to, recipientName, subject, text, html }) => {
  const apiKey = (process.env.BREVO_API_KEY || '').trim();
  if (!apiKey) return null;

  const senderEmail = process.env.EMAIL_USER || 'itsnightfallarchives@gmail.com';
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      sender: { name: 'IMovies Cinema', email: senderEmail },
      to: [{ email: to, name: recipientName || 'Movie Lover' }],
      subject,
      htmlContent: html,
      textContent: text,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Brevo API returned HTTP ${response.status}`);
  }
  return { success: true, provider: 'brevo_api', messageId: data.messageId, targetEmail: to };
};

/**
 * Generate responsive BookMyShow-style cinema ticket email HTML
 */
const generateTicketHtml = (booking, recipientEmail) => {
  const movieTitle = booking.movie?.title || 'Avengers: Doomsday';
  const theatreName = booking.theatre?.name || 'PVR: Treasure Island Mall, Indore';
  const showDate = booking.show?.showDateDisplay || booking.show?.showDate || 'Thu, 17 December, 2026';
  const showTime = booking.show?.showTime || '11:05 AM';
  const screenFormat = booking.show?.screenFormat || 'MS - Infinity Vision (4DX 3D) • English';
  const seats = Array.isArray(booking.seats)
    ? booking.seats.map((s) => s.seatNumber || s).join(', ')
    : booking.seatNumbers?.join(', ') || 'Seats Reserved';
  const totalAmount = booking.grandTotal || 800;
  const bookingId = booking.bookingId || booking._id || 'IMV-2026-CONFIRMED';
  const userName = booking.user?.name || 'DEV';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your IMovies Ticket Confirmation</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0e1017; color: #ffffff; margin: 0; padding: 20px; }
    .ticket-container { max-width: 600px; margin: 0 auto; background-color: #151724; border-radius: 12px; overflow: hidden; border: 1px solid #232738; }
    .header { background: linear-gradient(135deg, #f84464 0%, #b91c1c 100%); padding: 24px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px; }
    .header p { margin: 6px 0 0 0; font-size: 14px; opacity: 0.9; }
    .content { padding: 30px; }
    .movie-banner { border-bottom: 1px dashed #2e344d; padding-bottom: 20px; margin-bottom: 20px; }
    .movie-title { font-size: 22px; font-weight: 800; color: #ffffff; margin-bottom: 4px; }
    .movie-meta { font-size: 13px; color: #9ca3af; }
    .details-grid { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .details-grid td { padding: 8px 0; font-size: 14px; vertical-align: top; }
    .details-label { color: #9ca3af; width: 35%; font-weight: 600; }
    .details-val { color: #ffffff; font-weight: 700; }
    .highlight-seats { color: #22c55e; font-size: 16px; font-weight: 800; }
    .price-box { background-color: #10121d; border-radius: 8px; padding: 16px; margin-bottom: 24px; border: 1px solid #1f2233; }
    .price-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 6px; color: #d1d5db; }
    .price-total { display: flex; justify-content: space-between; font-size: 18px; font-weight: 800; color: #22c55e; border-top: 1px solid #232738; padding-top: 10px; margin-top: 8px; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; border-top: 1px solid #1f2233; }
    .badge { display: inline-block; background-color: rgba(34, 197, 94, 0.2); color: #22c55e; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="ticket-container">
    <div class="header">
      <h1>🎬 IMovies Booking Confirmed!</h1>
      <p>Thank you, ${userName}! Your digital cinema pass is ready.</p>
    </div>

    <div class="content">
      <div class="movie-banner">
        <div class="badge">CONFIRMED RESERVATION</div>
        <div class="movie-title" style="margin-top: 8px;">${movieTitle}</div>
        <div class="movie-meta">${screenFormat}</div>
      </div>

      <table class="details-grid">
        <tr>
          <td class="details-label">Booking ID</td>
          <td class="details-val" style="color: #f84464;">${bookingId}</td>
        </tr>
        <tr>
          <td class="details-label">Cinema / Theatre</td>
          <td class="details-val">${theatreName}</td>
        </tr>
        <tr>
          <td class="details-label">Show Date</td>
          <td class="details-val">${showDate}</td>
        </tr>
        <tr>
          <td class="details-label">Showtime</td>
          <td class="details-val">${showTime}</td>
        </tr>
        <tr>
          <td class="details-label">Seats Allocated</td>
          <td class="details-val highlight-seats">${seats}</td>
        </tr>
        <tr>
          <td class="details-label">Registered Email</td>
          <td class="details-val">${recipientEmail}</td>
        </tr>
      </table>

      <div class="price-box">
        <div style="font-size: 12px; font-weight: 700; color: #9ca3af; margin-bottom: 10px; text-transform: uppercase;">
          Payment Summary
        </div>
        <div style="font-size: 14px; color: #d1d5db; margin-bottom: 4px;">
          Amount Paid: <strong>₹${totalAmount}</strong> (Incl. GST)
        </div>
        <div style="font-size: 12px; color: #22c55e;">
          Status: Payment Completed & Verified
        </div>
      </div>

      <div style="text-align: center; padding: 12px 0;">
        <p style="font-size: 13px; color: #9ca3af; margin: 0;">
          Show this email or your QR code ticket at the cinema entry gate.
        </p>
      </div>
    </div>

    <div class="footer">
      &copy; ${new Date().getFullYear()} IMovies Entertainment Pvt. Ltd. | 24/7 Support: support@imovies.com
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Send Booking Confirmation Email
 */
const sendBookingConfirmationEmail = async (booking, recipientEmail) => {
  const targetEmail = recipientEmail || booking.user?.email || 'chokseydev@gmail.com';
  const transporter = createTransporter();

  const movieTitle = booking.movie?.title || 'Avengers: Doomsday';
  const theatreName = booking.theatre?.name || 'PVR: Treasure Island Mall, Indore';
  const showDate = booking.show?.showDateDisplay || booking.show?.showDate || 'Thu, 17 December, 2026';
  const showTime = booking.show?.showTime || '11:05 AM';
  const screenFormat = booking.show?.screenFormat || 'MS - Infinity Vision (4DX 3D) • English';
  const seats = Array.isArray(booking.seats)
    ? booking.seats.map((s) => s.seatNumber || s).join(', ')
    : booking.seatNumbers?.join(', ') || 'Seats Reserved';
  const totalAmount = booking.grandTotal || 1888;
  const bookingId = booking.bookingId || booking._id || 'IMV-2026-CONFIRMED';
  const userName = booking.user?.name || 'DEV';

  const subject = `Booking Confirmation: ${movieTitle} (ID: ${bookingId})`;
  const html = generateTicketHtml(booking, targetEmail);

  // Plain-text counterpart to ensure 100% deliverability in Gmail Primary inbox
  const text = `IMOVIES CINEMA - BOOKING CONFIRMATION & M-TICKET
==================================================
Dear ${userName},

Your movie tickets have been confirmed!

• Movie: ${movieTitle}
• Cinema: ${theatreName}
• Screen / Format: ${screenFormat}
• Date & Showtime: ${showDate} at ${showTime}
• Allocated Seats: ${seats}
• Booking ID: ${bookingId}
• Total Amount Paid: Rs ${totalAmount} (Status: COMPLETED)
• Registered To: ${targetEmail}

Please present this confirmation email at the cinema entrance.
Thank you for booking with IMovies!
==================================================`;

  // 1. Prefer HTTPS Email APIs (Render free tier blocks outbound SMTP ports 25/465/587)
  if (process.env.EMAIL_WEBHOOK_URL) {
    try {
      const webhookResult = await sendViaWebhook({ to: targetEmail, subject, text, html });
      if (webhookResult?.success) {
        console.log(`[EMAIL DISPATCHED VIA WEBHOOK] Confirmation sent to ${targetEmail}`);
        return webhookResult;
      }
    } catch (err) {
      console.error(`[WEBHOOK EMAIL ERROR] ${err.message}`);
    }
  }

  if (process.env.BREVO_API_KEY) {
    try {
      const brevoResult = await sendViaBrevo({
        to: targetEmail,
        recipientName: userName,
        subject,
        text,
        html,
      });
      if (brevoResult?.success) {
        console.log(`[EMAIL DISPATCHED VIA BREVO] Confirmation sent to ${targetEmail}`);
        return brevoResult;
      }
    } catch (err) {
      console.error(`[BREVO EMAIL ERROR] ${err.message}`);
    }
  }

  if (!transporter) {
    console.warn(`[EMAIL NOTICE] No SMTP credentials configured in .env. To send live emails, set EMAIL_USER & EMAIL_PASS or EMAIL_WEBHOOK_URL.`);
    return {
      success: false,
      notice: 'Email provider not configured. Click "Open in Gmail" below to save your ticket!',
      targetEmail,
      subject,
    };
  }

  try {
    const info = await transporter.sendMail({
      from: `"IMovies Cinema" <${process.env.EMAIL_USER}>`,
      to: targetEmail,
      subject,
      text,
      html,
    });

    console.log(`[EMAIL DISPATCHED] Confirmation sent to ${targetEmail} (MessageId: ${info.messageId})`);
    return {
      success: true,
      messageId: info.messageId,
      targetEmail,
    };
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send email to ${targetEmail}:`, error.message);
    const isTimeoutOrBlocked = /timeout|ETIMEDOUT|ECONNREFUSED|EACCES/i.test(error.message);
    return {
      success: false,
      notice: isTimeoutOrBlocked
        ? 'Cloud host blocked SMTP ports (465/587). Add EMAIL_WEBHOOK_URL (Google Apps Script) on Render to enable HTTPS email delivery, or click "Open in Gmail" below!'
        : error.message,
      error: error.message,
      targetEmail,
    };
  }
};

module.exports = {
  sendBookingConfirmationEmail,
  generateTicketHtml,
};
