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
  "Inicio-Admin": undefined;
  "Inicio-Sovrano": undefined;
  "Assignar responsabilidad": undefined;
  "Manejar servicios": undefined;
  "Calendario de citas": undefined;
  "Historia de citas": undefined;
};
