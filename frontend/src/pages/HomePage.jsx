import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { movieService } from '../services/api';
import MovieCard from '../components/MovieCard';
import { MOVIES_DATABASE } from '../data/moviesData';
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Play,
  Film,
  Sparkles,
  Clapperboard,
  SlidersHorizontal,
  Flame,
} from 'lucide-react';

// Hero promotional carousel banners — auto-built from MOVIES_DATABASE
// (populated as movies are added one by one)
const CAROUSEL_SLIDES = MOVIES_DATABASE.map((m) => ({
  id: m._id,
  movieId: m._id,
  title: m.title,
  subtitle: `${m.director ? `Dir. ${m.director} • ` : ''}${Array.isArray(m.cast) ? m.cast.slice(0, 3).join(', ') : ''}`,
  badge: m.status === 'now_showing' ? 'Now In Theatres • Indore' : 'Coming Soon',
  genre: Array.isArray(m.genre) ? m.genre.join(' • ') : m.genre,
  colors: m.gradientColors || ['#0d2818', '#04471c'],
  accent: m.gradientAccent || '#16db65',
  emoji: m.emoji || '⚡',
  image: m.posterImage,
}));

const GENRES = [
  'All',
  'Action',
  'Drama',
  'Comedy',
  'Horror',
  'Sci-Fi',
  'Thriller',
  'Adventure',
  'Animation',
  'Fantasy',
  'History',
];

