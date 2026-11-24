// Centralized Movies Catalog & Indore Multiplex Schedule
// Exactly matching user-provided BookMyShow screenshots for Indore

export const INDORE_CINEMAS = [
  {
    _id: 'theatre_pvr_ti_indore',
    name: 'PVR: Treasure Island Mall, Indore',
    location: 'Treasure Island Mall, MG Road',
    city: 'Indore',
    cancellation: true,
    amenities: ['Cancellation available', 'F&B', 'M-Ticket'],
    formats: [
      {
        formatName: 'ENGLISH MS - INF VSN 4DX 3D',
        badge: '4DX',
        times: [
          { time: '11:05 AM', badge: '4DX', status: 'available', price: 800 },
          { time: '11:45 PM', badge: '4DX', status: 'available', isNight: true, price: 800 },
        ],
      },
      {
        formatName: 'ENGLISH MS-INFINITY VSN 3D',
        badge: 'INFINITY 3D',
        times: [
          { time: '12:05 AM', badge: 'ENG', status: 'available', isNight: true, price: 720 },
          { time: '07:10 AM', badge: 'ENG', status: 'available', isMorning: true, price: 720 },
          { time: '08:20 AM', badge: 'ENG', status: 'available', isMorning: true, price: 720 },
          { time: '10:20 AM', badge: 'ENG', status: 'available', price: 720 },
          { time: '01:30 PM', badge: 'ENG', status: 'available', isAvailableGreen: true, price: 720 },
          { time: '02:40 PM', badge: 'ENG', status: 'available', price: 720 },
          { time: '04:40 PM', badge: 'ENG', status: 'available', price: 720 },
          { time: '07:50 PM', badge: 'ENG', status: 'available', price: 720 },
          { time: '09:00 PM', badge: 'ENG', status: 'available', price: 720 },
          { time: '11:00 PM', badge: 'ENG', status: 'available', isNight: true, price: 720 },
        ],
      },
    ],
  },
  {
    _id: 'theatre_inox_phoenix_indore',
    name: 'INOX: Phoenix Pride of India, Indore',
    location: 'Phoenix Citadel Mall, Indore',
    city: 'Indore',
    cancellation: true,
    amenities: ['Cancellation available', 'F&B', 'M-Ticket'],
    formats: [
      {
        formatName: 'ENGLISH MS-INFINITY VSN 3D',
        badge: 'BIGPIX',
        times: [
          { time: '12:05 AM', badge: 'BIGPIX', status: 'available', isNight: true, isAvailableGreen: true, price: 720 },
          { time: '08:00 AM', badge: 'ENG', status: 'fast_filling', isMorning: true, price: 720 },
          { time: '10:05 AM', badge: 'ENG', status: 'available', price: 720 },
          { time: '02:15 PM', badge: 'BIGPIX', status: 'available', price: 720 },
          { time: '04:25 PM', badge: 'ENG', status: 'available', price: 720 },
          { time: '05:25 PM', badge: 'BIGPIX', status: 'available', price: 720 },
          { time: '08:35 PM', badge: 'BIGPIX', status: 'available', price: 720 },
          { time: '10:45 PM', badge: 'ENG', status: 'available', isAvailableGreen: true, price: 720 },
          { time: '11:45 PM', badge: 'BIGPIX', status: 'available', isNight: true, isAvailableGreen: true, price: 720 },
        ],
      },
    ],
  },
  {
    _id: 'theatre_miraj_velocity_indore',
    name: 'Miraj Cinemas: Velocity III, Indore',
    location: 'Velocity III, Ring Road, Indore',
    city: 'Indore',
    cancellation: true,
    amenities: ['Cancellation available', 'F&B', 'M-Ticket'],
    formats: [
      {
        formatName: 'ENGLISH MS-INFINITY VSN 3D',
        badge: 'RECLINER',
        times: [
          { time: '01:00 PM', badge: 'RECLINER', status: 'available', isAvailableGreen: true, price: 720 },
          { time: '07:30 PM', badge: 'RECLINER', status: 'available', price: 720 },
        ],
      },
    ],
  },
];

export const INDORE_DATES = [
  { iso: '2026-12-17', dayOfWeek: 'THU', dayNum: 17, month: 'DEC', label: 'Thu, 17 December, 2026' },
  { iso: '2026-12-18', dayOfWeek: 'FRI', dayNum: 18, month: 'DEC', label: 'Fri, 18 December, 2026' },
  { iso: '2026-12-19', dayOfWeek: 'SAT', dayNum: 19, month: 'DEC', label: 'Sat, 19 December, 2026' },
  { iso: '2026-12-20', dayOfWeek: 'SUN', dayNum: 20, month: 'DEC', label: 'Sun, 20 December, 2026' },
  { iso: '2026-12-21', dayOfWeek: 'MON', dayNum: 21, month: 'DEC', label: 'Mon, 21 December, 2026' },
  { iso: '2026-12-22', dayOfWeek: 'TUE', dayNum: 22, month: 'DEC', label: 'Tue, 22 December, 2026' },
  { iso: '2026-12-23', dayOfWeek: 'WED', dayNum: 23, month: 'DEC', label: 'Wed, 23 December, 2026' },
];

