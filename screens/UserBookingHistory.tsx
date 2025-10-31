import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Booking, fetchAllBookings } from '../Services/bookingService';
import { auth } from '../Services/firebaseConfig';

export default function UserBookingHistory() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const data = await fetchAllBookings();
        const filtered = data.filter(b => {
          const bookingDate = new Date(b.date);
          return (
            b.userId === userId
          );
        });

        const sorted = filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setBookings(sorted);

      } catch (err) {
        console.error('Error fetching booking history:', err);
      }
    };

    if (userId) loadBookings();
  }, [userId]);

  const renderBookingItem = ({ item }: { item: Booking }) => {
    const dateObj = new Date(item.date);
    const formattedDate = dateObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const formattedTime = dateObj.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View style={styles.bookingItem}>
        <Text style={styles.bookingText}>Servicio: {item.service}</Text>
        <Text style={styles.bookingText}>Estilista: {item.stylistName}</Text>
        <Text style={styles.bookingText}>
          Fecha/Hora: {formattedDate} / {formattedTime} {item.status}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de Citas</Text>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBookingItem}
        ListEmptyComponent={<Text style={styles.empty}>No hay reservas pasadas.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
  },
  bookingItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  bookingText: {
    fontSize: 16,
  },
  empty: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
  },
});
