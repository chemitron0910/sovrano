import GradientBackground from '@/Components/GradientBackground';
import BodyBoldText from '@/Components/typography/BodyBoldText';
import BodyText from '@/Components/typography/BodyText';
import { Picker } from '@react-native-picker/picker';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Platform, StyleSheet, Text, View } from 'react-native';
import Button_style2 from '../Components/Button_style2';
import { Booking, fetchActiveGuests, fetchAllBookings } from '../Services/bookingService';
import { auth } from '../Services/firebaseConfig';

export default function StaffBookingHistory() {
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [cancelledPast, setCancelledPast] = useState<Booking[]>([]);
  const [cancelledUpcoming, setCancelledUpcoming] = useState<Booking[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>('recent');
  const [selectedGuest, setSelectedGuest] = useState<string>('Todos');
  const [allGuests, setAllGuests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const stylistId = auth.currentUser?.uid;
  const [notesModalVisible, setNotesModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

useEffect(() => {
  const loadBookings = async () => {
    setLoading(true);
    try {
      // Fetch bookings and active usuarios in parallel
      const [data, activeUsuarios] = await Promise.all([
        fetchAllBookings(),
        fetchActiveGuests() // only role:"usuario" + activo:true
      ]);

      // Collect guest names from bookings (role:"guest")
      const guestSet = new Set<string>();
      data.forEach(b => {
        if (b.stylistId === stylistId && b.role === "guest" && b.guestName) {
          guestSet.add(b.guestName);
        }
      });

      // Merge usuarios + guests
      const combined = [...activeUsuarios, ...Array.from(guestSet)];

      // Sort alphabetically (Spanish locale for accents/case)
      const sortedGuests = combined.sort((a, b) =>
        a.localeCompare(b, 'es', { sensitivity: 'base' })
      );

      setAllGuests(['Todos', ...sortedGuests]);

      const now = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      const thirtyDaysAhead = new Date();
      thirtyDaysAhead.setDate(now.getDate() + 30);

      const guestFilter = (b: Booking) =>
        selectedGuest === 'Todos' || b.guestName === selectedGuest;

      const pastBookings = data.filter(b => {
        const bookingDate = new Date(b.date);
        return (
          b.stylistId === stylistId &&
          guestFilter(b) &&
          bookingDate < now &&
          bookingDate >= thirtyDaysAgo &&
          b.status !== "Cancelado"
        );
      }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const cancelledPastBookings = data.filter(b => {
        const bookingDate = new Date(b.date);
        return (
          b.stylistId === stylistId &&
          guestFilter(b) &&
          b.status === "Cancelado" &&
          bookingDate < now &&
          bookingDate >= thirtyDaysAgo
        );
      }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const cancelledUpcomingBookings = data.filter(b => {
        const bookingDate = new Date(b.date);
        return (
          b.stylistId === stylistId &&
          guestFilter(b) &&
          b.status === "Cancelado" &&
          bookingDate >= now &&
          bookingDate <= thirtyDaysAhead
        );
      }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
}, [stylistId, selectedGuest, selectedOption]); 

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
    const roleLabel =
    item.role === "guest"
      ? "Invitado"
      : item.role === "usuario"
      ? "Usuario registrado"
      : "No definido";

    return (
      <View style={styles.bookingItemRow}>
        <View style={{ flex: 1 }}>
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
          <BodyBoldText>Typo de usuario: </BodyBoldText>
          <BodyText>{roleLabel}</BodyText>
        </View>
          <View style={styles.inlineText}>
            <BodyBoldText>Fecha/Hora: </BodyBoldText>
            <BodyText>{formattedDate} / {formattedTime}</BodyText>
          </View>
          <View style={styles.inlineText}>
            <BodyBoldText>Número de cita: </BodyBoldText>
            <BodyText>{item.autoNumber ?? "No disponible"}</BodyText>
          </View>
        </View>

        <View style={styles.notesButtonWrapper}>
          <Button_style2
            title="Ver notas"
            onPress={() => {
              setSelectedBooking(item);
              setNotesModalVisible(true);
            }}
            style={{ paddingHorizontal: 12 }}
          />
        </View>
      </View>
    );
  };

    const renderList = () => {
    switch (selectedOption) {
      case 'recent':
        return (
          <FlatList
            data={recentBookings}
            keyExtractor={(item) => item.id}
            renderItem={renderBookingItem}
            ListEmptyComponent={<Text style={styles.empty}>No hay reservas pasadas.</Text>}
          />
        );
      case 'cancelledPast':
        return (
          <FlatList
            data={cancelledPast}
            keyExtractor={(item) => item.id}
            renderItem={renderBookingItem}
            ListEmptyComponent={<Text style={styles.empty}>No hay reservas canceladas pasadas.</Text>}
          />
        );
      case 'cancelledUpcoming':
        return (
          <FlatList
            data={cancelledUpcoming}
            keyExtractor={(item) => item.id}
            renderItem={renderBookingItem}
            ListEmptyComponent={<Text style={styles.empty}>No hay reservas canceladas próximas.</Text>}
          />
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

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12 }}>
          <Picker
            selectedValue={selectedOption}
            onValueChange={(value) => setSelectedOption(value)}
            mode={Platform.OS === "android" ? "dropdown" : undefined}
            style={[styles.picker, { flex: 1, marginRight: 8 }]}
            itemStyle={Platform.OS === "ios" ? styles.pickerItem : undefined}
          >
            <Picker.Item label="Últimos 30 días" value="recent" />
            <Picker.Item label="Canceladas (últimos 30 días)" value="cancelledPast" />
            <Picker.Item label="Canceladas (próximos 30 días)" value="cancelledUpcoming" />
          </Picker>

          <Picker
            selectedValue={selectedGuest}
            onValueChange={(value) => setSelectedGuest(value)}
            mode={Platform.OS === "android" ? "dropdown" : undefined}
            style={[styles.picker, { flex: 1, marginLeft: 8 }]}
            itemStyle={Platform.OS === "ios" ? styles.pickerItem : undefined}
          >
            {allGuests.map((guest, index) => (
              <Picker.Item key={index} label={guest} value={guest} />
            ))}
          </Picker>
        </View>

        {!loading && renderList()}

        {selectedBooking && (
          <Modal
            visible={notesModalVisible}
            animationType="slide"
            transparent
            onRequestClose={() => setNotesModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Notas de la cita</Text>

                <BodyBoldText>Número de cita:</BodyBoldText>
                <Text style={styles.readOnlyNotes}>
                  {selectedBooking.autoNumber ?? "No disponible"}
                </Text>

                <BodyBoldText style={{ marginTop: 16 }}>Notas para el usuario:</BodyBoldText>
                <Text style={styles.readOnlyNotes}>
                  {selectedBooking.notasUsuario || "Sin notas"}
                </Text>

                <BodyBoldText style={{ marginTop: 16 }}>Notas internas del empleado:</BodyBoldText>
                <Text style={styles.readOnlyNotes}>
                  {selectedBooking.notasEmpleado || "Sin notas"}
                </Text>

                <Button_style2
                  title="Cerrar"
                  onPress={() => setNotesModalVisible(false)}
                  style={{ marginTop: 20 }}
                />
              </View>
            </View>
          </Modal>
        )}

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
  picker: {
    ...Platform.select({
      ios: {
        height: 150, // enough for scroll wheel
        justifyContent: 'center',
      },
      android: {
        height: 50,
        justifyContent: 'center',
      },
    }),
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#00796b',
  },
  pickerItem: {
    fontSize: 16,
    color: 'black',
  },
  bookingItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  notesButtonWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  notesButton: {
    color: '#00796b',
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  readOnlyNotes: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    backgroundColor: '#f5f5f5',
    marginTop: 6,
  },
  closeButton: {
    marginTop: 20,
    color: '#00796b',
    fontWeight: '600',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    maxHeight: "70%",
  },
});
