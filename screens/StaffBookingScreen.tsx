import GradientBackground from '@/Components/GradientBackground';
import BodyBoldText from '@/Components/typography/BodyBoldText';
import BodyText from '@/Components/typography/BodyText';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Booking, fetchAllBookings } from '../Services/bookingService';
import { auth } from '../Services/firebaseConfig';

// Normalize any date string into YYYY-MM-DD
function normalizeDateString(dateStr: string): string {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateWithWeekday(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function StaffBookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const stylistId = auth.currentUser?.uid;

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
        const data = await fetchAllBookings();
        const now = new Date();

        const filtered = data.filter(b => {
          const normalizedDate = normalizeDateString(b.date);
          const [year, month, day] = normalizedDate.split('-').map(Number);
          const [hour, minute] = b.time.split(':').map(Number);
          const bookingDate = new Date(year, month - 1, day, hour, minute);
          return b.stylistId === stylistId && bookingDate > now;
        });

        setBookings(filtered);
      } catch (err) {
        console.error('Error fetching bookings:', err);
      } finally {
        setLoading(false);
      }
    };
    if (stylistId) loadBookings();
  }, [stylistId]);

  // Group bookings by normalized date
  const groupedByDate: Record<string, Booking[]> = {};
  bookings.forEach(b => {
    const dateKey = normalizeDateString(b.date);
    if (!groupedByDate[dateKey]) groupedByDate[dateKey] = [];
    groupedByDate[dateKey].push(b);
  });

  const sortedDates = Object.keys(groupedByDate).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  if (loading) {
    return (
      <GradientBackground>
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Cargando reservas...</Text>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <View style={styles.container}>
        <BodyBoldText style={styles.title}>Mis Reservas</BodyBoldText>

        {sortedDates.map(date => {
          // ✅ Sort bookings within each day by time
          const bookingsForDay = groupedByDate[date].slice().sort((a, b) => {
            const [ay, am, ad] = normalizeDateString(a.date).split('-').map(Number);
            const [ah, amin] = a.time.split(':').map(Number);
            const aDate = new Date(ay, am - 1, ad, ah, amin);

            const [by, bm, bd] = normalizeDateString(b.date).split('-').map(Number);
            const [bh, bmin] = b.time.split(':').map(Number);
            const bDate = new Date(by, bm - 1, bd, bh, bmin);

            return aDate.getTime() - bDate.getTime();
          });

          return (
            <View key={date} style={{ marginBottom: 16 }}>
              <BodyText style={{ fontWeight: 'bold' }}>
                {formatDateWithWeekday(date)}
              </BodyText>

              {bookingsForDay.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ flexDirection: 'row' }}
                >
                  {bookingsForDay.map((b, idx) => {
                    const [year, month, day] = normalizeDateString(b.date).split('-').map(Number);
                    const [hour, minute] = b.time.split(':').map(Number);
                    const localDateObj = new Date(year, month - 1, day, hour, minute);

                    const time = localDateObj.toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[
                          styles.gridItem,
                          { backgroundColor: '#f0f0f0', borderColor: '#ccc', borderWidth: 1 },
                        ]}
                      >
                        <Text style={{ color: 'black', fontWeight: 'bold' }}>{time}</Text>
                        <Text style={{ color: 'black' }}>Cliente: {b.guestName}</Text>
                        <Text style={{ color: 'black' }}>Servicio: {b.service}</Text>
                        <Text style={{ color: 'black' }}>Duración: {b.duration}h</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              ) : (
                <Text>No hay reservas</Text>
              )}
            </View>
          );
        })}
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontWeight: 'bold', fontSize: 20, marginBottom: 16, textAlign: 'center' },
  gridItem: {
    padding: 10,
    borderRadius: 6,
    minWidth: 140,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginRight: 8, // spacing between slots
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: 'black',
    fontSize: 16,
  },
});
