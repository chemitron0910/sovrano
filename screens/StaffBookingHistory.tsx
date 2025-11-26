import GradientBackground from '@/Components/GradientBackground';
import BodyBoldText from '@/Components/typography/BodyBoldText';
import BodyText from '@/Components/typography/BodyText';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Booking, fetchAllBookings } from '../Services/bookingService';
import { auth } from '../Services/firebaseConfig';

export default function StaffBookingHistory() {
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [cancelledPast, setCancelledPast] = useState<Booking[]>([]);
  const [cancelledUpcoming, setCancelledUpcoming] = useState<Booking[]>([]);
  const stylistId = auth.currentUser?.uid;

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const data = await fetchAllBookings();
        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        const thirtyDaysAhead = new Date();
        thirtyDaysAhead.setDate(now.getDate() + 30);

        // ✅ Normal bookings in past 30 days
        const pastBookings = data.filter(b => {
          const bookingDate = new Date(b.date);
          return (
            b.stylistId === stylistId &&
            bookingDate < now &&
            bookingDate >= thirtyDaysAgo &&
            b.status !== "cancelled"
          );
        });

        // ✅ Cancelled bookings in past 30 days
        const cancelledPastBookings = data.filter(b => {
          const bookingDate = new Date(b.date);
          return (
            b.stylistId === stylistId &&
            b.status === "cancelled" &&
            bookingDate < now &&
            bookingDate >= thirtyDaysAgo
          );
        });

        // ✅ Cancelled bookings in upcoming 30 days
        const cancelledUpcomingBookings = data.filter(b => {
          const bookingDate = new Date(b.date);
          return (
            b.stylistId === stylistId &&
            b.status === "cancelled" &&
            bookingDate >= now &&
            bookingDate <= thirtyDaysAhead
          );
        });

        setRecentBookings(pastBookings);
        setCancelledPast(cancelledPastBookings);
        setCancelledUpcoming(cancelledUpcomingBookings);
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
          <BodyBoldText>Email: </BodyBoldText>
          <BodyText>{item.email}</BodyText>
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
        <BodyBoldText style={styles.centered}>Últimos 30 días</BodyBoldText>
        <FlatList
          data={recentBookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBookingItem}
          ListEmptyComponent={<Text style={styles.empty}>No hay reservas pasadas.</Text>}
        />

        <BodyBoldText style={styles.centered}>Canceladas (últimos 30 días)</BodyBoldText>
        <FlatList
          data={cancelledPast}
          keyExtractor={(item) => item.id}
          renderItem={renderBookingItem}
          ListEmptyComponent={<Text style={styles.empty}>No hay reservas canceladas pasadas.</Text>}
        />

        <BodyBoldText style={styles.centered}>Canceladas (próximos 30 días)</BodyBoldText>
        <FlatList
          data={cancelledUpcoming}
          keyExtractor={(item) => item.id}
          renderItem={renderBookingItem}
          ListEmptyComponent={<Text style={styles.empty}>No hay reservas canceladas próximas.</Text>}
        />
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  centered: {
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
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
    marginTop: 20,
  },
  inlineText: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 24,
  },
});
