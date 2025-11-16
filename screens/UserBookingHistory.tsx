import GradientBackground from '@/Components/GradientBackground';
import BodyBoldText from '@/Components/typography/BodyBoldText';
import BodyText from '@/Components/typography/BodyText';
import { doc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import Button_style2 from '../Components/Button_style2';
import { Booking, fetchAllBookings } from '../Services/bookingService';
import { auth, db } from '../Services/firebaseConfig';

export default function UserBookingHistory() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const userId = auth.currentUser?.uid;
  const [loading, setLoading] = useState(false); // 👈 new state


  useEffect(() => {
  const loadBookings = async () => {
    setLoading(true); // show overlay
    try {
      const data = await fetchAllBookings();

      // Calculate cutoff date (1 year ago from now)
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      // Filter by userId AND date within last year
      const filtered = data.filter(b => {
        const bookingDate = new Date(b.date);
        return b.userId === userId && bookingDate >= oneYearAgo;
      });

      // Sort newest first
      const sorted = filtered.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setBookings(sorted);
    } catch (err) {
      console.error('Error fetching booking history:', err);
    } finally {
      setLoading(false); // hide overlay
    }
  };

  if (userId) loadBookings();
}, [userId]);

  const cancelBooking = async (booking: Booking) => {
  try {
    // 1️⃣ Mark booking as cancelled (history preserved)
    await updateDoc(doc(db, "bookings", booking.id), {
      status: "cancelled",
      cancelledAt: new Date().toISOString(),
    });

    // 2️⃣ Update local state so UI reflects cancellation
    setBookings(prev =>
      prev.map(b => (b.id === booking.id ? { ...b, status: "cancelled" } : b))
    );

    // 3️⃣ Show success message
    Alert.alert("Cancelación exitosa", "Tu cita ha sido cancelada.");

    // ⛔️ No availability update here
    // ⛔️ No push notification here
    // Backend Cloud Function (onBookingUpdated) will handle those
  } catch (error) {
    console.error("Error cancelando cita:", error);
    Alert.alert("Error", "No se pudo cancelar la cita.");
  }
};

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

    const isFuture = dateObj.getTime() > Date.now();

    return (
      
      <View style={styles.bookingItem}>
        <View style={styles.inlineText}>
          <BodyBoldText>Servicio: </BodyBoldText>
          <BodyText>{item.service}</BodyText>
        </View>
        <View style={styles.inlineText}>
          <BodyBoldText>Estilista: </BodyBoldText>
          <BodyText>{item.stylistName}</BodyText>
        </View>
        <View style={styles.inlineText}>
          <BodyBoldText>Fecha/Hora: </BodyBoldText>
          <BodyText>{formattedDate} / {formattedTime}</BodyText>
        </View>
        <View style={styles.inlineText}>
          <BodyBoldText>Estado: </BodyBoldText>
          <BodyText>{item.status || 'active'}</BodyText>
        </View>
        <View style={styles.inlineText}>
          <BodyBoldText>ID de reserva: </BodyBoldText>
          <BodyText>{item.id}</BodyText>
        </View>

        {isFuture && item.status !== 'cancelled' && (
          <Button_style2
        title="Cancelar cita"
            onPress={() =>
              Alert.alert(
                'Confirmar cancelación',
                '¿Seguro que deseas cancelar esta cita?',
                [
                  { text: 'No', style: 'cancel' },
                  { text: 'Sí', onPress: () => cancelBooking(item) },
                ]
              )
            }
          />
        )}
      </View>
    );
  };

  return (

    
    <GradientBackground>
      <View style={styles.container}>
        {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Cargando historial...</Text>
        </View>
      )}
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBookingItem}
          ListEmptyComponent={<Text style={styles.empty}>No hay reservas.</Text>}
        />
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
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
    alignItems: 'center',
    marginLeft: 24,
  },
  overlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 999,
},
loadingText: {
  color: '#fff',
  fontSize: 18,
  marginTop: 10,
  fontWeight: 'bold',
},

});
