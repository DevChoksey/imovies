import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { bookingService } from '../services/api';
import {
  CheckCircle2,
  Ticket,
  Printer,
  ArrowRight,
  Home,
  Calendar,
  Clock,
  MapPin,
  Mail,
  ExternalLink,
  Send,
} from 'lucide-react';

const BookingSuccessPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!booking);
  const [emailStatus, setEmailStatus] = useState(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  useEffect(() => {
    if (!booking && id) {
      // Check localStorage first
      try {
        const stored = JSON.parse(localStorage.getItem('imovies_user_bookings') || '[]');
        const found = stored.find((b) => b._id === id || b.bookingId === id);
        if (found) {
          setBooking(found);
          setLoading(false);
          return;
        }
      } catch (_) {}

      const fetchBooking = async () => {
        try {
          const res = await bookingService.getBookingById(id);
          if (res.data?.success) {
            setBooking(res.data.data);
          }
        } catch (err) {
          console.error('Error fetching booking confirmation:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchBooking();
    }
  }, [id, booking]);

  const handlePrint = () => {
    window.print();
  };

  const recipientEmail = booking?.user?.email || 'chokseydev@gmail.com';

  const getGmailComposeUrl = () => {
    if (!booking) return '';
    const movieTitle = booking.movie?.title || 'Avengers: Doomsday';
    const theatre = booking.theatre?.name || 'PVR: Treasure Island Mall, Indore';
    const date = booking.show?.showDateDisplay || booking.show?.showDate || 'Thu, 17 December, 2026';
    const time = booking.show?.showTime || '11:05 AM';
    const seats = Array.isArray(booking.seats)
      ? booking.seats.map((s) => s.seatNumber || s).join(', ')
      : booking.seatNumbers?.join(', ') || 'Seats Reserved';
    const amount = booking.grandTotal || 800;
    const bId = booking.bookingId || booking._id;

    const subject = encodeURIComponent(`🎬 IMovies Booking Confirmed: ${movieTitle} (ID: ${bId})`);
    const body = encodeURIComponent(`🎬 IMOVIES CINEMA - BOOKING CONFIRMATION & M-TICKET
==================================================
Dear ${booking.user?.name || 'DEV'},

Your movie tickets have been confirmed! Here are your show details:

• Movie: ${movieTitle} (${booking.movie?.certificate || 'UA16+'})
• Cinema: ${theatre}
• Screen / Format: ${booking.show?.screenFormat || '4DX 3D'}
• Date & Showtime: ${date} at ${time}
• Allocated Seats: ${seats}
• Booking Reference: ${bId}
• Total Amount Paid: ₹${amount} (Payment Status: COMPLETED)
• Registered To: ${recipientEmail}

Please display this digital confirmation email at the cinema entrance.
Enjoy your movie!
==================================================`);

    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipientEmail)}&su=${subject}&body=${body}`;
  };

  const handleSendEmailApi = async () => {
    if (!booking) return;
    try {
      setIsSendingEmail(true);
      setEmailStatus('Sending confirmation email...');
      const res = await bookingService.sendEmail(booking._id || booking.bookingId, {
        email: recipientEmail,
        booking,
        grandTotal: booking.grandTotal,
      });

      if (res.data?.success) {
        setEmailStatus(`✓ Confirmation email sent directly to ${recipientEmail}!`);
      } else {
        setEmailStatus(res.data?.message || 'Email dispatch logged.');
      }
    } catch (e) {
      // If backend not running or no SMTP, provide clear feedback + 1-click fallback
      setEmailStatus(`Notice: Background SMTP service is offline. Click "Open in Gmail" below to view and save in your Gmail inbox!`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading booking confirmation ticket...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2>Booking details not found</h2>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '20px' }}>
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container fade-in" style={{ padding: '50px 0 80px 0', maxWidth: '780px' }}>
      {/* Success Badge */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(16, 185, 129, 0.15)',
          color: '#10b981',
          marginBottom: '16px',
        }}>
          <CheckCircle2 size={36} />
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>
          Booking Confirmed!
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Your tickets have been reserved. Confirmation sent to your registered account.
        </p>
      </div>

      {/* Modern Cinema Ticket Card */}
      <div
        id="printable-ticket"
        style={{
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)',
          marginBottom: '32px',
        }}
      >
        {/* Ticket Header Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #e50914, #8b0000)',
          padding: '20px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#fff',
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9 }}>
              Cinema Admission Pass
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              ID: {booking.bookingId}
            </div>
          </div>
          <Ticket size={28} />
        </div>

        {/* Ticket Body */}
        <div style={{ padding: '28px', display: 'flex', flexWrap: 'wrap', gap: '28px' }}>
          {/* Poster thumbnail */}
          <img
            src={booking.movie?.posterImage}
            alt={booking.movie?.title}
            style={{ width: '110px', height: '150px', borderRadius: '8px', objectFit: 'cover' }}
          />

          <div style={{ flex: 1, minWidth: '220px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '6px' }}>
              {booking.movie?.title}
            </h2>
            <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              {booking.theatre?.name}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '14px',
              fontSize: '0.85rem',
            }}>
              <div>
                <span style={{ color: 'var(--text-dim)', display: 'block' }}>Date</span>
                <strong>{booking.show?.showDate}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)', display: 'block' }}>Show Time</span>
                <strong style={{ color: '#10b981' }}>{booking.show?.showTime}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)', display: 'block' }}>Screen</span>
                <strong>Audi {booking.show?.screenNumber || 1}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)', display: 'block' }}>Seats</span>
                <strong style={{ color: 'var(--accent)' }}>
                  {booking.seats?.map((s) => s.seatNumber).join(', ')}
                </strong>
              </div>
            </div>
          </div>

          {/* QR Code Container */}
          {booking.qrCodeData && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#fff',
              padding: '12px',
              borderRadius: '8px',
              alignSelf: 'center',
            }}>
              <img
                src={booking.qrCodeData}
                alt="Ticket QR Code"
                style={{ width: '100px', height: '100px' }}
              />
              <span style={{ fontSize: '0.65rem', color: '#333', fontWeight: 700, marginTop: '4px' }}>
                SCAN AT ENTRY
              </span>
            </div>
          )}
        </div>

        {/* Ticket Footer Tear-off strip */}
        <div style={{
          background: 'var(--bg-card)',
          borderTop: '2px dashed var(--border-color)',
          padding: '16px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.9rem',
        }}>
          <div>
            <span style={{ color: 'var(--text-dim)' }}>Total Amount Paid: </span>
            <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>₹{booking.grandTotal}</strong>
          </div>
          <span className="badge badge-green">Payment Completed</span>
        </div>
      </div>

      {/* Gmail Ticket Delivery Strip */}
      <div style={{
        background: '#151724',
        border: '1px solid #1f2233',
        borderRadius: '10px',
        padding: '20px 24px',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            width: '42px',
            height: '42px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ef4444',
            flexShrink: 0,
          }}>
            <Mail size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#fff' }}>
              Gmail Confirmation & M-Ticket Pass
            </div>
            <div style={{ fontSize: '0.82rem', color: '#9ca3af', marginTop: '2px' }}>
              Send full movie ticket confirmation to <strong style={{ color: '#fff' }}>{recipientEmail}</strong>
            </div>
            {emailStatus && (
              <div style={{ fontSize: '0.8rem', color: '#60a5fa', marginTop: '6px', fontWeight: 600 }}>
                {emailStatus}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleSendEmailApi}
            disabled={isSendingEmail}
            className="btn btn-secondary btn-sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.84rem',
              fontWeight: 700,
            }}
          >
            <Send size={14} color="#f84464" />
            <span>{isSendingEmail ? 'Dispatching...' : 'Dispatch Email'}</span>
          </button>

          <a
            href={getGmailComposeUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.84rem',
              fontWeight: 700,
              background: '#ea4335', // Official Google Red
              border: 'none',
              textDecoration: 'none',
            }}
          >
            <ExternalLink size={14} />
            <span>Open in Gmail</span>
          </a>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <button onClick={handlePrint} className="btn btn-secondary">
          <Printer size={16} /> Print / Save PDF
        </button>
        <Link to="/my-bookings" className="btn btn-primary">
          <Ticket size={16} /> View My Bookings
        </Link>
        <Link to="/" className="btn btn-secondary">
          <Home size={16} /> Browse More Movies
        </Link>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-ticket, #printable-ticket * {
            visibility: visible;
          }
          #printable-ticket {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default BookingSuccessPage;