const HomePage = () => {
  const [searchParams] = useSearchParams();
  const searchParamQuery = searchParams.get('search') || '';
  const { selectedCity } = useBooking();

  const [movies, setMovies] = useState(MOVIES_DATABASE);
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [statusTab, setStatusTab] = useState('all');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Auto carousel slide rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Filter movies based on Industry, Status, Genre, and Search Query
  useEffect(() => {
    let list = MOVIES_DATABASE;

    // 1. Industry Filter (Bollywood / Hollywood)
    if (selectedIndustry !== 'All') {
      list = list.filter((m) => m.industry.toLowerCase() === selectedIndustry.toLowerCase());
    }

    // 2. Status Tab (Now Showing / Upcoming)
    if (statusTab !== 'all') {
      list = list.filter((m) => m.status === statusTab);
    }

    // 3. Genre Filter
    if (selectedGenre !== 'All') {
      list = list.filter((m) =>
        m.genre.some((g) => g.toLowerCase() === selectedGenre.toLowerCase())
      );
    }

    // 4. Search Bar Query
    if (searchParamQuery) {
      const q = searchParamQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.language.toLowerCase().includes(q) ||
          (m.director && m.director.toLowerCase().includes(q)) ||
          (m.cast && m.cast.some((c) => c.toLowerCase().includes(q))) ||
          m.genre.some((g) => g.toLowerCase().includes(q))
      );
    }

    setMovies(list);
  }, [selectedIndustry, statusTab, selectedGenre, searchParamQuery]);

  const currentSlide = CAROUSEL_SLIDES.length > 0 ? CAROUSEL_SLIDES[currentSlideIndex % CAROUSEL_SLIDES.length] : null;

  return (
    <div className="fade-in" style={{ paddingBottom: '70px' }}>
      {/* 1. Hero Promotional Movie Carousel */}
      <div style={{ background: '#0e1017', padding: '16px 0 24px 0', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container" style={{ position: 'relative' }}>
          {currentSlide ? (
          <div style={{
            position: 'relative',
            height: '340px',
            borderRadius: '12px',
            overflow: 'hidden',
            background: `linear-gradient(135deg, ${currentSlide.colors?.[0] || '#1a1a2d'} 0%, ${currentSlide.colors?.[1] || '#0d0d1a'} 100%)`,
            display: 'flex',
            alignItems: 'center',
            padding: '0 48px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}>
            {/* Decorative glow */}
            <div style={{
              position: 'absolute', top: '-30%', right: '-5%',
              width: '50%', height: '160%', borderRadius: '50%',
              background: `radial-gradient(circle, ${currentSlide.accent || '#f84464'}25 0%, transparent 70%)`,
              pointerEvents: 'none',
            }} />
            {/* Poster image on right of carousel */}
            {currentSlide.image ? (
              <img
                src={currentSlide.image}
                alt={currentSlide.title}
                style={{
                  position: 'absolute',
                  right: '64px',
                  top: '25px',
                  bottom: '25px',
                  width: '190px',
                  height: '290px',
                  borderRadius: '10px',
                  objectFit: 'cover',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.85)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  zIndex: 2,
                }}
              />
            ) : (
              <div style={{
                position: 'absolute', right: '60px', top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '8rem', opacity: 0.25,
                pointerEvents: 'none',
                userSelect: 'none',
              }}>
                {currentSlide.emoji}
              </div>
            )}

            <div style={{ maxWidth: '620px', position: 'relative', zIndex: 1 }}>
              <span style={{
                background: 'var(--bms-red)',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                marginBottom: '10px',
              }}>
                <Flame size={13} fill="#fff" />
                {currentSlide.badge}
              </span>

              <h1 style={{
                fontSize: 'clamp(1.8rem, 4vw, 2.7rem)',
                fontWeight: 800,
                lineHeight: 1.15,
                marginBottom: '8px',
                color: '#fff',
              }}>
                {currentSlide.title}
              </h1>

              <p style={{
                fontSize: '0.94rem',
                color: '#d1d5db',
                marginBottom: '18px',
                lineHeight: 1.5,
              }}>
                {currentSlide.subtitle}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Link
                  to={`/movie/${currentSlide.movieId}`}
                  className="btn btn-primary"
                  style={{
                    background: 'var(--bms-red)',
                    padding: '10px 24px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    borderRadius: '6px',
                    boxShadow: '0 4px 14px var(--accent-glow)',
                  }}
                >
                  Book Tickets
                </Link>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                  {currentSlide.genre}
                </span>
              </div>
            </div>

            {/* Left / Right Carousel Controls */}
            <button
              onClick={() => setCurrentSlideIndex((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length)}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.6)',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setCurrentSlideIndex((prev) => (prev + 1) % CAROUSEL_SLIDES.length)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.6)',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <ChevronRight size={20} />
            </button>

            {/* Pagination Dots */}
            <div style={{
              position: 'absolute',
              bottom: '12px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '6px',
            }}>
              {CAROUSEL_SLIDES.map((_, i) => (
                <div
                  key={i}
                  onClick={() => setCurrentSlideIndex(i)}
                  style={{
                    width: currentSlideIndex === i ? '22px' : '6px',
                    height: '6px',
                    borderRadius: '4px',
                    background: currentSlideIndex === i ? 'var(--bms-red)' : 'rgba(255,255,255,0.4)',
                    cursor: 'pointer',
                    transition: 'all 0.25s',
                  }}
                />
              ))}
            </div>
          </div>
          ) : (
            /* Empty state — no movies added yet */
            <div style={{
              height: '340px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #12131c 0%, #1a1b2e 100%)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              color: 'var(--text-dim)',
            }}>
              <Film size={48} color="#f84464" strokeWidth={1.5} />
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>IMovies</div>
              <div style={{ fontSize: '0.9rem' }}>Movies will appear here as they are added.</div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Primary Movie Control Strip: Industry & Status Tabs */}
      <div className="container" id="movies" style={{ marginTop: '32px' }}>
        <div style={{
          background: '#161824',
          borderRadius: '10px',
          padding: '16px 20px',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px',
        }}>
          {/* Cinema Industry Selector (Bollywood / Hollywood) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600 }}>
              Select Cinema:
            </span>
            <button
              onClick={() => setSelectedIndustry('All')}
              style={{
                padding: '7px 16px',
                borderRadius: '6px',
                background: selectedIndustry === 'All' ? 'var(--bms-red)' : '#1f2233',
                color: selectedIndustry === 'All' ? '#fff' : 'var(--text-muted)',
                fontSize: '0.85rem',
                fontWeight: 700,
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              All Cinemas
            </button>
            <button
              onClick={() => setSelectedIndustry('Bollywood')}
              style={{
                padding: '7px 16px',
                borderRadius: '6px',
                background: selectedIndustry === 'Bollywood' ? 'var(--bms-red)' : '#1f2233',
                color: selectedIndustry === 'Bollywood' ? '#fff' : 'var(--text-muted)',
                fontSize: '0.85rem',
                fontWeight: 700,
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
              }}
            >
              ✨ Bollywood (Hindi)
            </button>
            <button
              onClick={() => setSelectedIndustry('Hollywood')}
              style={{
                padding: '7px 16px',
                borderRadius: '6px',
                background: selectedIndustry === 'Hollywood' ? 'var(--bms-red)' : '#1f2233',
                color: selectedIndustry === 'Hollywood' ? '#fff' : 'var(--text-muted)',
                fontSize: '0.85rem',
                fontWeight: 700,
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
              }}
            >
              🎬 Hollywood (English)
            </button>
          </div>

          {/* Now Showing vs Upcoming Tabs */}
          <div style={{
            display: 'flex',
            background: '#1f2233',
            padding: '3px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
          }}>
            <button
              onClick={() => setStatusTab('all')}
              style={{
                padding: '7px 16px',
                borderRadius: '6px',
                background: statusTab === 'all' ? 'var(--bms-red)' : 'transparent',
                color: statusTab === 'all' ? '#fff' : 'var(--text-muted)',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              All Movies
            </button>
            <button
              onClick={() => setStatusTab('now_showing')}
              style={{
                padding: '7px 16px',
                borderRadius: '6px',
                background: statusTab === 'now_showing' ? 'var(--bms-red)' : 'transparent',
                color: statusTab === 'now_showing' ? '#fff' : 'var(--text-muted)',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Now Showing
            </button>
            <button
              onClick={() => setStatusTab('coming_soon')}
              style={{
                padding: '7px 16px',
                borderRadius: '6px',
                background: statusTab === 'coming_soon' ? 'var(--bms-red)' : 'transparent',
                color: statusTab === 'coming_soon' ? '#fff' : 'var(--text-muted)',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Upcoming
            </button>
          </div>
        </div>

        {/* 3. Movie Genre Quick Pills */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '10px',
          marginBottom: '26px',
        }}>
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              style={{
                padding: '5px 14px',
                borderRadius: '9999px',
                background: selectedGenre === g ? 'var(--bms-red)' : 'transparent',
                color: selectedGenre === g ? '#fff' : 'var(--text-dim)',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: `1px solid ${selectedGenre === g ? 'var(--bms-red)' : 'var(--border-color)'}`,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
            >
              {g}
            </button>
          ))}
        </div>

        {/* 4. Section Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '22px',
        }}>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', marginBottom: '2px' }}>
              Movies in {selectedCity || 'Indore'}
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-dim)' }}>
              Showing theatrical releases, advance bookings & premieres in {selectedCity || 'Indore'}
            </p>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600 }}>
            {movies.length} {movies.length === 1 ? 'Movie' : 'Movies'} Available
          </span>
        </div>

        {/* 5. Movies Grid */}
        {movies.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(215px, 1fr))',
            gap: '24px',
          }}>
            {movies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '70px 20px',
            background: '#161824',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
          }}>
            <Film size={44} color="#f84464" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px', color: '#fff' }}>
              Movies Coming Soon
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Movie listings are being added. Check back shortly!
            </p>
          </div>
        )}
      </div>

      {/* 6. Premium Cinema Formats Strip (Strictly Cinema - IMAX, 4DX, Dolby Atmos) */}
      <div className="container" style={{ marginTop: '56px' }}>
        <div style={{
          background: 'linear-gradient(90deg, #181926 0%, #1a1c2e 100%)',
          borderRadius: '12px',
          padding: '28px 36px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '24px',
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--bms-red)',
              fontWeight: 800,
              fontSize: '0.82rem',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '6px',
            }}>
              <Clapperboard size={16} /> Premium Cinema Experience
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
              Experience Cinema in IMAX 3D, 4DX & Dolby Atmos
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem' }}>
              Crystal-clear laser projection, bone-rattling audio, and motion seating at PVR INOX, Cinépolis and partner theatres.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ background: '#25273a', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#38bdf8' }}>
              IMAX Laser
            </span>
            <span style={{ background: '#25273a', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#a855f7' }}>
              Dolby Atmos 7.1
            </span>
            <span style={{ background: '#25273a', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#10b981' }}>
              4DX Motion
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
