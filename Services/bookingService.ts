import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';

export type Booking = {
  email: string;
  name: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  status: string;
};

export const fetchAllBookings = async (): Promise<Booking[]> => {
  const snapshot = await getDocs(collection(db, 'bookings'));
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      email: data.email,
      name: data.clientName,
      phone: data.phone,
      service: data.service,
      date: data.date,
      time: data.time,
      status: data.status,
    };
  });
};
