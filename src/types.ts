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
    role: string;
  }; //Invitado
  'Cita confirmada.': {
    service: string;
    date: string;
    time: string;
    guestName: string;
    stylistName: string;
    bookingId: string;
    role: string;
  }; //Usuario
  "Inicio-Sovrano": undefined;
  "Inicio-Admin": { userId: string; role: string };
  "Inicio-Empleado": undefined;
  "Inicio-Usuario": undefined;
  "Inicio-Invitado": undefined;
  "Assignar responsabilidad": undefined;
  "Manejar servicios": undefined;
  "Calendario de citas": undefined; //Admin
  "Calendario de citas.": undefined; //Staff
  "Historia de citas": undefined; //Admin
  "Historia de citas.": undefined; //Staff
  "Historial de citas": undefined; //Usuario
  "Nuestros servicios": undefined; //Invitado
  "Nuestros servicios.": undefined; //Usuario
  "Agenda tu cita": undefined; //Invitado
  "Agenda tu cita.": undefined; //Usuario
  "Registrarse": undefined;
  "Calendario-Empleado": undefined;
  "Perfil-Empleado.": undefined;
  "Mi informacion": undefined;
};
