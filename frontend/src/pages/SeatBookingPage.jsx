import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import {
  ChevronLeft,
  X,
  CreditCard,
  CheckCircle,
  Tag,
} from 'lucide-react';

const SeatBookingPage = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    selectedShow: contextShow,
    setSelectedShow,
    selectedSeats,
    setSelectedSeats,
    toggleSeat,
    subtotal,
    tax,
    grandTotal,
    clearSelection,
  } = useBooking();

  const [show, setShow] = useState(null);
  const [selectedTime, setSelectedTime] = useState('11:05 AM');
  const [ticketCountTarget, setTicketCountTarget] = useState(2);

  // Initialize show data from context or localStorage
  useEffect(() => {
    clearSelection();

    let resolved = contextShow;
    if (!resolved) {
      try {
        const raw = localStorage.getItem('imovies_last_show');
        if (raw) resolved = JSON.parse(raw);
      } catch (_) {}
    }

    if (!resolved) {
      resolved = {
        _id: showId || 'show_default',
        movie: { title: 'Avengers: Doomsday' },
        theatre: {
          name: 'PVR: Treasure Island Mall, Indore',
          location: 'Treasure Island Mall, MG Road',
          city: 'Indore',
        },
        screenFormat: 'ENGLISH MS - INF VSN 4DX 3D',
        showDateDisplay: 'Thu, 17 December, 2026',
        showTime: '11:05 AM',
        ticketPrices: { prime: 800, classic: 720 },
      };
    }

    setShow(resolved);
    setSelectedShow(resolved);
    if (resolved.showTime) {
      setSelectedTime(resolved.showTime);
    }
  }, [showId, contextShow, setSelectedShow]);

  // Pre-configured booked seats matching Screenshot 12
  const isSeatBooked = (row, col) => {
    // Prime rows: middle seats sold
    if (['J', 'H', 'G', 'F', 'E'].includes(row)) {
      return col >= 2 && col <= 11;
    }
    // Classic rows: rows C & D middle sold
    if (['C', 'D'].includes(row)) {
      return col >= 6 && col <= 8;
    }
    return false;
  };

  const handleSeatClick = (row, colNum, tier, price) => {
    const seatId = `${row}${String(colNum).padStart(2, '0')}`;
    if (isSeatBooked(row, colNum)) return;

    toggleSeat({
      _id: `seat_${seatId}`,
      seatNumber: seatId,
      row,
      col: colNum,
      seatType: tier,
      price,
    });
  };

  const handleProceedToPayment = () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least 1 seat to continue.');
      return;
    }
    navigate('/checkout');
  };

  if (!show) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center', color: '#fff' }}>
        Loading seat layout...
      </div>
    );
  }

  const primeRows = ['J', 'H', 'G', 'F', 'E'];
  const classicRows = ['D', 'C', 'B', 'A'];
  const cols = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div style={{ background: '#f5f6f8', minHeight: '100vh', color: '#111827', paddingBottom: '90px' }}>
      {/* 1. TOP HEADER BAR (Exact Screenshot 12 layout) */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        padding: '14px 20px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                color: '#374151',
              }}
            >
              <ChevronLeft size={24} />
            </button>

            <div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#111827' }}>
                {show.movie?.title || 'Avengers: Doomsday'} (MS - Infinity Vision)(4DX 3D) - English
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '2px' }}>
                {show.theatre?.name || 'PVR: Treasure Island Mall, Indore'} | {show.showDateDisplay || 'Thu, 17 December, 2026'} | {selectedTime}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              style={{
                background: '#fff',
                border: '1px solid #f84464',
                color: '#f84464',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {selectedSeats.length > 0 ? `${selectedSeats.length} Tickets` : `${ticketCountTarget} Tickets`}
            </button>
            <button
              onClick={() => navigate(-1)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6b7280',
                padding: '4px',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. TIME SWITCHER STRIP (Screenshot 12 exact) */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        padding: '10px 20px',
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'flex',
          gap: '12px',
        }}>
          {[
            { time: '11:05 AM', format: '4DX' },
            { time: '11:45 PM', format: '4DX' },
          ].map((item, i) => {
            const isCurrent = selectedTime === item.time;
            return (
              <button
                key={i}
                onClick={() => setSelectedTime(item.time)}
                style={{
                  background: isCurrent ? '#fef3c7' : '#fff',
                  border: isCurrent ? '1px solid #f59e0b' : '1px solid #d1d5db',
                  borderRadius: '6px',
                  padding: '6px 16px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: isCurrent ? '#b45309' : '#374151',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <span>{item.time}</span>
                <span style={{ fontSize: '0.65rem', color: isCurrent ? '#b45309' : '#9ca3af' }}>
                  {item.format}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. SEAT MATRIX CONTAINER (Exact BookMyShow Screenshot 12 layout) */}
      <div style={{ maxWidth: '820px', margin: '36px auto', padding: '0 16px' }}>
        {/* SECTION 1: ₹800 PRIME ROWS */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            fontSize: '0.78rem',
            fontWeight: 800,
            color: '#6b7280',
            borderBottom: '1px solid #e5e7eb',
            paddingBottom: '8px',
            marginBottom: '16px',
            letterSpacing: '0.5px',
          }}>
            ₹800 PRIME ROWS
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {primeRows.map((row) => (
              <div key={row} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{
                  width: '18px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#9ca3af',
                  textAlign: 'center',
                }}>
                  {row}
                </span>

                <div style={{ display: 'flex', gap: '6px', flex: 1, justifyContent: 'center' }}>
                  {cols.map((col) => {
                    const seatId = `${row}${String(col).padStart(2, '0')}`;
                    const booked = isSeatBooked(row, col);
                    const selected = selectedSeats.some((s) => s.seatNumber === seatId);

                    let bg = '#fff';
                    let border = '1px solid #22c55e';
                    let color = '#15803d';

                    if (booked) {
                      bg = '#e5e7eb';
                      border = '1px solid #e5e7eb';
                      color = '#9ca3af';
                    } else if (selected) {
                      bg = '#22c55e';
                      border = '1px solid #22c55e';
                      color = '#fff';
                    }

                    return (
                      <button
                        key={col}
                        disabled={booked}
                        onClick={() => handleSeatClick(row, col, 'prime', 800)}
                        style={{
                          width: '32px',
                          height: '28px',
                          borderRadius: '4px',
                          background: bg,
                          border,
                          color,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: booked ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s',
                        }}
                      >
                        {String(col).padStart(2, '0')}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2: ₹720 CLASSIC ROWS */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{
            fontSize: '0.78rem',
            fontWeight: 800,
            color: '#6b7280',
            borderBottom: '1px solid #e5e7eb',
            paddingBottom: '8px',
            marginBottom: '16px',
            letterSpacing: '0.5px',
          }}>
            ₹720 CLASSIC ROWS
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {classicRows.map((row) => (
              <div key={row} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{
                  width: '18px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#9ca3af',
                  textAlign: 'center',
                }}>
                  {row}
                </span>

                <div style={{ display: 'flex', gap: '6px', flex: 1, justifyContent: 'center' }}>
                  {cols.map((col) => {
                    const seatId = `${row}${String(col).padStart(2, '0')}`;
                    const booked = isSeatBooked(row, col);
                    const selected = selectedSeats.some((s) => s.seatNumber === seatId);

                    let bg = '#fff';
                    let border = '1px solid #22c55e';
                    let color = '#15803d';

                    if (booked) {
                      bg = '#e5e7eb';
                      border = '1px solid #e5e7eb';
                      color = '#9ca3af';
                    } else if (selected) {
                      bg = '#22c55e';
                      border = '1px solid #22c55e';
                      color = '#fff';
                    }

                    return (
                      <button
                        key={col}
                        disabled={booked}
                        onClick={() => handleSeatClick(row, col, 'classic', 720)}
                        style={{
                          width: '32px',
                          height: '28px',
                          borderRadius: '4px',
                          background: bg,
                          border,
                          color,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: booked ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s',
                        }}
                      >
                        {String(col).padStart(2, '0')}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. SCREEN BAR & "ALL EYES THIS WAY PLEASE" (Screenshot 12 exact) */}
        <div style={{
          textAlign: 'center',
          marginTop: '36px',
          marginBottom: '28px',
        }}>
          <div style={{
            height: '12px',
            width: '360px',
            margin: '0 auto 12px auto',
            background: 'linear-gradient(to bottom, #dbeafe, #eff6ff)',
            border: '1px solid #93c5fd',
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
          }} />
          <div style={{ fontSize: '0.78rem', color: '#9ca3af', fontWeight: 600, letterSpacing: '0.5px' }}>
            All eyes this way please
          </div>
        </div>

        {/* 5. SEAT LEGEND BAR (Screenshot 12 exact) */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '24px',
          fontSize: '0.78rem',
          color: '#6b7280',
          padding: '16px 0',
          borderTop: '1px solid #e5e7eb',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '14px', height: '14px', border: '1px solid #22c55e', borderRadius: '3px', background: '#fff' }} />
            <span>Available</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '14px', height: '14px', background: '#e5e7eb', borderRadius: '3px' }} />
            <span>Sold</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '14px', height: '14px', border: '1px solid #f59e0b', borderRadius: '3px', background: '#fff' }} />
            <span>Bestseller</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '14px', height: '14px', background: '#22c55e', borderRadius: '3px' }} />
            <span>Selected</span>
          </div>
        </div>
      </div>

      {/* 6. BOTTOM PROCEED TO PAY BAR */}
      {selectedSeats.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#fff',
          borderTop: '1px solid #e5e7eb',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 -4px 16px rgba(0,0,0,0.08)',
          zIndex: 1000,
        }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                Seats: <span style={{ fontWeight: 800, color: '#111827' }}>{selectedSeats.map((s) => s.seatNumber).join(', ')}</span>
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827' }}>
                ₹{grandTotal}{' '}
                <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 500 }}>
                  (incl. ₹{tax} GST)
                </span>
              </div>
            </div>

            <button
              onClick={handleProceedToPayment}
              style={{
                background: '#f84464',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 32px',
                fontSize: '0.98rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(248, 68, 100, 0.35)',
              }}
            >
              Proceed to Pay
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatBookingPage;
