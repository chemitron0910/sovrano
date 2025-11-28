export type User = {
  email: string;
  username: string;
  role: string;
  lastLogin?: string; // ISO string or Firestore Timestamp
};

export type RootStackParamList = {
  // Home screens
  "Inicio-Usuario": { role: "usuario" };
  "Inicio-Invitado": { role: "guest" };
  "Inicio-Admin": { role: "admin" };
  "Inicio-Empleado": { role: "empleado" | "admin" };
  "Menu-Invitado": { role: "guest" };
  "Menu-Usuario": { role: "usuario" };
  "Menu-Admin": { role: "admin" };
  "Menu-Empleado": { role: "empleado" | "admin" };

  // Role-specific dashboards
  "Administrador": { role: "admin" };
  "Empleado": { role: "empleado" };
  "Usuario": { role: "usuario" };
  "Invitado": { role: "guest" };

  // Booking flow
  "Nuestros servicios": { role: "guest" | "usuario" };
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
  "Cita confirmada": {
    service: string;
    date: string;
    time: string;
    guestName: string;
    stylistName: string;
    bookingId: string;
    role: string;
  };

  // Admin/empleado flows
  "Assignar responsabilidad": undefined;
  "Manejar servicios": undefined;
  "Calendario de citas": undefined; // Admin
  "Calendario de citas.": undefined; //empleado
  "Historia de citas": undefined; // Admin
  "Historia de citas.": undefined; // empleado
  "Historial de citas": undefined; // Usuario
  "Mis empleados": undefined; // Admin

  // Auth & profile
  "Registrarse": undefined;
  "Registro exitoso": {
    username: string;
    email: string;
    userId: string;
  };
  "Calendario-Empleado": undefined;
  "Perfil-Empleado": undefined;
  "Informacion-Empleado": undefined;
  "Mi informacion": undefined;
  "Re-enviar correo electronico": undefined;
  "Acerca de Sovrano": undefined;

  // Sovrano entry point
  "Inicio-Sovrano": undefined;
};
