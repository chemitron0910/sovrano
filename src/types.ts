export type User = {
  email: string;
  username: string;
  role: string;
};

export type RootStackParamList = {
  "Usuario": { role: "usuario" | "admin" | "empleado" };
  "Invitado": { role: "guest" };
  "Administrador": { role: "admin" };
  "Empleado": { role: "empleado" }; 
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
  "Agenda tu cita": {
    role: "guest" | "usuario" | "admin" | "empleado";
    serviceFromUser?: {
      id: string;
      name: string;
      description: string;
      duration: string;
    };
    stylist?: {
      id: string;
      name: string;
    };
  };
  "Registrarse": undefined;
  "Calendario-Empleado": undefined;
  "Perfil-Empleado.": undefined;
  "Mi informacion": undefined;
};