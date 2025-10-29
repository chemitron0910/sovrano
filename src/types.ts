export type User = {
  email: string;
  username: string;
  role: string;
};

export type RootStackParamList = {
  BookingScreen: undefined;
  'Cita confirmada': {
    service: string;
    date: string;
    time: string;
    guestName: string;
    stylistName: string;
    bookingId: string;
  };
};