export const MOVIES_DATABASE = [
  {
    _id: 'mov_avengers_doomsday',
    slug: 'avengers-doomsday',
    title: 'Avengers: Doomsday',
    description: 'Three beloved heroes from distinct universes are pulled onto a collision course, and they must face an existential threat unlike anything they have encountered before.',
    language: 'English, Hindi, Tamil, Telugu',
    languagesList: ['English', 'Hindi', 'Tamil', 'Telugu'],
    industry: 'Hollywood',
    genre: ['Action', 'Adventure', 'Fantasy', 'Sci-Fi'],
    duration: 155, // 2h 35m
    runtimeDisplay: '2h 35m',
    releaseDate: '2026-12-17',
    releaseDateDisplay: 'Releasing on 17 Dec, 2026',
    posterImage: '/posters/avengers-doomsday.jpg',
    bannerImage: '/posters/avengers-doomsday.jpg',
    trailerUrl: 'https://www.youtube.com',
    rating: 9.8,
    likes: '990K+',
    interestedCount: '990K+',
    votes: '990K+',
    status: 'now_showing',
    certificate: 'UA16+',
    director: 'Anthony Russo, Joe Russo',
    cast: ['Robert Downey Jr.', 'Benedict Cumberbatch', 'Anthony Mackie', 'Pedro Pascal', 'Florence Pugh'],
    gradientColors: ['#0d2818', '#04471c', '#058c42'],
    gradientAccent: '#16db65',
    emoji: '⚡',
    cities: ['Indore', 'Mumbai', 'Delhi-NCR', 'Bengaluru', 'All'],
    formats: ['2D', '3D', 'DOLBY CINEMA 2D', 'HDR By Barco', 'MS InfVsn EPIQ 3D', 'MS - Inf Vsn 4DX 3D', 'MS-Infinity Vsn 3D'],
    languageFormats: {
      ENGLISH: [
        'MS InVsn MX4D 3D',
        'MS-Infinity Vsn 3d',
        'MS - Inf Vsn 4DX 3D',
      ],
      HINDI: [
        'MS InVsn MX4D 3D',
        'MS-Infinity Vsn 3d',
        'MS - Inf Vsn 4DX 3D',
      ],
    },
  },
  {
    _id: 'mov_dune_3',
    slug: 'dune-part-three',
    title: 'Dune: Part Three',
    description: 'Paul Atreides rules the empire as emperor and prophet, confronting the galactic consequences of his ascendancy as war engulfs humanity across the cosmos.',
    language: 'English, Hindi',
    languagesList: ['English', 'Hindi'],
    industry: 'Hollywood',
    genre: ['Sci-Fi', 'Adventure', 'Drama'],
    duration: 168,
    runtimeDisplay: '2h 48m',
    releaseDate: '2026-12-18',
    releaseDateDisplay: 'Releasing Dec 2026',
    posterImage: '/posters/dune-part-three.jpg',
    bannerImage: '/posters/dune-part-three.jpg',
    trailerUrl: 'https://www.youtube.com',
    rating: 9.4,
    likes: '115K+',
    interestedCount: '115K+',
    votes: '115K+',
    status: 'coming_soon',
    certificate: 'UA16+',
    director: 'Denis Villeneuve',
    cast: ['Timothée Chalamet', 'Zendaya', 'Florence Pugh', 'Anya Taylor-Joy', 'Javier Bardem'],
    gradientColors: ['#3d2b1f', '#6f4e37', '#b38b6d'],
    gradientAccent: '#ffb703',
    emoji: '🏜️',
    cities: ['Indore', 'Mumbai', 'Delhi-NCR', 'Bengaluru', 'All'],
    formats: ['IMAX 3D', 'Dolby Atmos', '4DX', '2D'],
  },
  {
    _id: 'mov_hunger_games_sunrise',
    slug: 'the-hunger-games-sunrise-on-the-reaping',
    title: 'The Hunger Games: Sunrise on the Reaping',
    description: 'Revisit the world of Panem twenty-four years before the adventures of Katniss Everdeen, starting on the morning of the reaping of the Fiftieth Hunger Games, the Second Quarter Quell.',
    language: 'English',
    languagesList: ['English'],
    industry: 'Hollywood',
    genre: ['Action', 'Adventure', 'Sci-Fi'],
    duration: 142,
    runtimeDisplay: '2h 22m',
    releaseDate: '2026-11-20',
    releaseDateDisplay: 'Now Showing',
    posterImage: '/posters/hunger-games-sunrise.jpg',
    bannerImage: '/posters/hunger-games-sunrise.jpg',
    trailerUrl: 'https://www.youtube.com',
    rating: 8.3,
    votes: '1K+',
    likes: '84K+',
    status: 'now_showing',
    certificate: 'UA16+',
    director: 'Francis Lawrence',
    cast: ['Tom Blyth', 'Rachel Zegler', 'Peter Dinklage', 'Hunter Schafer'],
    gradientColors: ['#1c1a27', '#2e274a', '#443869'],
    gradientAccent: '#9d4edd',
    emoji: '🏹',
    cities: ['Indore', 'Mumbai', 'Delhi-NCR', 'Bengaluru', 'All'],
    formats: ['2D', 'Dolby Atmos', '4DX'],
  },
  {
    _id: 'mov_how_to_rob_a_bank',
    slug: 'how-to-rob-a-bank',
    title: 'How to Rob a Bank',
    description: 'A charismatic rebel in 1990s Seattle pulls off an unprecedented string of bank heists straight out of Hollywood, until law enforcement closes the perimeter.',
    language: 'English',
    languagesList: ['English'],
    industry: 'Hollywood',
    genre: ['Action', 'Crime', 'Thriller'],
    duration: 88,
    runtimeDisplay: '1h 28m',
    releaseDate: '2026-11-15',
    releaseDateDisplay: 'Now Showing',
    posterImage: '/posters/how-to-rob-a-bank.jpg',
    bannerImage: '/posters/how-to-rob-a-bank.jpg',
    trailerUrl: 'https://www.youtube.com',
    rating: 7.2,
    votes: '140+',
    likes: '35K+',
    status: 'now_showing',
    certificate: 'A',
    director: 'Stephen Robert Morse, Seth Porges',
    cast: ['Scott Scurlock', 'Mark Biggins', 'Steve Meyers'],
    gradientColors: ['#0f172a', '#1e293b', '#334155'],
    gradientAccent: '#38bdf8',
    emoji: '🏦',
    cities: ['Indore', 'Mumbai', 'Delhi-NCR', 'Bengaluru', 'All'],
    formats: ['2D', 'Digital'],
  },
];

