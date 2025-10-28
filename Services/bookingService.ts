import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';

export type Booking = {
  id: string;
  email: string;
  name: string;
  phone: string;
  service: string;
  stylistName: string;
  date: string;
  time: string;
  status: string;
};

export const fetchAllBookings = async (): Promise<Booking[]> => {
  const snapshot = await getDocs(collection(db, 'bookings'));
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id, 
      email: data.email,
      name: data.clientName,
      phone: data.phone,
      service: data.service,
      stylistName: data.stylistName,
      date: data.date,
      time: data.time,
      status: data.status,
    };
  });
};
