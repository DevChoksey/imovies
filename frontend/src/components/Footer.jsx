import React from 'react';
import {
  HelpCircle,
  Mail,
  Shield,
  PhoneCall,
  RotateCcw,
  Send,
  Building,
  Heart,
  Clapperboard,
  Film,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{ marginTop: '70px', background: '#12131c' }}>
      {/* 1. Cinema Exhibitor Partner Strip */}
      <div style={{
        background: '#191b29',
        padding: '24px 0',
        borderTop: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              background: 'rgba(248, 68, 100, 0.15)',
              width: '46px',
              height: '46px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--bms-red)',
            }}>
              <Clapperboard size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>
                Cinema Exhibitor Network
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Are you a theatre owner or multiplex operator? Partner with IMovies to sell movie tickets across India.
              </div>
            </div>
          </div>

          <button
            className="btn btn-primary btn-sm"
            style={{
              background: 'var(--bms-red)',
              padding: '10px 22px',
              borderRadius: '6px',
              fontWeight: 700,
            }}
          >
            Partner With Us
          </button>
        </div>
      </div>

      {/* 2. Customer Care & Utility Strip */}
      <div style={{
        background: '#151724',
        padding: '20px 0',
        borderBottom: '1px solid var(--border-color)',
        fontSize: '0.85rem',
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px',
          color: 'var(--text-muted)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <PhoneCall size={18} color="var(--bms-red)" />
            <span>24/7 Cinema Support</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <RotateCcw size={18} color="var(--bms-red)" />
            <span>Resend Movie Ticket Confirmation</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Send size={18} color="var(--bms-red)" />
            <span>Subscribe to Weekly Premiere Alert</span>
          </div>
        </div>
      </div>

      {/* 3. Categorical Link Grids - Strictly Cinema */}
      <div className="container" style={{ padding: '48px 20px 32px 20px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '32px',
          marginBottom: '36px',
          fontSize: '0.82rem',
        }}>
          <div>
            <h4 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700, marginBottom: '14px' }}>
              MOVIES NOW SHOWING
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-dim)' }}>
              <span>Bhool Bhulaiyaa 3</span>
              <span>Singham Again</span>
              <span>The Sabarmati Report</span>
              <span>Gladiator II</span>
              <span>Wicked: Part One</span>
              <span>Chhaava</span>
            </div>
          </div>

          <div>
            <h4 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700, marginBottom: '14px' }}>
              UPCOMING MOVIES
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-dim)' }}>
              <span>Pushpa 2: The Rule</span>
              <span>Baby John</span>
              <span>War 2</span>
              <span>Ramayana: Part One</span>
              <span>Mufasa: The Lion King</span>
              <span>Sonic the Hedgehog 3</span>
            </div>
          </div>

          <div>
            <h4 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700, marginBottom: '14px' }}>
              CINEMA METROS
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {['Mumbai', 'Delhi-NCR', 'Bengaluru', 'Hyderabad', 'Chandigarh', 'Ahmedabad', 'Pune', 'Chennai', 'Kolkata', 'Kochi', 'Indore', 'Jaipur', 'Lucknow'].map((c) => (
                <span
                  key={c}
                  style={{
                    background: 'var(--bg-card)',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    color: 'var(--text-muted)',
                    fontSize: '0.75rem',
                  }}
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700, marginBottom: '14px' }}>
              CINEMA CHAINS & FORMATS
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-dim)' }}>
              <span>PVR INOX Multiplex</span>
              <span>Cinépolis VIP Cinemas</span>
              <span>Miraj Cinemas</span>
              <span>IMAX 3D Laser Theatres</span>
              <span>4DX Motion Experience</span>
              <span>Dolby Atmos Sound</span>
            </div>
          </div>
        </div>

        {/* 4. Copyright Bar */}
        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.78rem',
          color: 'var(--text-dim)',
        }}>
          <div>
            &copy; {new Date().getFullYear()} IMovies Entertainment Pvt. Ltd. All rights reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Crafted with</span>
            <Heart size={13} color="var(--bms-red)" fill="var(--bms-red)" />
            <span>for cinema lovers across India</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
