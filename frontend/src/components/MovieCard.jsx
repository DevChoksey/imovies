import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ThumbsUp } from 'lucide-react';

const MovieCard = ({ movie }) => {
  const [imgError, setImgError] = useState(false);

  const hasLikes = !!movie.likes;
  const ratingText = hasLikes ? (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      color: '#fff',
      fontWeight: 700,
      fontSize: '0.8rem',
    }}>
      <ThumbsUp size={13} color="#22c55e" fill="#22c55e" />
      <span>{movie.likes} Likes</span>
    </div>
  ) : (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      color: '#fff',
      fontWeight: 700,
      fontSize: '0.8rem',
    }}>
      <Star size={13} color="#ef4444" fill="#ef4444" />
      <span>{movie.rating ? movie.rating.toFixed(1) : '8.0'}/10</span>
      {movie.votes && (
        <span style={{ fontSize: '0.74rem', color: '#9ca3af', fontWeight: 500 }}>
          {movie.votes} Votes
        </span>
      )}
    </div>
  );

  return (
    <Link
      to={`/movie/${movie._id}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
        borderRadius: '10px',
        overflow: 'hidden',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        cursor: 'pointer',
      }}
      className="bms-exact-card"
    >
      {/* Poster Image Container */}
      <div style={{
        position: 'relative',
        width: '100%',
        paddingTop: '148%',
        borderRadius: '10px',
        overflow: 'hidden',
        background: '#151722',
      }}>
        {!imgError && movie.posterImage ? (
          <img
            src={movie.posterImage}
            alt={movie.title}
            onError={() => setImgError(true)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease',
            }}
            className="bms-card-img"
          />
        ) : (
          /* High-grade fallback if image file fails */
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: `linear-gradient(145deg, ${movie.gradientColors?.[0] || '#111827'} 0%, ${movie.gradientColors?.[1] || '#1f2937'} 100%)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '8px' }}>{movie.emoji || '🎬'}</div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: '1rem' }}>{movie.title}</div>
          </div>
        )}

        {/* BookMyShow Bottom Rating Strip on Poster */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(0, 0, 0, 0.92)',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottomLeftRadius: '10px',
          borderBottomRightRadius: '10px',
        }}>
          {ratingText}
        </div>
      </div>

      {/* Movie Details Under Poster - Exact BookMyShow format */}
      <div style={{ paddingTop: '10px', paddingBottom: '6px' }}>
        <h3 style={{
          fontSize: '1.05rem',
          fontWeight: 700,
          color: '#fff',
          marginBottom: '3px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }} title={movie.title}>
          {movie.title}
        </h3>

        <div style={{
          fontSize: '0.84rem',
          color: '#9ca3af',
          marginBottom: '2px',
        }}>
          {movie.certificate || 'UA16+'}
        </div>

        <div style={{
          fontSize: '0.82rem',
          color: '#9ca3af',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {movie.language || 'English'}
        </div>
      </div>

      <style>{`
        .bms-exact-card:hover {
          transform: translateY(-5px);
        }
        .bms-exact-card:hover .bms-card-img {
          transform: scale(1.03);
        }
      `}</style>
    </Link>
  );
};

export default MovieCard;
