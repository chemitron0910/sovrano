import GradientBackground from '@/Components/GradientBackground';
import BodyBoldText from '@/Components/typography/BodyBoldText';
import BodyText from '@/Components/typography/BodyText';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Booking, fetchAllBookings } from '../Services/bookingService';
import { auth } from '../Services/firebaseConfig';

export default function AdminBookingHistory() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const stylistId = auth.currentUser?.uid;

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const data = await fetchAllBookings();
        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);

        const filtered = data
          .filter(b => {
          const bookingDate = new Date(b.date);
          return (
          b.stylistId === stylistId &&
          bookingDate < now &&
          bookingDate >= thirtyDaysAgo
          );
          })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // newest to oldest

        setBookings(filtered);
      } catch (err) {
        console.error('Error fetching booking history:', err);
      }
    };

    if (stylistId) loadBookings();
  }, [stylistId]);

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
        <View style={styles.inlineText}>
          <BodyBoldText>Servicio: </BodyBoldText>
          <BodyText>{item.service}</BodyText>
        </View>
        <View style={styles.inlineText}>
          <BodyBoldText>Cliente: </BodyBoldText>
          <BodyText>{item.guestName}</BodyText>
        </View>
        <View style={styles.inlineText}>
          <BodyBoldText>Empleado: </BodyBoldText>
          <BodyText>{item.stylistName}</BodyText>
        </View>
        <View style={styles.inlineText}>
          <BodyBoldText>Fecha/Hora: </BodyBoldText>
          <BodyText>{formattedDate} / {formattedTime}</BodyText>
        </View>
      </View>
    );
  };

  return (
    <GradientBackground>
    <View style={styles.container}>
      <BodyBoldText style={styles.title}>Ultimos 30 días</BodyBoldText>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBookingItem}
        ListEmptyComponent={<Text style={styles.empty}>No hay reservas pasadas.</Text>}
        contentContainerStyle={styles.listContent}
      />
    </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  bookingItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  empty: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
  },
  inlineText: {
    flexDirection: 'row',
    alignItems: 'center', // optional: aligns text vertically
    marginLeft: 10,
  },
  listContent: {
  paddingBottom: 40, // prevents last item from being cut off
  },

});
