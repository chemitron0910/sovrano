import GradientBackground from '@/Components/GradientBackground';
import BodyBoldText from '@/Components/typography/BodyBoldText';
import BodyText from '@/Components/typography/BodyText';
import { Picker } from '@react-native-picker/picker';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { Booking, fetchAllBookings } from '../Services/bookingService';
import { auth } from '../Services/firebaseConfig';

export default function StaffBookingHistory() {
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [cancelledPast, setCancelledPast] = useState<Booking[]>([]);
  const [cancelledUpcoming, setCancelledUpcoming] = useState<Booking[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>('recent');
  const [loading, setLoading] = useState(false);
  const stylistId = auth.currentUser?.uid;

  useEffect(() => {
    const loadBookings = async () => {
      setLoading(true);
      try {
        const data = await fetchAllBookings();
        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        const thirtyDaysAhead = new Date();
        thirtyDaysAhead.setDate(now.getDate() + 30);

        const pastBookings = data.filter(b => {
          const bookingDate = new Date(b.date);
          return (
            b.stylistId === stylistId &&
            bookingDate < now &&
            bookingDate >= thirtyDaysAgo &&
            b.status !== "cancelled"
          );
        });

        const cancelledPastBookings = data.filter(b => {
          const bookingDate = new Date(b.date);
          return (
            b.stylistId === stylistId &&
            b.status === "cancelled" &&
            bookingDate < now &&
            bookingDate >= thirtyDaysAgo
          );
        });

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
      } finally {
        setLoading(false);
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

  const renderList = () => {
    switch (selectedOption) {
      case 'recent':
        return (
          <>
            <FlatList
              data={recentBookings}
              keyExtractor={(item) => item.id}
              renderItem={renderBookingItem}
              ListEmptyComponent={<Text style={styles.empty}>No hay reservas pasadas.</Text>}
            />
          </>
        );
      case 'cancelledPast':
        return (
          <>
            <FlatList
              data={cancelledPast}
              keyExtractor={(item) => item.id}
              renderItem={renderBookingItem}
              ListEmptyComponent={<Text style={styles.empty}>No hay reservas canceladas pasadas.</Text>}
            />
          </>
        );
      case 'cancelledUpcoming':
        return (
          <>
            <FlatList
              data={cancelledUpcoming}
              keyExtractor={(item) => item.id}
              renderItem={renderBookingItem}
              ListEmptyComponent={<Text style={styles.empty}>No hay reservas canceladas próximas.</Text>}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <GradientBackground>
      <View style={styles.container}>
        {loading && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.overlayText}>Cargando historial de reservas...</Text>
          </View>
        )}

        <Picker
          selectedValue={selectedOption}
          onValueChange={(value) => setSelectedOption(value)}
        >
          <Picker.Item label="Últimos 30 días" value="recent" />
          <Picker.Item label="Canceladas (últimos 30 días)" value="cancelledPast" />
          <Picker.Item label="Canceladas (próximos 30 días)" value="cancelledUpcoming" />
        </Picker>

        {!loading && renderList()}
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  overlayText: {
    marginTop: 10,
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
