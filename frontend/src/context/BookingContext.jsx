import React, { createContext, useContext, useState, useEffect } from 'react';

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedShow, setSelectedShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedCity, setSelectedCityState] = useState(() => {
    return localStorage.getItem('imovies_city') || 'Indore';
  });

  const setSelectedCity = (city) => {
    setSelectedCityState(city);
    try {
      localStorage.setItem('imovies_city', city);
    } catch (_) {}
  };

  const toggleSeat = (seat) => {
    setSelectedSeats((prev) => {
      const exists = prev.find((s) => s.seatNumber === seat.seatNumber);
      if (exists) {
        return prev.filter((s) => s.seatNumber !== seat.seatNumber);
      } else {
        if (prev.length >= 8) {
          alert('You can select a maximum of 8 seats per transaction');
          return prev;
        }
        return [...prev, seat];
      }
    });
  };

  const clearSelection = () => {
    setSelectedSeats([]);
  };

  const subtotal = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  const tax = Math.round(subtotal * 0.18);
  const grandTotal = subtotal + tax;

  return (
    <BookingContext.Provider
      value={{
        selectedCity,
        setSelectedCity,
        selectedMovie,
        setSelectedMovie,
        selectedShow,
        setSelectedShow,
        selectedSeats,
        setSelectedSeats,
        toggleSeat,
        clearSelection,
        subtotal,
        tax,
        grandTotal,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);
