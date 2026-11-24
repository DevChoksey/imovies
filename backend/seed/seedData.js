const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Show = require('../models/Show');
const Seat = require('../models/Seat');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const QRCode = require('qrcode');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/imovies_db';
    console.log(`[Seed] Connecting to MongoDB...`);
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected successfully.');

    // Reset collections
    console.log('[Seed] Clearing previous collections...');
    await Promise.all([
      User.deleteMany({}),
      Movie.deleteMany({}),
      Theatre.deleteMany({}),
      Show.deleteMany({}),
      Seat.deleteMany({}),
      Booking.deleteMany({}),
      Payment.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    // 1. Create Default Users (Production Ready)
    console.log('[Seed] Creating system users...');
    const admin = await User.create({
      name: 'Operations Admin',
      email: 'admin@imovies.com',
      password: 'admin123',
      role: 'admin',
      phone: '+91 9876543210',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    });

    const user = await User.create({
      name: 'Rohan Sharma',
      email: 'user@imovies.com',
      password: 'user123',
      role: 'user',
      phone: '+91 9811223344',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    });

    // 2. Fresh Theatrical Releases (Late October & November 2026) + Upcoming
    console.log('[Seed] Seeding fresh 2026 theatrical releases...');
    const moviesData = [
      // ==========================================
      // === BOLLYWOOD: NOW SHOWING (NOV 2026) ===
      // ==========================================
      {
        title: 'Bhool Bhulaiyaa 3',
        description: 'Rooh Baba ventures into a haunted royal estate in Bengal where he faces off against two formidable spirits claiming to be Manjulika in a spine-chilling horror comedy showdown.',
        language: 'Hindi',
        industry: 'Bollywood',
        genre: ['Comedy', 'Horror', 'Mystery'],
        duration: 158,
        releaseDate: new Date('2026-11-01'),
        posterImage: 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg',
        bannerImage: 'https://image.tmdb.org/t/p/original/ovM06PdF3M86Ka562P9vaz8qlql.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=s56Uv58wW7E',
        rating: 8.4,
        status: 'now_showing',
        director: 'Anees Bazmee',
        cast: ['Kartik Aaryan', 'Vidya Balan', 'Madhuri Dixit', 'Triptii Dimri'],
        certificate: 'UA',
      },
      {
        title: 'Singham Again',
        description: 'DCP Bajirao Singham leads the elite Cop Universe across international borders to rescue his kidnapped wife Avni from a ruthless syndicate leader in a high-stakes war.',
        language: 'Hindi',
        industry: 'Bollywood',
        genre: ['Action', 'Drama', 'Thriller'],
        duration: 144,
        releaseDate: new Date('2026-11-01'),
        posterImage: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
        bannerImage: 'https://image.tmdb.org/t/p/original/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=mY9iTZZh4q4',
        rating: 8.2,
        status: 'now_showing',
        director: 'Rohit Shetty',
        cast: ['Ajay Devgn', 'Kareena Kapoor Khan', 'Ranveer Singh', 'Akshay Kumar', 'Deepika Padukone'],
        certificate: 'UA',
      },
      {
        title: 'The Sabarmati Report',
        description: 'A courageous investigative journalist uncovers the untold truths and conspiratorial cover-ups surrounding the pivotal 2002 train burning incident.',
        language: 'Hindi',
        industry: 'Bollywood',
        genre: ['Drama', 'Thriller', 'History'],
        duration: 132,
        releaseDate: new Date('2026-11-15'),
        posterImage: 'https://image.tmdb.org/t/p/w500/hr9rjHCvjW3s0r0yM6W7a5b5y.jpg',
        bannerImage: 'https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
        trailerUrl: 'https://www.youtube.com',
        rating: 8.1,
        status: 'now_showing',
        director: 'Dheeraj Sarna',
        cast: ['Vikrant Massey', 'Raashii Khanna', 'Riddhi Dogra'],
        certificate: 'UA',
      },
      {
        title: 'I Want to Talk',
        description: 'A poignant and uplifting journey of an irrepressible man facing a life-altering medical prognosis who learns to reconcile with his estranged daughter through genuine communication.',
        language: 'Hindi',
        industry: 'Bollywood',
        genre: ['Drama'],
        duration: 122,
        releaseDate: new Date('2026-11-22'),
        posterImage: 'https://image.tmdb.org/t/p/w500/m2zTtuw8Fbeo5QZfI5rG4n6yXzK.jpg',
        bannerImage: 'https://image.tmdb.org/t/p/original/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg',
        trailerUrl: 'https://www.youtube.com',
        rating: 8.7,
        status: 'now_showing',
        director: 'Shoojit Sircar',
        cast: ['Abhishek Bachchan', 'Johnny Lever', 'Ahilya Bamroo'],
        certificate: 'U',
      },
      {
        title: 'Chhaava',
        description: 'The heroic historical chronicle of Chhatrapati Sambhaji Maharaj, the fearless son of Shivaji Maharaj, defending the Maratha Empire against the invading Mughal armies.',
        language: 'Hindi',
        industry: 'Bollywood',
        genre: ['History', 'Action', 'Drama'],
        duration: 165,
        releaseDate: new Date('2026-11-20'),
        posterImage: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
        bannerImage: 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s52002e.jpg',
        trailerUrl: 'https://www.youtube.com',
        rating: 9.0,
        status: 'now_showing',
        director: 'Laxman Utekar',
        cast: ['Vicky Kaushal', 'Rashmika Mandanna', 'Akshaye Khanna'],
        certificate: 'UA',
      },

      // ==========================================
      // === HOLLYWOOD: NOW SHOWING (NOV 2026) ===
      // ==========================================
      {
        title: 'Gladiator II',
        description: 'Years after witnessing the martyrdom of Maximus, Lucius enters the Colosseum after Roman forces subjugate his homeland under two ruthless emperors.',
        language: 'English',
        industry: 'Hollywood',
        genre: ['Action', 'Adventure', 'Drama'],
        duration: 148,
        releaseDate: new Date('2026-11-15'),
        posterImage: 'https://image.tmdb.org/t/p/w500/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg',
        bannerImage: 'https://image.tmdb.org/t/p/original/euYIwmwkmz95mnXvufEmbL69ovr.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=4rgYUipGJNo',
        rating: 8.6,
        status: 'now_showing',
        director: 'Ridley Scott',
        cast: ['Paul Mescal', 'Pedro Pascal', 'Denzel Washington', 'Connie Nielsen'],
        certificate: 'A',
      },
      {
        title: 'Wicked: Part One',
        description: 'The untold story of the witches of Oz: Elphaba, misunderstood because of her green skin, and Glinda, gilded by privilege, form an unlikely and profound friendship.',
        language: 'English',
        industry: 'Hollywood',
        genre: ['Fantasy', 'Musical', 'Drama'],
        duration: 160,
        releaseDate: new Date('2026-11-22'),
        posterImage: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
        bannerImage: 'https://image.tmdb.org/t/p/original/yDHYTfA3R0jFYba16jBB1ef8oIt.jpg',
        trailerUrl: 'https://www.youtube.com',
        rating: 8.8,
        status: 'now_showing',
        director: 'Jon M. Chu',
        cast: ['Cynthia Erivo', 'Ariana Grande', 'Jeff Goldblum', 'Michelle Yeoh'],
        certificate: 'U',
      },
      {
        title: 'Red One',
        description: 'After Santa Claus is kidnapped, the North Pole\'s Head of Security teams up with the world\'s most notorious tracker in an action-packed, global mission to save Christmas.',
        language: 'English',
        industry: 'Hollywood',
        genre: ['Action', 'Comedy', 'Fantasy'],
        duration: 123,
        releaseDate: new Date('2026-11-15'),
        posterImage: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
        bannerImage: 'https://image.tmdb.org/t/p/original/rAiYTsqBkRefb9vh8qbdj7iZ2tw.jpg',
        trailerUrl: 'https://www.youtube.com',
        rating: 8.0,
        status: 'now_showing',
        director: 'Jake Kasdan',
        cast: ['Dwayne Johnson', 'Chris Evans', 'J.K. Simmons', 'Lucy Liu'],
        certificate: 'UA',
      },
      {
        title: 'Venom: The Last Dance',
        description: 'Eddie and Venom are on the run. Hunted by both of their worlds and with the net closing in, the duo are forced into a devastating decision.',
        language: 'English',
        industry: 'Hollywood',
        genre: ['Action', 'Sci-Fi', 'Thriller'],
        duration: 110,
        releaseDate: new Date('2026-10-25'),
        posterImage: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
        bannerImage: 'https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
        trailerUrl: 'https://www.youtube.com',
        rating: 8.1,
        status: 'now_showing',
        director: 'Kelly Marcel',
        cast: ['Tom Hardy', 'Chiwetel Ejiofor', 'Juno Temple'],
        certificate: 'UA',
      },
      {
        title: 'Moana 2',
        description: 'After receiving an unexpected call from her wayfinding ancestors, Moana must journey to the far seas of Oceania and into dangerous, long-lost waters.',
        language: 'English',
        industry: 'Hollywood',
        genre: ['Animation', 'Adventure', 'Family'],
        duration: 100,
        releaseDate: new Date('2026-11-27'),
        posterImage: 'https://image.tmdb.org/t/p/w500/jWsQ9hHjIqP6e7l6x8B8b7IeN7J.jpg',
        bannerImage: 'https://image.tmdb.org/t/p/original/628Dep6AxEtDxjZoGP78TsOxYbK.jpg',
        trailerUrl: 'https://www.youtube.com',
        rating: 8.9,
        status: 'now_showing',
        director: 'David Derrick Jr.',
        cast: ['Auliʻi Cravalho', 'Dwayne Johnson'],
        certificate: 'U',
      },

      // ==========================================
      // === BOLLYWOOD: UPCOMING (DEC 2026 - 2027) ==
      // ==========================================
      {
        title: 'Pushpa 2: The Rule',
        description: 'The clash escalates between Pushpa Raj and SP Bhanwar Singh Shekhawat as the red sandalwood empire faces international cartels and law enforcement.',
        language: 'Hindi',
        industry: 'Bollywood',
        genre: ['Action', 'Crime', 'Drama'],
        duration: 190,
        releaseDate: new Date('2026-12-05'),
        posterImage: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
        bannerImage: 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s52002e.jpg',
        trailerUrl: 'https://www.youtube.com',
        rating: 9.6,
        status: 'coming_soon',
        director: 'Sukumar',
        cast: ['Allu Arjun', 'Rashmika Mandanna', 'Fahadh Faasil'],
        certificate: 'UA',
      },
      {
        title: 'Baby John',
        description: 'An erstwhile brave police officer fakes his own death to raise his daughter peacefully in a serene town, until his violent past catches up.',
        language: 'Hindi',
        industry: 'Bollywood',
        genre: ['Action', 'Thriller', 'Drama'],
        duration: 155,
        releaseDate: new Date('2026-12-25'),
        posterImage: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
        bannerImage: 'https://image.tmdb.org/t/p/original/yDHYTfA3R0jFYba16jBB1ef8oIt.jpg',
        trailerUrl: 'https://www.youtube.com',
        rating: 8.8,
        status: 'coming_soon',
        director: 'Kalees',
        cast: ['Varun Dhawan', 'Keerthy Suresh', 'Wamiqa Gabbi', 'Jackie Shroff'],
        certificate: 'UA',
      },
      {
        title: 'War 2',
        description: 'Major Kabir Dhaliwal returns for an international espionage assignment, crossing paths with a lethal new covert operative in the YRF Spy Universe.',
        language: 'Hindi',
        industry: 'Bollywood',
        genre: ['Action', 'Thriller'],
        duration: 160,
        releaseDate: new Date('2027-08-14'),
        posterImage: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
        bannerImage: 'https://image.tmdb.org/t/p/original/rAiYTsqBkRefb9vh8qbdj7iZ2tw.jpg',
        trailerUrl: 'https://www.youtube.com',
        rating: 9.4,
        status: 'coming_soon',
        director: 'Ayan Mukerji',
        cast: ['Hrithik Roshan', 'N. T. Rama Rao Jr.', 'Kiara Advani'],
        certificate: 'UA',
      },
      {
        title: 'Ramayana: Part One',
        description: 'Nitesh Tiwari\'s monumental visual masterpiece retelling the epic Ramayana, depicting the divine honor, duty, and valor of Lord Rama.',
        language: 'Hindi',
        industry: 'Bollywood',
        genre: ['Mythological', 'Action', 'Drama'],
        duration: 185,
        releaseDate: new Date('2027-11-01'),
        posterImage: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
        bannerImage: 'https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
        trailerUrl: 'https://www.youtube.com',
        rating: 9.7,
        status: 'coming_soon',
        director: 'Nitesh Tiwari',
        cast: ['Ranbir Kapoor', 'Sai Pallavi', 'Yash', 'Sunny Deol'],
        certificate: 'U',
      },

      // ==========================================
      // === HOLLYWOOD: UPCOMING (DEC 2026 - 2027) =
      // ==========================================
      {
        title: 'Mufasa: The Lion King',
        description: 'Told in flashbacks, Rafiki transmits the legend of Mufasa to young lion cub Kiara, revealing how an orphaned lion cub became the beloved king of the Pride Lands.',
        language: 'English',
        industry: 'Hollywood',
        genre: ['Animation', 'Adventure', 'Drama'],
        duration: 125,
        releaseDate: new Date('2026-12-20'),
        posterImage: 'https://image.tmdb.org/t/p/w500/ovM06PdF3M86Ka562P9vaz8qlql.jpg',
        bannerImage: 'https://image.tmdb.org/t/p/original/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
        trailerUrl: 'https://www.youtube.com',
        rating: 9.1,
        status: 'coming_soon',
        director: 'Barry Jenkins',
        cast: ['Aaron Pierre', 'Kelvin Harrison Jr.', 'Beyoncé', 'Seth Rogen'],
        certificate: 'U',
      },
      {
        title: 'Sonic the Hedgehog 3',
        description: 'Sonic, Knuckles, and Tails reunite against a powerful new adversary, Shadow, a mysterious villain with powers unlike anything they have faced before.',
        language: 'English',
        industry: 'Hollywood',
        genre: ['Action', 'Adventure', 'Comedy'],
        duration: 110,
        releaseDate: new Date('2026-12-20'),
        posterImage: 'https://image.tmdb.org/t/p/w500/hr9rjHCvjW3s0r0yM6W7a5b5y.jpg',
        bannerImage: 'https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
        trailerUrl: 'https://www.youtube.com',
        rating: 8.9,
        status: 'coming_soon',
        director: 'Jeff Fowler',
        cast: ['Keanu Reeves', 'Jim Carrey', 'Ben Schwartz', 'Idris Elba'],
        certificate: 'UA',
      },
      {
        title: 'Mission: Impossible - The Final Reckoning',
        description: 'Our lives are the sum of our choices. Ethan Hunt faces his final, ultimate mission against the omnipotent rogue artificial intelligence entity.',
        language: 'English',
        industry: 'Hollywood',
        genre: ['Action', 'Thriller', 'Adventure'],
        duration: 165,
        releaseDate: new Date('2027-05-23'),
        posterImage: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
        bannerImage: 'https://image.tmdb.org/t/p/original/628Dep6AxEtDxjZoGP78TsOxYbK.jpg',
        trailerUrl: 'https://www.youtube.com',
        rating: 9.3,
        status: 'coming_soon',
        director: 'Christopher McQuarrie',
        cast: ['Tom Cruise', 'Hayley Atwell', 'Ving Rhames', 'Simon Pegg'],
        certificate: 'UA',
      },
      {
        title: 'Avatar: Fire and Ash',
        description: 'Jake Sully and Neytiri encounter the Ash People, an aggressive volcanic clan of Na\'vi, challenging their view of Pandora and expanding the epic saga.',
        language: 'English',
        industry: 'Hollywood',
        genre: ['Sci-Fi', 'Action', 'Fantasy'],
        duration: 195,
        releaseDate: new Date('2027-12-19'),
        posterImage: 'https://image.tmdb.org/t/p/w500/ovM06PdF3M86Ka562P9vaz8qlql.jpg',
        bannerImage: 'https://image.tmdb.org/t/p/original/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
        trailerUrl: 'https://www.youtube.com',
        rating: 9.4,
        status: 'coming_soon',
        director: 'James Cameron',
        cast: ['Sam Worthington', 'Zoe Saldana', 'Sigourney Weaver', 'Oona Chaplin'],
        certificate: 'UA',
      },
    ];

    const createdMovies = await Movie.insertMany(moviesData);

    // 3. Theatres across Indian Metros
    console.log('[Seed] Seeding theatres across major Indian cities...');
    const theatresData = [
      {
        name: 'PVR INOX: Phoenix Palladium',
        location: 'Lower Parel',
        address: 'Palladium Mall, Senapati Bapat Marg, Lower Parel, Mumbai',
        city: 'Mumbai',
        screens: [
          { screenNumber: 1, name: 'Audi 1 - IMAX with Laser', format: 'IMAX 2D', totalSeats: 80, rows: 8, cols: 10 },
          { screenNumber: 2, name: 'Audi 2 - Dolby Atmos Insignia', format: 'Dolby Atmos', totalSeats: 80, rows: 8, cols: 10 },
        ],
        amenities: ['IMAX Laser', 'Dolby Atmos', 'Recliner Seating', 'Gourmet Lounge', 'Valet Parking'],
      },
      {
        name: 'PVR Director\'s Cut: Ambience Mall',
        location: 'Vasant Kunj',
        address: 'Ambience Mall, Nelson Mandela Marg, New Delhi',
        city: 'Delhi-NCR',
        screens: [
          { screenNumber: 1, name: 'DC Screen 1 - Ultra Luxe', format: 'Dolby Atmos', totalSeats: 80, rows: 8, cols: 10 },
          { screenNumber: 2, name: 'DC Screen 2 - Laser 4K', format: 'IMAX 2D', totalSeats: 80, rows: 8, cols: 10 },
        ],
        amenities: ['Butler Service', 'Custom Recliners', 'Dolby Atmos', 'Cafe & Bar'],
      },
      {
        name: 'Cinépolis VIP: Forum Mall',
        location: 'Koramangala',
        address: 'Forum Mall, Hosur Road, Bengaluru',
        city: 'Bengaluru',
        screens: [
          { screenNumber: 1, name: 'Audi 1 - 4DX Dynamic', format: '4DX', totalSeats: 80, rows: 8, cols: 10 },
          { screenNumber: 2, name: 'Audi 2 - Macro XE Atmos', format: 'Dolby Atmos', totalSeats: 80, rows: 8, cols: 10 },
        ],
        amenities: ['4DX Immersion', 'Coffee Lounge', 'Pushback Seats', 'Dolby 7.1'],
      },
      {
        name: 'Prasads Multiplex & Large Screen',
        location: 'Necklace Road',
        address: 'Prasads Multiplex, NTR Gardens, Hyderabad',
        city: 'Hyderabad',
        screens: [
          { screenNumber: 1, name: 'Screen 6 - Giant Screen', format: 'IMAX 2D', totalSeats: 80, rows: 8, cols: 10 },
          { screenNumber: 2, name: 'Screen 3 - Dolby Atmos', format: 'Dolby Atmos', totalSeats: 80, rows: 8, cols: 10 },
        ],
        amenities: ['Massive Giant Screen', 'Dolby Atmos', 'Food Court', 'Gaming Arena'],
      },
      {
        name: 'Cinépolis: Treasure Island Mall',
        location: 'South Tukoganj',
        address: 'Treasure Island Mall, MG Road, Indore',
        city: 'Indore',
        screens: [
          { screenNumber: 1, name: 'Audi 1 - VIP Atmos', format: 'Dolby Atmos', totalSeats: 80, rows: 8, cols: 10 },
          { screenNumber: 2, name: 'Audi 2 - Macro XE', format: 'Standard 2D', totalSeats: 80, rows: 8, cols: 10 },
        ],
        amenities: ['Dolby Atmos', 'Recliner Seats', 'Snack Bar'],
      },
      {
        name: 'Cinépolis: Seasons Mall',
        location: 'Magarpatta City',
        address: 'Seasons Mall, Hadapsar, Pune',
        city: 'Pune',
        screens: [
          { screenNumber: 1, name: 'Audi 1 - VIP Luxe', format: 'Dolby Atmos', totalSeats: 80, rows: 8, cols: 10 },
          { screenNumber: 2, name: 'Audi 2 - 4DX', format: '4DX', totalSeats: 80, rows: 8, cols: 10 },
        ],
        amenities: ['4DX Experience', 'VIP Recliners', 'Cafeteria'],
      },
    ];

    const createdTheatres = await Theatre.insertMany(theatresData);

    // 4. Schedule Shows for Now Showing Movies across cities
    console.log('[Seed] Scheduling shows and generating seat matrices...');
    const today = new Date();
    const dateStrings = [];
    for (let d = 0; d < 5; d++) {
      const dt = new Date(today);
      dt.setDate(dt.getDate() + d);
      dateStrings.push(dt.toISOString().split('T')[0]);
    }

    const timeSlots = ['10:15 AM', '01:45 PM', '05:30 PM', '09:00 PM'];
    const rowLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

    const nowShowingMovies = createdMovies.filter((m) => m.status === 'now_showing');
    let firstShowId = null;

    for (const theatre of createdTheatres) {
      for (let i = 0; i < nowShowingMovies.length; i++) {
        const movie = nowShowingMovies[i];
        for (const showDate of dateStrings.slice(0, 3)) {
          for (const showTime of timeSlots.slice(0, 2)) {
            const show = await Show.create({
              movie: movie._id,
              theatre: theatre._id,
              screenNumber: 1,
              screenFormat: theatre.screens[0]?.format || 'Dolby Atmos',
              showDate,
              showTime,
              ticketPrices: {
                vip: 400,
                premium: 280,
                normal: 190,
              },
              totalSeats: 80,
              availableSeats: 78,
            });

            if (!firstShowId) firstShowId = show._id;

            const seats = [];
            for (let r = 0; r < rowLetters.length; r++) {
              const rowChar = rowLetters[r];
              let type = 'normal';
              let price = 190;
              if (r < 2) {
                type = 'vip';
                price = 400;
              } else if (r < 5) {
                type = 'premium';
                price = 280;
              }

              for (let c = 1; c <= 10; c++) {
                const sNum = `${rowChar}${c}`;
                const isBooked = show._id.toString() === firstShowId.toString() && (sNum === 'B3' || sNum === 'B4');
                seats.push({
                  show: show._id,
                  seatNumber: sNum,
                  row: rowChar,
                  col: c,
                  seatType: type,
                  price,
                  status: isBooked ? 'booked' : 'available',
                });
              }
            }
            await Seat.insertMany(seats);
          }
        }
      }
    }

    // 5. Initial Demo Booking for Analytics
    if (firstShowId) {
      const demoShow = await Show.findById(firstShowId).populate('movie').populate('theatre');
      const bookingId = 'IMV-2026-NOV01';
      const qrData = JSON.stringify({
        bookingId,
        movie: demoShow.movie.title,
        theatre: demoShow.theatre.name,
        date: demoShow.showDate,
        time: demoShow.showTime,
        seats: ['B3', 'B4'],
        amount: 944,
      });
      const qrCodeData = await QRCode.toDataURL(qrData);

      const demoBooking = await Booking.create({
        bookingId,
        user: user._id,
        show: demoShow._id,
        movie: demoShow.movie._id,
        theatre: demoShow.theatre._id,
        seats: [
          { seatNumber: 'B3', seatType: 'vip', price: 400 },
          { seatNumber: 'B4', seatType: 'vip', price: 400 },
        ],
        totalAmount: 800,
        taxAmount: 144,
        grandTotal: 944,
        paymentStatus: 'completed',
        bookingStatus: 'confirmed',
        qrCodeData,
      });

      await Payment.create({
        booking: demoBooking._id,
        user: user._id,
        amount: 944,
        paymentMethod: 'card',
        transactionId: 'TXN-NOV-9988',
        status: 'success',
        paymentDetails: { cardLast4: '4242' },
      });

      await Notification.create({
        user: user._id,
        title: 'Booking Confirmed!',
        message: `Your booking for "${demoShow.movie.title}" on ${demoShow.showDate} is confirmed.`,
        type: 'booking',
      });
    }

    console.log('\n=============================================');
    console.log('       IMOVIES SEEDING COMPLETE!            ');
    console.log('  Fresh Nov 2026 Theatrical Releases Live!   ');
    console.log('=============================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDatabase();
