import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Film,
  MapPin,
  Search,
  User,
  LogOut,
  Shield,
  Ticket,
  ChevronDown,
  Navigation,
  X,
  Menu,
  Tv,
  Music,
  Smile,
  Compass,
} from 'lucide-react';

const POPULAR_CITIES = [
  'Mumbai',
  'Delhi-NCR',
  'Bengaluru',
  'Hyderabad',
  'Chandigarh',
  'Ahmedabad',
  'Pune',
  'Chennai',
  'Kolkata',
  'Kochi',
  'Indore',
  'Jaipur',
  'Lucknow',
  'Surat',
];

const Navbar = ({ selectedCity = 'Indore', setSelectedCity, onSearch }) => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [citySearchInput, setCitySearchInput] = useState('');
  const [detectingLocation, setDetectingLocation] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchInput);
    } else {
      navigate(`/?search=${encodeURIComponent(searchInput)}`);
    }
  };

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/login');
  };

  const handleSelectCity = (city) => {
    if (setSelectedCity) {
      setSelectedCity(city);
    }
    try {
      localStorage.setItem('imovies_city', city);
    } catch (_) {}
    setIsCityModalOpen(false);
    setCitySearchInput('');
  };

  const handleDetectLocation = () => {
    setDetectingLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await res.json();
            const detectedCity =
              data.address?.city ||
              data.address?.town ||
              data.address?.state_district ||
              'Mumbai';
            handleSelectCity(detectedCity);
          } catch (err) {
            handleSelectCity('Mumbai');
          } finally {
            setDetectingLocation(false);
          }
        },
        () => {
          setDetectingLocation(false);
          alert('Could not detect location automatically. Please select your city from the list.');
        }
      );
    } else {
      setDetectingLocation(false);
      alert('Geolocation is not supported by your browser.');
    }
  };

  const filteredCities = POPULAR_CITIES.filter((c) =>
    c.toLowerCase().includes(citySearchInput.toLowerCase())
  );

  return (
    <header style={{
      background: '#161824',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
    }}>
      {/* 1. Primary Top Navigation Bar */}
      <div style={{ borderBottom: '1px solid var(--border-color)' }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '68px',
          gap: '24px',
        }}>
          {/* Brand Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <div style={{
              background: 'var(--bms-red)',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px var(--accent-glow)',
            }}>
              <Film size={20} color="#fff" />
            </div>
            <span style={{ fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.5px', color: '#fff' }}>
              I<span style={{ color: 'var(--bms-red)' }}>Movies</span>
            </span>
          </Link>

          {/* Centered Pill Search Input (Cinema & Movie Focused) */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              flex: 1,
              maxWidth: '560px',
              position: 'relative',
              display: 'none',
            }}
            className="desktop-search"
          >
            <input
              type="text"
              placeholder="Search for Movies, Actors, Theatres, Languages..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 16px 9px 40px',
                borderRadius: '8px',
                background: '#1f2233',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                fontSize: '0.88rem',
              }}
            />
            <Search
              size={17}
              color="var(--text-dim)"
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
            />
          </form>

          {/* City Selector & User Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
            {/* City Dropdown Trigger */}
            <button
              onClick={() => setIsCityModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'none',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                fontWeight: 600,
                padding: '6px 10px',
              }}
            >
              <MapPin size={16} color="var(--bms-red)" />
              <span>{selectedCity || 'Mumbai'}</span>
              <ChevronDown size={14} color="var(--text-dim)" />
            </button>

            {user ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'var(--bg-card)',
                    padding: '5px 12px',
                    borderRadius: '9999px',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                  }}
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                    alt={user.name || 'User'}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    {(user.name || user.email?.split('@')[0] || 'User').trim().split(/\s+/)[0]}
                  </span>
                  <ChevronDown size={14} color="var(--text-dim)" />
                </button>

                {isDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '115%',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    width: '200px',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 200,
                    overflow: 'hidden',
                  }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{user.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{user.email}</div>
                    </div>
                    <Link
                      to="/my-bookings"
                      onClick={() => setIsDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 16px',
                        fontSize: '0.85rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      <Ticket size={16} color="var(--bms-red)" /> My Bookings
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 16px',
                          fontSize: '0.85rem',
                          color: 'var(--text-muted)',
                        }}
                      >
                        <Shield size={16} color="#60a5fa" /> Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '10px 16px',
                        background: 'none',
                        textAlign: 'left',
                        fontSize: '0.85rem',
                        color: '#ef4444',
                        borderTop: '1px solid var(--border-color)',
                      }}
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="btn btn-primary btn-sm"
                style={{
                  background: 'var(--bms-red)',
                  padding: '6px 18px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 2. Secondary Category Strip (Movies & Cinema Focused) */}
      <div style={{
        background: '#12131c',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        fontSize: '0.82rem',
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '40px',
        }}>
          {/* Left Categories - Strictly Movies */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
            <Link to="/" style={{ color: '#fff', fontWeight: 700 }}>
              Movies
            </Link>
            <Link to="/#movies" style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
              Now Showing
            </Link>
            <Link to="/#movies" style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
              Upcoming Releases
            </Link>
            <Link to="/#movies" style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
              Bollywood (Hindi)
            </Link>
            <Link to="/#movies" style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
              Hollywood (English)
            </Link>
            <span style={{ color: 'var(--text-muted)', cursor: 'pointer' }}>
              Cinemas & Screens
            </span>
          </div>

          {/* Right Utility Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }} className="desktop-utilities">
            <span style={{ color: 'var(--text-dim)', cursor: 'pointer' }}>Offers & Discounts</span>
            <span style={{ color: 'var(--text-dim)', cursor: 'pointer' }}>IMAX / 4DX</span>
            <span style={{ color: 'var(--text-dim)', cursor: 'pointer' }}>Support 24x7</span>
          </div>
        </div>
      </div>

      {/* Indian Cities Modal */}
      {isCityModalOpen && (
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
          zIndex: 300,
          padding: '20px',
        }}>
          <div className="glass-card" style={{ maxWidth: '580px', width: '100%', position: 'relative' }}>
            <button
              onClick={() => setIsCityModalOpen(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                color: 'var(--text-dim)',
              }}
            >
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '4px' }}>
              Select Your City
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '18px' }}>
              Choose your city to explore movies, cinema showtimes and live experiences
            </p>

            {/* City search input */}
            <div style={{ position: 'relative', marginBottom: '14px' }}>
              <input
                type="text"
                placeholder="Search for your city..."
                value={citySearchInput}
                onChange={(e) => setCitySearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && citySearchInput.trim()) {
                    handleSelectCity(citySearchInput.trim());
                  }
                }}
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 40px',
                  borderRadius: '6px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem',
                }}
              />
              <Search
                size={17}
                color="var(--text-dim)"
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
              />
              {citySearchInput.trim() && (
                <button
                  onClick={() => handleSelectCity(citySearchInput.trim())}
                  className="btn btn-primary btn-sm"
                  style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)' }}
                >
                  Select
                </button>
              )}
            </div>

            {/* Auto GPS Detect */}
            <button
              onClick={handleDetectLocation}
              disabled={detectingLocation}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '9px 14px',
                borderRadius: '6px',
                background: 'rgba(248, 68, 100, 0.1)',
                border: '1px solid rgba(248, 68, 100, 0.3)',
                color: 'var(--bms-red)',
                fontWeight: 600,
                fontSize: '0.85rem',
                marginBottom: '20px',
                justifyContent: 'center',
              }}
            >
              <Navigation size={15} />
              {detectingLocation ? 'Detecting your GPS location...' : 'Detect My Location'}
            </button>

            {/* Popular Metros */}
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '10px' }}>
              Popular Cities
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
              gap: '8px',
              maxHeight: '220px',
              overflowY: 'auto',
            }}>
              <button
                onClick={() => handleSelectCity('All')}
                style={{
                  padding: '8px 10px',
                  borderRadius: '4px',
                  background: selectedCity === 'All' ? 'var(--bms-red)' : 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                }}
              >
                All Cities
              </button>

              {filteredCities.map((city) => (
                <button
                  key={city}
                  onClick={() => handleSelectCity(city)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '4px',
                    background: selectedCity === city ? 'var(--bms-red)' : 'var(--bg-secondary)',
                    border: `1px solid ${selectedCity === city ? 'var(--bms-red)' : 'var(--border-color)'}`,
                    color: selectedCity === city ? '#fff' : 'var(--text-muted)',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                  }}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 820px) {
          .desktop-search { display: block !important; }
        }
        @media (max-width: 680px) {
          .desktop-utilities { display: none !important; }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
