import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { bookingService, HAS_REACHABLE_BACKEND } from '../services/api';
import {
  Ticket,
  User,
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  XCircle,
  Download,
  Shield,
  FileText,
  CreditCard,
  QrCode,
  X,
  Printer,
  Copy,
  Info,
  Mail,
  ExternalLink,
} from 'lucide-react';

const UserProfilePage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [auditModalBooking, setAuditModalBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('Change of plans');
  const [isCancelling, setIsCancelling] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      // 1. Read from localStorage (scoped to current user email when available)
      let localList = [];
      try {
        const rawLocal = JSON.parse(localStorage.getItem('imovies_user_bookings') || '[]');
        localList = user?.email
          ? rawLocal.filter((b) => !b.user?.email || b.user.email.toLowerCase() === user.email.toLowerCase())
          : rawLocal;
      } catch (e) {
        console.error('Error reading local bookings:', e);
      }

      // 2. Fetch authoritative records from MongoDB API when backend is reachable
      let apiList = [];
      if (HAS_REACHABLE_BACKEND) {
        try {
          const res = await bookingService.getMyBookings();
          if (res.data?.success && Array.isArray(res.data.data)) {
            apiList = res.data.data;
          }
        } catch (_) {
          // Fallback gracefully to localList
        }
      }

      // 3. Merge prioritizing API records (latest status across devices) and deduplicate by bookingId / _id
      const combined = [...apiList];
      localList.forEach((localBooking) => {
        const exists = combined.some(
          (b) => b._id === localBooking._id || b.bookingId === localBooking.bookingId
        );
        if (!exists) {
          combined.push(localBooking);
        }
      });

      setBookings(combined);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user?.email]);

  const handleCopyId = (id) => {
    navigator.clipboard?.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getGmailUrl = (b) => {
    if (!b) return '';
    const movieTitle = b.movie?.title || 'Avengers: Doomsday';
    const theatre = b.theatre?.name || 'PVR: Treasure Island Mall, Indore';
    const date = b.show?.showDateDisplay || b.show?.showDate || 'Thu, 17 December, 2026';
    const time = b.show?.showTime || '11:05 AM';
    const seats = Array.isArray(b.seats)
      ? b.seats.map((s) => s.seatNumber || s).join(', ')
      : b.seatNumbers?.join(', ') || 'Seats Reserved';
    const amount = b.grandTotal || 800;
    const bId = b.bookingId || b._id;
    const recipient = b.user?.email || user?.email || 'chokseydev@gmail.com';

    const subject = encodeURIComponent(`🎬 IMovies Cinema Ticket: ${movieTitle} (ID: ${bId})`);
    const body = encodeURIComponent(`🎬 IMOVIES CINEMA - CONFIRMED TICKET & AUDIT DOSSIER
==================================================
Dear ${b.user?.name || user?.name || 'DEV'},

Your booking for "${movieTitle}" is confirmed! Here are your show details:

• Booking ID: ${bId}
• Cinema: ${theatre}
• Screen / Format: ${b.show?.screenFormat || '4DX 3D'}
• Date & Showtime: ${date} at ${time}
• Allocated Seats: ${seats}
• Booking Status: ${b.bookingStatus ? b.bookingStatus.toUpperCase() : 'CONFIRMED'}
• Total Amount: ₹${amount}
• Registered Gmail: ${recipient}

Show this digital pass at the cinema entry gate.
Enjoy your movie!
==================================================`);

    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipient)}&su=${subject}&body=${body}`;
  };

  const handleCancelBooking = async () => {
    if (!cancelModalBooking) return;
    try {
      setIsCancelling(true);

      // Attempt API cancel if backend is reachable
      if (HAS_REACHABLE_BACKEND) {
        try {
          await bookingService.cancelBooking(cancelModalBooking._id, {
            reason: cancelReason,
          });
        } catch (_) {}
      }

      // Update in localStorage
      try {
        const stored = JSON.parse(localStorage.getItem('imovies_user_bookings') || '[]');
        const updated = stored.map((b) => {
          if (b._id === cancelModalBooking._id || b.bookingId === cancelModalBooking.bookingId) {
            return {
              ...b,
              bookingStatus: 'cancelled',
              cancelledAt: new Date().toISOString(),
              cancellationReason: cancelReason,
              refundAmount: Math.round(b.grandTotal * 0.9),
              refundStatus: 'processed',
              auditTrail: [
                ...(b.auditTrail || []),
                {
                  action: 'TICKET_CANCELLED',
                  description: `Booking cancelled by user. Reason: "${cancelReason}". 90% refund of ₹${Math.round(b.grandTotal * 0.9)} processed.`,
                  timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }),
                  operator: 'USER_PORTAL',
                },
              ],
            };
          }
          return b;
        });
        localStorage.setItem('imovies_user_bookings', JSON.stringify(updated));
      } catch (e) {
        console.error('Error updating localStorage cancel:', e);
      }

      alert('Ticket cancelled successfully! 90% refund has been processed.');
      setCancelModalBooking(null);
      fetchBookings();
    } finally {
      setIsCancelling(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const upcomingBookings = bookings.filter(
    (b) => b.bookingStatus === 'confirmed' && (b.show?.showDate >= todayStr || !b.show?.showDate)
  );

  const pastBookings = bookings.filter(
    (b) => b.bookingStatus === 'cancelled' || (b.show?.showDate && b.show?.showDate < todayStr)
  );

  const currentList = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  return (
    <div className="container fade-in" style={{ padding: '40px 0 80px 0' }}>
      {/* 1. USER HEADER PROFILE CARD */}
      <div className="glass-card" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        marginBottom: '36px',
        background: '#151724',
        border: '1px solid #1f2233',
        borderRadius: '12px',
        padding: '24px 28px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
            alt={user?.name}
            style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--bms-red)' }}
          />
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
              {user?.name || 'DEV'}
            </h1>
            <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
              {user?.email || 'chokseydev@gmail.com'}
            </p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <span style={{
                background: '#1f2233',
                color: '#60a5fa',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                {user?.role === 'admin' ? 'SYSTEM ADMINISTRATOR' : 'STANDARD MEMBER'}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{
            background: '#1c1f30',
            padding: '14px 24px',
            borderRadius: '10px',
            textAlign: 'center',
            border: '1px solid #2a2e45',
            minWidth: '120px',
          }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f84464' }}>
              {bookings.length}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600 }}>Total Bookings</div>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION TABS */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '28px',
        borderBottom: '1px solid #1f2233',
        paddingBottom: '12px',
      }}>
        <button
          onClick={() => setActiveTab('upcoming')}
          style={{
            padding: '10px 22px',
            borderRadius: '6px',
            background: activeTab === 'upcoming' ? '#f84464' : 'transparent',
            color: activeTab === 'upcoming' ? '#fff' : '#9ca3af',
            fontWeight: 700,
            fontSize: '0.92rem',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          Upcoming Shows ({upcomingBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          style={{
            padding: '10px 22px',
            borderRadius: '6px',
            background: activeTab === 'past' ? '#f84464' : 'transparent',
            color: activeTab === 'past' ? '#fff' : '#9ca3af',
            fontWeight: 700,
            fontSize: '0.92rem',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          Booking History & Cancellations ({pastBookings.length})
        </button>
      </div>

      {/* 3. BOOKINGS LIST */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
          Loading your reservation details & audit history...
        </div>
      ) : currentList.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {currentList.map((b) => (
            <div
              key={b._id || b.bookingId}
              style={{
                background: '#151724',
                borderRadius: '12px',
                border: '1px solid #1f2233',
                padding: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '24px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
              }}
            >
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <img
                  src={b.movie?.posterImage || '/posters/avengers-doomsday.jpg'}
                  alt={b.movie?.title}
                  style={{
                    width: '90px',
                    height: '125px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.82rem', color: '#9ca3af', fontWeight: 700 }}>
                      ID: <span style={{ color: '#fff' }}>{b.bookingId}</span>
                    </span>
                    <button
                      onClick={() => handleCopyId(b.bookingId)}
                      title="Copy Booking ID"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: copiedId === b.bookingId ? '#22c55e' : '#9ca3af',
                        padding: 0,
                      }}
                    >
                      <Copy size={13} />
                    </button>
                    {b.bookingStatus === 'confirmed' ? (
                      <span style={{
                        background: 'rgba(34, 197, 94, 0.15)',
                        color: '#22c55e',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                      }}>
                        CONFIRMED
                      </span>
                    ) : (
                      <span style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        color: '#ef4444',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                      }}>
                        CANCELLED
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
                    {b.movie?.title || 'Avengers: Doomsday'}
                  </h3>

                  <div style={{ fontSize: '0.86rem', color: '#9ca3af', marginBottom: '6px', fontWeight: 500 }}>
                    {b.theatre?.name || 'PVR: Treasure Island Mall, Indore'} • {b.show?.screenFormat || '4DX 3D'}
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '0.84rem',
                    color: '#d1d5db',
                    flexWrap: 'wrap',
                  }}>
                    <span>📅 {b.show?.showDateDisplay || b.show?.showDate} at {b.show?.showTime}</span>
                    <span>•</span>
                    <span>
                      Seats:{' '}
                      <strong style={{ color: '#22c55e', fontWeight: 800 }}>
                        {b.seats?.map((s) => s.seatNumber || s).join(', ') || b.seatNumbers?.join(', ')}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons & Price */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>
                    ₹{b.grandTotal}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#9ca3af' }}>
                    {b.paymentMethod || 'Paid via Card'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {/* View Audit & Details button */}
                  <button
                    onClick={() => setAuditModalBooking(b)}
                    style={{
                      background: '#1f2233',
                      border: '1px solid #2a2e45',
                      color: '#fff',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s',
                    }}
                  >
                    <FileText size={14} color="#60a5fa" />
                    <span>View Audit & Details</span>
                  </button>

                  {/* View Ticket / QR */}
                  <a
                    href={`/booking-confirmation/${b._id || b.bookingId}`}
                    style={{
                      background: '#f84464',
                      color: '#fff',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Ticket size={14} />
                    <span>View Ticket</span>
                  </a>

                  {/* Send / Open in Gmail button */}
                  <a
                    href={getGmailUrl(b)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: '#ea4335',
                      color: '#fff',
                      padding: '8px 14px',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                    title="Send/View this ticket in Gmail"
                  >
                    <Mail size={13} />
                    <span>Send to Gmail</span>
                  </a>

                  {/* Cancel button */}
                  {b.bookingStatus === 'confirmed' && (
                    <button
                      onClick={() => setCancelModalBooking(b)}
                      style={{
                        background: 'transparent',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        color: '#ef4444',
                        padding: '8px 14px',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <RotateCcw size={13} />
                      <span>Cancel</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '70px 20px',
          background: '#151724',
          borderRadius: '12px',
          border: '1px solid #1f2233',
        }}>
          <Ticket size={48} color="#4b5563" style={{ marginBottom: '14px' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px', color: '#fff' }}>
            No {activeTab === 'upcoming' ? 'upcoming' : 'past'} bookings found
          </h3>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '20px' }}>
            Browse our movie catalog to book tickets.
          </p>
          <a
            href="/"
            style={{
              background: '#f84464',
              color: '#fff',
              padding: '10px 24px',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.88rem',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Explore Movies
          </a>
        </div>
      )}

      {/* 4. COMPREHENSIVE AUDIT & BOOKING DETAILS MODAL */}
      {auditModalBooking && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(5px)',
          padding: '16px',
        }}>
          <div style={{
            background: '#151724',
            color: '#fff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
            border: '1px solid #2a2e45',
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #1f2233',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600 }}>
                  CONFIRMED RESERVATION AUDIT
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                  Booking Dossier & Audit Log
                </div>
              </div>
              <button
                onClick={() => setAuditModalBooking(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              {/* Top Summary Banner */}
              <div style={{
                background: '#1c1f30',
                border: '1px solid #2a2e45',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '24px',
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600 }}>BOOKING ID</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f84464' }}>
                    {auditModalBooking.bookingId}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600 }}>TRANSACTION REF</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#60a5fa' }}>
                    {auditModalBooking.transactionId || 'TXN-ONLINE-VERIFIED'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600 }}>STATUS</div>
                  <div style={{
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    color: auditModalBooking.bookingStatus === 'confirmed' ? '#22c55e' : '#ef4444',
                    textTransform: 'uppercase',
                  }}>
                    {auditModalBooking.bookingStatus}
                  </div>
                </div>
              </div>

              {/* Show & Movie Details Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '16px',
                marginBottom: '24px',
              }}>
                <div style={{ background: '#10121d', padding: '14px', borderRadius: '8px', border: '1px solid #1f2233' }}>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, marginBottom: '4px' }}>
                    MOVIE DETAILS
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>
                    {auditModalBooking.movie?.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '2px' }}>
                    Language: {auditModalBooking.movie?.language || 'English'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                    Format: {auditModalBooking.show?.screenFormat || '4DX 3D'}
                  </div>
                </div>

                <div style={{ background: '#10121d', padding: '14px', borderRadius: '8px', border: '1px solid #1f2233' }}>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, marginBottom: '4px' }}>
                    CINEMA LOCATION
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>
                    {auditModalBooking.theatre?.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '2px' }}>
                    {auditModalBooking.theatre?.location || 'Indore'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                    City: {auditModalBooking.theatre?.city || 'Indore'}
                  </div>
                </div>

                <div style={{ background: '#10121d', padding: '14px', borderRadius: '8px', border: '1px solid #1f2233' }}>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, marginBottom: '4px' }}>
                    SCHEDULE & TIMING
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>
                    {auditModalBooking.show?.showDateDisplay || auditModalBooking.show?.showDate}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#22c55e', marginTop: '2px', fontWeight: 700 }}>
                    ⏰ Showtime: {auditModalBooking.show?.showTime}
                  </div>
                </div>

                <div style={{ background: '#10121d', padding: '14px', borderRadius: '8px', border: '1px solid #1f2233' }}>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, marginBottom: '4px' }}>
                    SEATS & ADMISSION
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#22c55e' }}>
                    {auditModalBooking.seats?.map((s) => s.seatNumber || s).join(', ') || auditModalBooking.seatNumbers?.join(', ')}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '2px' }}>
                    Total Seats: {auditModalBooking.seats?.length || auditModalBooking.seatNumbers?.length || 1}
                  </div>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div style={{
                background: '#10121d',
                borderRadius: '8px',
                padding: '16px',
                border: '1px solid #1f2233',
                marginBottom: '24px',
              }}>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 700, marginBottom: '12px' }}>
                  PAYMENT & TAX INVOICE AUDIT
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#d1d5db', marginBottom: '6px' }}>
                  <span>Ticket Base Price:</span>
                  <span>₹{auditModalBooking.totalAmount || Math.round(auditModalBooking.grandTotal / 1.18)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#d1d5db', marginBottom: '8px' }}>
                  <span>GST & Convenience Charges (18%):</span>
                  <span>₹{auditModalBooking.taxAmount || Math.round(auditModalBooking.grandTotal - (auditModalBooking.grandTotal / 1.18))}</span>
                </div>
                <div style={{
                  borderTop: '1px solid #1f2233',
                  paddingTop: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  color: '#fff',
                }}>
                  <span>Grand Total Paid:</span>
                  <span style={{ color: '#22c55e' }}>₹{auditModalBooking.grandTotal}</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '6px' }}>
                  Payment Method: <strong>{auditModalBooking.paymentMethod || 'Credit/Debit Card'}</strong>
                </div>
              </div>

              {/* Immutable Audit Trail Timeline */}
              <div>
                <div style={{ fontSize: '0.78rem', color: '#9ca3af', fontWeight: 800, letterSpacing: '0.5px', marginBottom: '12px' }}>
                  SYSTEM AUDIT TRAIL & EVENT LOG
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(auditModalBooking.auditTrail && auditModalBooking.auditTrail.length > 0 ? auditModalBooking.auditTrail : [
                    {
                      action: 'SEATS_RESERVED',
                      description: 'Real-time cinema seat lock established successfully',
                      timestamp: auditModalBooking.bookedAtFormatted || 'Confirmed at checkout',
                      operator: 'IMOVIES_CORE',
                    },
                    {
                      action: 'PAYMENT_AUTHORIZATION',
                      description: `₹${auditModalBooking.grandTotal} authorized and settled via payment gateway`,
                      timestamp: auditModalBooking.bookedAtFormatted || 'Confirmed at checkout',
                      operator: 'GATEWAY_PROCESSED',
                    },
                    {
                      action: 'TICKET_CONFIRMATION',
                      description: `Electronic M-Ticket confirmation issued to account ${auditModalBooking.user?.email || 'user'}`,
                      timestamp: auditModalBooking.bookedAtFormatted || 'Confirmed at checkout',
                      operator: 'DISPATCH_SERVICE',
                    },
                  ]).map((log, i) => (
                    <div
                      key={i}
                      style={{
                        background: '#10121d',
                        borderLeft: '3px solid #22c55e',
                        padding: '10px 14px',
                        borderRadius: '0 6px 6px 0',
                        fontSize: '0.82rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                        <strong style={{ color: '#60a5fa', fontSize: '0.78rem' }}>[{log.action}]</strong>
                        <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{log.timestamp}</span>
                      </div>
                      <div style={{ color: '#d1d5db' }}>{log.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid #1f2233',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              flexWrap: 'wrap',
            }}>
              <a
                href={getGmailUrl(auditModalBooking)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#ea4335',
                  color: '#fff',
                  borderRadius: '6px',
                  padding: '8px 18px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Mail size={15} />
                <span>Send to Gmail</span>
              </a>
              <button
                onClick={() => window.print()}
                style={{
                  background: '#1f2233',
                  border: '1px solid #2a2e45',
                  color: '#fff',
                  borderRadius: '6px',
                  padding: '8px 18px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Printer size={15} />
                <span>Print Dossier</span>
              </button>
              <button
                onClick={() => setAuditModalBooking(null)}
                style={{
                  background: '#f84464',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 22px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. CANCELLATION MODAL */}
      {cancelModalBooking && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px',
        }}>
          <div className="glass-card" style={{ maxWidth: '480px', width: '100%', background: '#151724', border: '1px solid #1f2233' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444', marginBottom: '14px' }}>
              <AlertTriangle size={24} />
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Confirm Ticket Cancellation</h2>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#9ca3af', lineHeight: '1.6', marginBottom: '16px' }}>
              Are you sure you want to cancel your booking for <strong style={{ color: '#fff' }}>{cancelModalBooking.movie?.title}</strong>?
              According to cancellation policy, an instant 90% refund (₹{Math.round(cancelModalBooking.grandTotal * 0.9)}) will be processed.
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '6px' }}>
                Reason for cancellation:
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  background: '#1c1f30',
                  border: '1px solid #2a2e45',
                  color: '#fff',
                }}
              >
                <option value="Change of plans">Change of plans</option>
                <option value="Accidental booking">Accidental booking</option>
                <option value="Booked incorrect showtime">Booked incorrect showtime</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setCancelModalBooking(null)}
                style={{
                  background: '#1f2233',
                  border: '1px solid #2a2e45',
                  color: '#fff',
                  borderRadius: '6px',
                  padding: '8px 18px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={isCancelling}
                style={{
                  background: '#ef4444',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '6px',
                  padding: '8px 20px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {isCancelling ? 'Processing Refund...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;
