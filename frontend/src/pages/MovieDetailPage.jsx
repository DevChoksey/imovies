import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import {
  getMovieFromDatabase,
  getShowsForMovie,
  INDORE_DATES,
  INDORE_CINEMAS,
} from '../data/moviesData';
import {
  ThumbsUp,
  Share2,
  Play,
  X,
  ChevronDown,
  Filter,
  Check,
  Moon,
  Coffee,
  Heart,
} from 'lucide-react';

const MovieDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedCity, setSelectedMovie, setSelectedShow } = useBooking();

  const [movie, setMovie] = useState(null);
  const [selectedDate, setSelectedDate] = useState('2026-12-17');
  const [isInterested, setIsInterested] = useState(false);
  const [isFormatModalOpen, setIsFormatModalOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const m = getMovieFromDatabase(id);
    setMovie(m);
    setSelectedMovie(m);
    setLoading(false);
  }, [id, setSelectedMovie]);

  const handleSelectShowtime = (theatre, format, timeObj) => {
    const selectedDateObj = INDORE_DATES.find((d) => d.iso === selectedDate) || INDORE_DATES[0];
    const showId = `show_${theatre._id}_${selectedDate}_${format.badge}_${timeObj.time.replace(/[: ]/g, '')}`;

    const showData = {
      _id: showId,
      movie: movie || { title: 'Avengers: Doomsday' },
      theatre: {
        _id: theatre._id,
        name: theatre.name,
        location: theatre.location,
        city: theatre.city || selectedCity || 'Indore',
      },
      screenFormat: format.formatName,
      formatBadge: format.badge,
      showDate: selectedDate,
      showDateDisplay: selectedDateObj.label,
      showTime: timeObj.time,
      price: timeObj.price || 800,
      ticketPrices: {
        prime: 800,
        classic: 720,
        vip: 800,
        premium: 720,
        normal: 720,
      },
    };

    setSelectedShow(showData);
    try {
      localStorage.setItem('imovies_last_show', JSON.stringify(showData));
    } catch (_) {}

    navigate(`/seat-selection/${showId}`);
  };

  const handleOpenFormatModal = () => {
    setIsFormatModalOpen(true);
  };

  const handleSelectFormatFromModal = (lang, fmt) => {
    setSelectedLanguage(lang);
    setSelectedFormat(fmt);
    setIsFormatModalOpen(false);

    // Scroll down to the showtimes container
    const el = document.getElementById('showtimes-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading || !movie) {
    return (
      <div style={{ padding: '100px 0', textAlign: 'center', color: '#fff' }}>
        Loading cinema details...
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ background: '#0e1017', minHeight: '100vh', color: '#fff' }}>
      {/* 1. HERO SECTION (Screenshot 2 exact layout) */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(to right, #090a10 35%, rgba(9, 10, 16, 0.88) 70%, rgba(9, 10, 16, 0.65) 100%)',
        borderBottom: '1px solid #1f2233',
        padding: '48px 0',
      }}>
        <div className="container" style={{
          display: 'flex',
          gap: '36px',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          position: 'relative',
        }}>
          {/* Poster on left */}
          <div style={{
            width: '260px',
            flexShrink: 0,
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 16px 36px rgba(0, 0, 0, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            position: 'relative',
            background: '#151722',
          }}>
            <img
              src={movie.posterImage}
              alt={movie.title}
              style={{ width: '100%', height: '380px', objectFit: 'cover', display: 'block' }}
            />
            {/* Release date banner at bottom of poster */}
            <div style={{
              background: '#090a10',
              padding: '8px 12px',
              textAlign: 'center',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#fff',
              borderTop: '1px solid rgba(255,255,255,0.08)',
            }}>
              {movie.releaseDateDisplay || 'Releasing on 17 Dec, 2026'}
            </div>

            {/* Trailers overlay button */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(0, 0, 0, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '24px',
              padding: '6px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              backdropFilter: 'blur(4px)',
              cursor: 'pointer',
            }}>
              <Play size={14} fill="#fff" />
              <span>Trailers (4)</span>
            </div>
          </div>

          {/* Details on right */}
          <div style={{ flex: 1, minWidth: '320px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h1 style={{
                fontSize: 'clamp(2rem, 3.5vw, 2.7rem)',
                fontWeight: 800,
                color: '#fff',
                marginBottom: '16px',
                lineHeight: 1.15,
              }}>
                {movie.title}
              </h1>
              <button
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                <Share2 size={16} />
                <span>Share</span>
              </button>
            </div>

            {/* BookMyShow Wishlist / Interest Card (Screenshot 2 exact box) */}
            <div style={{
              background: '#151724',
              borderRadius: '10px',
              padding: '14px 18px',
              border: '1px solid #232738',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px',
              marginBottom: '20px',
              maxWidth: '560px',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <ThumbsUp size={18} color="#22c55e" fill="#22c55e" />
                  <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>
                    {movie.interestedCount || '990K+'} are interested
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#9ca3af' }}>
                  Mark interested to add it to your Wishlist
                </div>
              </div>

              <button
                onClick={() => setIsInterested(!isInterested)}
                style={{
                  background: isInterested ? '#22c55e' : '#2b2f42',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 18px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {isInterested ? '✓ Interested' : "I'm interested"}
              </button>
            </div>

            {/* Runtime • Genre • Certificate */}
            <div style={{
              fontSize: '0.94rem',
              color: '#d1d5db',
              marginBottom: '16px',
              fontWeight: 500,
            }}>
              {movie.runtimeDisplay || '2h 35m'} • {(movie.genre || []).join(', ')} • {movie.certificate || 'UA16+'}
            </div>

            {/* Available Formats */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginBottom: '12px',
            }}>
              {(movie.formats || ['2D', '3D', 'DOLBY CINEMA 2D', 'HDR By Barco', 'MS InfVsn EPIQ 3D', '+10']).map((fmt, i) => (
                <span
                  key={i}
                  style={{
                    background: '#1f2233',
                    border: '1px solid #2a2e45',
                    borderRadius: '4px',
                    padding: '4px 10px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#e5e7eb',
                  }}
                >
                  {fmt}
                </span>
              ))}
            </div>

            {/* Available Languages */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginBottom: '28px',
            }}>
              {['English', 'Tamil', '+2'].map((lang, i) => (
                <span
                  key={i}
                  style={{
                    background: '#1f2233',
                    border: '1px solid #2a2e45',
                    borderRadius: '4px',
                    padding: '4px 10px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#e5e7eb',
                  }}
                >
                  {lang}
                </span>
              ))}
            </div>

            {/* Primary Book tickets Button */}
            <button
              onClick={handleOpenFormatModal}
              style={{
                background: '#f84464',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '14px 44px',
                fontSize: '1.05rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(248, 68, 100, 0.4)',
                letterSpacing: '0.5px',
                transition: 'all 0.2s',
              }}
            >
              Book tickets
            </button>
          </div>
        </div>
      </div>

      {/* 2. ABOUT THE MOVIE SECTION (Screenshot 2 exact) */}
      <div className="container" style={{ padding: '36px 0 24px 0', borderBottom: '1px solid #1f2233' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '12px', color: '#fff' }}>
          About the movie
        </h2>
        <p style={{
          fontSize: '0.95rem',
          color: '#9ca3af',
          lineHeight: 1.65,
          maxWidth: '800px',
        }}>
          {movie.description}
        </p>
      </div>

      {/* 3. SHOWTIMES AND DATES SECTION (Screenshots 4 & 5 exact) */}
      <div id="showtimes-section" style={{ background: '#0e1017', padding: '24px 0 80px 0' }}>
        {/* Dates Bar */}
        <div style={{
          background: '#151724',
          borderBottom: '1px solid #1f2233',
          padding: '12px 0',
          marginBottom: '24px',
        }}>
          <div className="container" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}>
            {/* 7 Days selector matching BMS screenshot */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {INDORE_DATES.map((d) => {
                const isSelected = selectedDate === d.iso;
                return (
                  <button
                    key={d.iso}
                    onClick={() => setSelectedDate(d.iso)}
                    style={{
                      background: isSelected ? '#f84464' : 'transparent',
                      color: isSelected ? '#fff' : '#9ca3af',
                      border: isSelected ? '1px solid #f84464' : '1px solid transparent',
                      borderRadius: '8px',
                      padding: '8px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                      minWidth: '60px',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      {d.dayOfWeek}
                    </span>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, lineHeight: 1.1 }}>
                      {d.dayNum}
                    </span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>
                      {d.month}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Legend & quick filters on right */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#22c55e' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
                <span>AVAILABLE</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#eab308' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#eab308' }} />
                <span>FAST FILLING</span>
              </div>
            </div>
          </div>
        </div>

        {/* Theatres & Showtimes in Indore */}
        <div className="container">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {INDORE_CINEMAS.map((theatre) => (
              <div
                key={theatre._id}
                style={{
                  background: '#151724',
                  borderRadius: '10px',
                  border: '1px solid #1f2233',
                  padding: '20px 24px',
                }}
              >
                {/* Theatre Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                  borderBottom: '1px solid #1f2233',
                  paddingBottom: '14px',
                }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
                      {theatre.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.78rem', color: '#9ca3af' }}>
                      <span>Cancellation available</span>
                      <span>•</span>
                      <span>{theatre.location}</span>
                    </div>
                  </div>
                </div>

                {/* Formats and times under this theatre */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {theatre.formats.map((fmt, fIdx) => (
                    <div key={fIdx}>
                      <div style={{
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: '#9ca3af',
                        marginBottom: '10px',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                      }}>
                        {fmt.formatName}
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {fmt.times.map((timeObj, tIdx) => {
                          const isFastFilling = timeObj.status === 'fast_filling';
                          const isGreen = timeObj.isAvailableGreen;

                          let borderColor = '#2a2e45';
                          let textColor = '#fff';
                          if (isFastFilling) {
                            borderColor = '#eab308';
                            textColor = '#eab308';
                          } else if (isGreen) {
                            borderColor = '#22c55e';
                            textColor = '#22c55e';
                          }

                          return (
                            <button
                              key={tIdx}
                              onClick={() => handleSelectShowtime(theatre, fmt, timeObj)}
                              style={{
                                background: '#1c1f30',
                                border: `1px solid ${borderColor}`,
                                borderRadius: '6px',
                                padding: '8px 14px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                cursor: 'pointer',
                                minWidth: '94px',
                                transition: 'all 0.2s',
                              }}
                              className="showtime-btn"
                            >
                              <div style={{
                                fontSize: '0.88rem',
                                fontWeight: 700,
                                color: textColor,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}>
                                <span>{timeObj.time}</span>
                                {timeObj.isNight && <Moon size={11} color="#9ca3af" />}
                                {timeObj.isMorning && <Coffee size={11} color="#9ca3af" />}
                              </div>
                              <span style={{
                                fontSize: '0.65rem',
                                color: '#9ca3af',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                marginTop: '2px',
                              }}>
                                {timeObj.badge || fmt.badge}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. SELECT LANGUAGE AND FORMAT MODAL (Screenshot 3 exact popup) */}
      {isFormatModalOpen && (
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
          zIndex: 9999,
          backdropFilter: 'blur(4px)',
          padding: '16px',
        }}>
          <div style={{
            background: '#fff',
            color: '#111827',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '520px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
            overflow: 'hidden',
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 600 }}>
                  {movie.title}
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#111827' }}>
                  Select language and format
                </div>
              </div>
              <button
                onClick={() => setIsFormatModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6b7280',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              {/* ENGLISH SECTION */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color: '#4b5563',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '12px',
                }}>
                  ENGLISH
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {['MS InVsn MX4D 3D', 'MS-Infinity Vsn 3d', 'MS - Inf Vsn 4DX 3D', 'Select all'].map((fmt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectFormatFromModal('English', fmt)}
                      style={{
                        background: '#f9fafb',
                        border: '1px solid #d1d5db',
                        borderRadius: '24px',
                        padding: '8px 16px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: '#374151',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.borderColor = '#f84464';
                        e.currentTarget.style.color = '#f84464';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = '#d1d5db';
                        e.currentTarget.style.color = '#374151';
                      }}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              {/* HINDI SECTION */}
              <div>
                <div style={{
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color: '#4b5563',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '12px',
                }}>
                  HINDI
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {['MS InVsn MX4D 3D', 'MS-Infinity Vsn 3d', 'MS - Inf Vsn 4DX 3D', 'Select all'].map((fmt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectFormatFromModal('Hindi', fmt)}
                      style={{
                        background: '#f9fafb',
                        border: '1px solid #d1d5db',
                        borderRadius: '24px',
                        padding: '8px 16px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: '#374151',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.borderColor = '#f84464';
                        e.currentTarget.style.color = '#f84464';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = '#d1d5db';
                        e.currentTarget.style.color = '#374151';
                      }}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .showtime-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          background: #23273e !important;
        }
      `}</style>
    </div>
  );
};

export default MovieDetailPage;
