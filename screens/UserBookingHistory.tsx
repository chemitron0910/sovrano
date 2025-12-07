import GradientBackground from '@/Components/GradientBackground';
import BodyBoldText from '@/Components/typography/BodyBoldText';
import BodyText from '@/Components/typography/BodyText';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import Button_style2 from '../Components/Button_style2';
import { Booking, fetchAllBookings } from '../Services/bookingService';
import { auth } from '../Services/firebaseConfig';
import { handleCancelBooking } from "../utils/handleCancelBooking";
import { logError } from "../utils/logger";

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
      logError('Error fetching booking history:', err);
    } finally {
      setLoading(false); // hide overlay
    }
  };

  if (userId) loadBookings();
}, [userId]);

const cancelFromUser = async (booking: Booking) => {
  await handleCancelBooking({
    bookingData: booking,
    cancelledBy: "usuario",
    updateLocalState: (id) =>
      setBookings(prev =>
        prev.map(b => (b.id === id ? { ...b, status: "Cancelado" } : b))
      ),
  });
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
          <BodyBoldText>Duracion: </BodyBoldText>
          <BodyText>{item.duration}</BodyText>
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
          <BodyText>{item.status || 'Reservado'}</BodyText>
        </View>
        <View style={styles.inlineText}>
          <BodyBoldText>Cita número: </BodyBoldText>
          <BodyText>{item.autoNumber}</BodyText>
        </View>

        {isFuture && item.status !== 'Cancelado' && (
          <Button_style2
        title="Cancelar cita"
            onPress={() =>
              Alert.alert(
                'Confirmar cancelación',
                '¿Seguro que deseas cancelar esta cita?',
                [
                  { text: 'No', style: 'cancel' },
                  { text: "Sí", onPress: () => cancelFromUser(item) },
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