// Helper to look up any movie by id, slug, or title
export const getMovieFromDatabase = (identifier) => {
  if (!identifier) return MOVIES_DATABASE[0];
  const cleaned = String(identifier).trim().toLowerCase();

  return (
    MOVIES_DATABASE.find(
      (m) =>
        m._id.toLowerCase() === cleaned ||
        (m.slug && m.slug.toLowerCase() === cleaned) ||
        m.title.toLowerCase() === cleaned ||
        m.title.toLowerCase().replace(/[^a-z0-9]/g, '') === cleaned.replace(/[^a-z0-9]/g, '')
    ) || MOVIES_DATABASE[0]
  );
};

// Helper to get shows for a movie on a given date and city
export const getShowsForMovie = (movieId, dateIso = '2026-12-17', city = 'Indore') => {
  const movie = getMovieFromDatabase(movieId);
  const selectedDateObj = INDORE_DATES.find((d) => d.iso === dateIso) || INDORE_DATES[0];

  const showsList = [];

  INDORE_CINEMAS.forEach((theatre) => {
    theatre.formats.forEach((fmt) => {
      fmt.times.forEach((t, idx) => {
        // Special condition: Miraj only has 7:30 PM on Fri, Sat, Sun
        if (theatre._id === 'theatre_miraj_velocity_indore' && t.time === '07:30 PM' && dateIso === '2026-12-17') {
          return;
        }

        const showId = `show_${theatre._id}_${dateIso}_${fmt.badge}_${t.time.replace(/[: ]/g, '')}`;

        showsList.push({
          _id: showId,
          movie,
          theatre,
          screenFormat: fmt.formatName,
          formatBadge: fmt.badge,
          showDate: dateIso,
          showDateDisplay: selectedDateObj.label,
          showTime: t.time,
          isNight: t.isNight || false,
          isMorning: t.isMorning || false,
          isAvailableGreen: t.isAvailableGreen || false,
          status: t.status || 'available',
          ticketPrices: {
            prime: 800,
            classic: 720,
            vip: 800,
            premium: 720,
            normal: 720,
          },
          availableSeats: 96,
          totalSeats: 108,
        });
      });
    });
  });

  return showsList;
};
