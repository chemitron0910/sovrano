import GradientBackground from '@/Components/GradientBackground';
import BodyText from '@/Components/typography/BodyText';
import SubTitleText from '@/Components/typography/SubTitleText';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert,
  FlatList, Modal,
  Platform,
  ScrollView, StyleSheet, Switch, Text,
  TouchableOpacity, View
} from 'react-native';
import Button_style2 from '../Components/Button_style2';
import { auth, db } from '../Services/firebaseConfig';
import type { RootStackParamList } from '../src/types';
import { handleCancelBooking, normalizeTime } from "../utils/handleCancelBooking";

export default function StaffCalendarScreen() {
    const availableTimes = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [bookedModalVisible, setBookedModalVisible] = useState(false);
    const [bookedSlot, setBookedSlot] = useState<TimeSlot | null>(null);
    const [bookedDateIso, setBookedDateIso] = useState<string | null>(null);
    const [isDayOff, setIsDayOff] = useState(false);
    const [loading, setLoading] = useState(false);
    const [bulkModalVisible, setBulkModalVisible] = useState(false);
    const [bulkIsDayOff, setBulkIsDayOff] = useState(false);
    const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
    const [bulkSlots, setBulkSlots] = useState<TimeSlot[]>([]);
    const [weekDates, setWeekDates] = useState<Date[]>([]);
    const [bookingDetails, setBookingDetails] = useState<any | null>(null);
    type TimeSlot = {
      time: string;
      booked: boolean;
      bookingId: string | null; // allow null explicitly
    };

    type Availability = {
      isDayOff: boolean;
      timeSlots: TimeSlot[];
    };
    type AvailabilityDay = {
      timeSlots: TimeSlot[];
      isDayOff: boolean;
    };
    const [weeklyAvailability, setWeeklyAvailability] = useState<Record<string, AvailabilityDay>>({});
    const [weekStartDate, setWeekStartDate] = useState(new Date());
    const [showWeekPicker, setShowWeekPicker] = useState(false);
    const uid = auth.currentUser?.uid;
    const isoDate = format(selectedDate, 'yyyy-MM-dd');
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const cancelFromStaff = async (bookingId: string) => {
  await handleCancelBooking({
    bookingId,
    cancelledBy: "empleado",
    onAfterCancel: async () => {
      setBookedModalVisible(false);

      if (bookedDateIso) {
        setWeeklyAvailability(prev => {
          const updated = { ...prev };
          const slots = updated[bookedDateIso]?.timeSlots.map(s =>
            s.bookingId === bookingId
              ? { ...s, booked: false, bookingId: null, status: null }
              : s
          );
          updated[bookedDateIso] = { ...updated[bookedDateIso], timeSlots: slots };
          return updated;
        });
      }
    },
  });
};

  const loadAvailability = async () => {
    if (!uid) return;
    setLoading(true);
    try {
      const ref = doc(db, 'users', uid, 'availability', isoDate);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setSelectedSlots(data.timeSlots || []);
        setIsDayOff(data.isDayOff || false);
      } else {
        setSelectedSlots([]);
        setIsDayOff(false);
      }
    } catch (error) {
      console.error('Error loading availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const finalizeAvailability = async (
  ref: any,
  existingSlots: TimeSlot[],
  normalizedSelected: TimeSlot[],
  affectedBookings: TimeSlot[]
) => {
  const norm = (t: string) => normalizeTime(String(t)).replace(/['"]+/g, "").trim();
  const bulkTimes = new Set(normalizedSelected.map(s => s.time));

  const cleanedSlots = existingSlots.filter(slot => {
    const wasCancelled = affectedBookings.some(b => b.bookingId === slot.bookingId);
    const normalizedTime = norm(slot.time);

    if (wasCancelled && !bulkTimes.has(normalizedTime)) {
      return false;
    }
    if (wasCancelled) {
      slot.booked = false;
      slot.bookingId = null;
    }
    return true;
  });

  const preservedBooked = cleanedSlots.filter(sl => sl.booked && !!sl.bookingId);

  const mergedMap = new Map<string, TimeSlot>();
  for (const sl of normalizedSelected) mergedMap.set(sl.time, sl);
  for (const sl of preservedBooked) mergedMap.set(sl.time, sl);

  const mergedSlots: TimeSlot[] = Array.from(mergedMap.values()).sort((a, b) =>
    a.time.localeCompare(b.time)
  );

  const newData: Availability = {
    timeSlots: mergedSlots,
    isDayOff,
  };

  await setDoc(ref, newData);

  setWeeklyAvailability(prev => ({
    ...prev,
    [isoDate]: newData,
  }));

  Alert.alert('Guardado', `Disponibilidad actualizada para ${isoDate}`);
  setLoading(false);
};

const saveAvailability = async () => {
  if (!uid) return;
  setLoading(true);
  try {
    const ref = doc(db, 'users', uid, 'availability', isoDate);
    const snap = await getDoc(ref);

    const existingData: Availability = snap.exists()
      ? (snap.data() as Availability)
      : { timeSlots: [], isDayOff: false };

    const existingSlots = existingData.timeSlots || [];
    const norm = (t: string) => normalizeTime(String(t)).replace(/['"]+/g, "").trim();

    // Normalize selected slots (new availability)
    const normalizedSelected: TimeSlot[] = selectedSlots.map(s => ({
      time: norm(s.time),
      booked: false,
      bookingId: null,
    }));

    // 1) Day off flow — dedupe bookings by bookingId
    if (isDayOff) {
      const bookedSlots = existingSlots.filter(s => s.booked && s.bookingId);
      const uniqueBookings = Array.from(
        new Map(bookedSlots.map(s => [s.bookingId, s])).values()
      );

      if (uniqueBookings.length > 0) {
        const count = uniqueBookings.length;
        const plural = count === 1 ? "cita" : "citas";

        Alert.alert(
          "Advertencia",
          `Hay ${count} ${plural} programada${count === 1 ? "" : "s"} en este día que será${count === 1 ? "" : "n"} cancelada${count === 1 ? "" : "s"}. ¿Deseas continuar y cancelar esta${count === 1 ? "" : "s"} ${plural}?`,
          [
            {
              text: "No",
              style: "cancel",
              onPress: () => setLoading(false),
            },
            {
              text: "Sí",
              onPress: async () => {
                for (const b of uniqueBookings) {
                  await handleCancelBooking({
                    bookingId: b.bookingId!,
                    cancelledBy: "empleado",
                  });
                }
                await setDoc(ref, { isDayOff: true, timeSlots: [] });
                setWeeklyAvailability(prev => ({
                  ...prev,
                  [isoDate]: { isDayOff: true, timeSlots: [] },
                }));
                Alert.alert("Guardado", `El día ${isoDate} fue marcado como libre.`);
                setLoading(false);
              },
            },
          ]
        );
      } else {
        await setDoc(ref, { isDayOff: true, timeSlots: [] });
        setWeeklyAvailability(prev => ({
          ...prev,
          [isoDate]: { isDayOff: true, timeSlots: [] },
        }));
        Alert.alert("Guardado", `El día ${isoDate} fue marcado como libre.`);
        setLoading(false);
      }
      return; // Exit early for day off
    }

    // 2) Normal flow — dedupe affected bookings by bookingId
    const slotsToRemove = existingSlots
      .filter(s => !normalizedSelected.some(ns => ns.time === norm(s.time)))
      .map(s => norm(s.time));

    const affectedSlots = existingSlots.filter(
      s => slotsToRemove.includes(norm(s.time)) && s.booked && s.bookingId
    );
    const affectedBookings = Array.from(
      new Map(affectedSlots.map(s => [s.bookingId, s])).values()
    );

    if (affectedBookings.length > 0) {
      const count = affectedBookings.length;
      const plural = count === 1 ? "cita" : "citas";

      Alert.alert(
        "Advertencia",
        `Hay ${count} ${plural} programada${count === 1 ? "" : "s"} en este día que será${count === 1 ? "" : "n"} afectada${count === 1 ? "" : "s"}. ¿Deseas continuar y cancelar esta${count === 1 ? "" : "s"} ${plural}?`,
        [
          {
            text: "No",
            style: "cancel",
            onPress: () => setLoading(false),
          },
          {
            text: "Sí",
            onPress: async () => {
              for (const b of affectedBookings) {
                await handleCancelBooking({
                  bookingId: b.bookingId!,
                  cancelledBy: "empleado",
                });
              }
              await finalizeAvailability(ref, existingSlots, normalizedSelected, affectedBookings);
            },
          },
        ]
      );
    } else {
      await finalizeAvailability(ref, existingSlots, normalizedSelected, []);
    }
  } catch (error) {
    console.error("Error saving availability:", error);
    Alert.alert("Error", "No se pudo guardar la disponibilidad.");
    setLoading(false);
  }
};

// Define fetchWeek outside useEffect so you can call it manually
const fetchWeek = async () => {
  if (!uid || weekDates.length === 0) return;
  setLoading(true);

  try {
    const fetches = weekDates.map(async date => {
      const iso = format(date, 'yyyy-MM-dd');
      const ref = doc(db, 'users', uid, 'availability', iso);
      const snap = await getDoc(ref);
      return {
        iso,
        data: snap.exists()
          ? {
              timeSlots: snap.data().timeSlots || [],
              isDayOff: snap.data().isDayOff || false,
            }
          : { timeSlots: [], isDayOff: false },
      };
    });

    const resultsArray = await Promise.all(fetches);

    const results: typeof weeklyAvailability = {};
    resultsArray.forEach(({ iso, data }) => {
      results[iso] = data;
    });

    setWeeklyAvailability(results);
  } catch (error) {
    console.error('Error loading weekly availability:', error);
  } finally {
    setLoading(false);
  }
};

const applyBulkAvailability = async (
  empleadoId: string,
  weekDates: string[],
  bulkSlots: { time: string; booked: boolean; bookingId: string | null }[],
  bulkIsDayOff: boolean,
  onAfterApply?: (didApply: boolean) => void
) => {
  try {
    const snapshots: {
      isoDate: string;
      availabilityRef: any;
      availabilityData: any;
      affectedBookings: any[];
    }[] = [];

    for (const isoDate of weekDates) {
      const availabilityRef = doc(db, "users", empleadoId, "availability", isoDate);
      const availabilitySnap = await getDoc(availabilityRef);

      const availabilityData = availabilitySnap.exists()
        ? availabilitySnap.data()
        : { timeSlots: [], isDayOff: false };

      const slots: any[] = availabilityData.timeSlots || [];

      const slotsToRemove = bulkIsDayOff
        ? slots.map(s => normalizeTime(s.time))
        : slots
            .filter(s => !bulkSlots.some(bs => bs.time === normalizeTime(s.time)))
            .map(s => normalizeTime(s.time));

      const affectedBookingsMap = new Map<string, any>();
      for (const s of slots) {
        if (slotsToRemove.includes(normalizeTime(s.time)) && s.booked && s.bookingId) {
          const bookingRef = doc(db, "bookings", s.bookingId);
          const bookingSnap = await getDoc(bookingRef);
          if (bookingSnap.exists() && bookingSnap.data().status === "Reservado") {
            affectedBookingsMap.set(s.bookingId, { ...s, bookingData: bookingSnap.data() });
          }
        }
      }

      const affectedBookings = Array.from(affectedBookingsMap.values());

      snapshots.push({ isoDate, availabilityRef, availabilityData, affectedBookings });
    }

    const allAffected = snapshots.flatMap(s => s.affectedBookings);
    const uniqueBookingIds = Array.from(new Set(allAffected.map(b => b.bookingId)));

    if (uniqueBookingIds.length > 0) {
      const count = uniqueBookingIds.length;
      const plural = count === 1 ? "cita" : "citas";

      Alert.alert(
        "Advertencia",
        `Hay ${count} ${plural} programada${count === 1 ? "" : "s"} en la semana que será${count === 1 ? "" : "n"} afectada${count === 1 ? "" : "s"}. ¿Deseas continuar y cancelar esta${count === 1 ? "" : "s"} ${plural}?`,
        [
          {
            text: "No",
            style: "cancel",
            onPress: () => {
              if (onAfterApply) onAfterApply(false);
            },
          },
          {
            text: "Sí",
            onPress: async () => {
              for (const bookingId of uniqueBookingIds) {
                await handleCancelBooking({
                  bookingId,
                  cancelledBy: "empleado",
                });
              }

              const norm = (t: string) => normalizeTime(String(t)).replace(/['"]+/g, "").trim();
              const bulkTimes = new Set(bulkSlots.map(bs => norm(bs.time)));

              for (const s of snapshots) {
                const cancelledIds = new Set(allAffected.map(b => b.bookingId));

                const cleanedSlots = (s.availabilityData.timeSlots || []).filter((slot: any) => {
                  const normalizedTime = norm(slot.time);

                  if (cancelledIds.has(slot.bookingId)) {
                    if (!bulkTimes.has(normalizedTime)) {
                      return false; // remove slot entirely
                    }
                    slot.booked = false;
                    slot.bookingId = null;
                  }

                  return true;
                });

                s.availabilityData.timeSlots = cleanedSlots;
              }

              for (const s of snapshots) {
                if (bulkIsDayOff) {
                  await setDoc(s.availabilityRef, {
                    ...s.availabilityData,
                    isDayOff: true,
                    timeSlots: [],
                  });
                  continue;
                }

                const norm = (t: string) => normalizeTime(String(t)).replace(/['"]+/g, "").trim();

                const existingSlots: TimeSlot[] = (s.availabilityData.timeSlots || []).map((slot: any) => ({
                  time: norm(slot.time),
                  booked: !!slot.booked,
                  bookingId: slot.bookingId ?? null,
                }));

                const preservedBooked = existingSlots.filter(sl => sl.booked && !!sl.bookingId);

                const normalizedBulkSlots: TimeSlot[] = bulkSlots.map(bs => ({
                  time: norm(bs.time),
                  booked: false,
                  bookingId: null,
                }));

                const mergedMap = new Map<string, TimeSlot>();
                for (const sl of normalizedBulkSlots) mergedMap.set(sl.time, sl);
                for (const sl of preservedBooked) mergedMap.set(sl.time, sl);

                const mergedSlots: TimeSlot[] = Array.from(mergedMap.values()).sort((a, b) =>
                  a.time.localeCompare(b.time)
                );

                await setDoc(s.availabilityRef, {
                  ...s.availabilityData,
                  isDayOff: false,
                  timeSlots: mergedSlots,
                });
              }

              Alert.alert("Éxito", "Disponibilidad semanal actualizada.");
              if (onAfterApply) onAfterApply(true);
            },
          },
        ]
      );
    } else {
      for (const s of snapshots) {
        if (bulkIsDayOff) {
          await setDoc(s.availabilityRef, {
            ...s.availabilityData,
            isDayOff: true,
            timeSlots: [],
          });
          continue;
        }

        const norm = (t: string) => normalizeTime(String(t)).replace(/['"]+/g, "").trim();

        const existingSlots: TimeSlot[] = (s.availabilityData.timeSlots || []).map((slot: any) => ({
          time: norm(slot.time),
          booked: !!slot.booked,
          bookingId: slot.bookingId ?? null,
        }));

        const preservedBooked = existingSlots.filter(sl => sl.booked && !!sl.bookingId);

        const normalizedBulkSlots: TimeSlot[] = bulkSlots.map(bs => ({
          time: norm(bs.time),
          booked: false,
          bookingId: null,
        }));

        const mergedMap = new Map<string, TimeSlot>();
        for (const sl of normalizedBulkSlots) mergedMap.set(sl.time, sl);
        for (const sl of preservedBooked) mergedMap.set(sl.time, sl);

        const mergedSlots: TimeSlot[] = Array.from(mergedMap.values()).sort((a, b) =>
          a.time.localeCompare(b.time)
        );

        await setDoc(s.availabilityRef, {
          ...s.availabilityData,
          isDayOff: false,
          timeSlots: mergedSlots,
        });
      }
      if (onAfterApply) onAfterApply(true);
    }
  } catch (error) {
    console.error("❌ Error applying bulk availability:", error);
    Alert.alert("Error", "No se pudo aplicar la disponibilidad semanal.");
    if (onAfterApply) onAfterApply(false);
  }
};

// wrapper for the button
const handleApplyBulk = async () => {
  if (!uid) {
    Alert.alert("Error", "No se encontró el empleado actual.");
    return;
  }

  setBulkModalVisible(false); // close modal immediately
  setLoading(true);           // show spinner immediately

  const isoWeekDates = weekDates.map(d => format(d, "yyyy-MM-dd"));

  await applyBulkAvailability(
    uid,
    isoWeekDates,
    bulkSlots,
    bulkIsDayOff,
    async (didApply) => {
      if (didApply) {
        await fetchWeek(); // refresh only if changes applied
      }
      setLoading(false);   // hide spinner after either choice
    }
  );
};

useEffect(() => {
  const fetchBooking = async () => {
    if (bookedSlot?.bookingId) {
      const bookingRef = doc(db, "bookings", bookedSlot.bookingId);
      const bookingSnap = await getDoc(bookingRef);
      if (bookingSnap.exists()) {
        const data = bookingSnap.data();
        setBookingDetails(data); // includes guestName, email, service, autoNumber, etc.
      }
    }
  };
  fetchBooking();
}, [bookedSlot]);

useEffect(() => {
  const iso = format(selectedDate, 'yyyy-MM-dd');
  const weeklyData = weeklyAvailability[iso];

  if (weeklyData) {
    setIsDayOff(weeklyData.isDayOff ?? false);
    setSelectedSlots(weeklyData.timeSlots ?? []);
  } else {
    setIsDayOff(false);
    setSelectedSlots([]);
  }
}, [selectedDate, weeklyAvailability]);

  useEffect(() => {
    loadAvailability();
  }, [weekStartDate]);

  const toggleSlot = (time: string) => {
  setSelectedSlots(prev => {
    const exists = prev.find(slot => slot.time === time);
    if (exists) {
      // remove slot
      return prev.filter(slot => slot.time !== time);
    } else {
      // add slot with booked default and bookingId
      return [...prev, { time, booked: false, bookingId: null }];
    }
  });
};

// Call it once when component mounts or when weekDates/uid changes
useEffect(() => {
  fetchWeek();
}, [weekDates, uid]);

  useEffect(() => {
  const start = new Date(weekStartDate);
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
  setWeekDates(week);
}, [weekStartDate]);

  return (
    <GradientBackground>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
        {loading && (
  <View style={styles.savingOverlay}>
    <View style={styles.savingBox}>
      <ActivityIndicator size="large" color="#fff" />
      <Text style={styles.savingText}>Actualizando disponibilidad...</Text>
    </View>
  </View>
)}

    {/* SINGLE DAY / TIME EDITION */}
    <View style={{ marginTop: 24, alignItems:'center' }}>
  <SubTitleText>Disponibilidad diaria:</SubTitleText>
  <TouchableOpacity
    onPress={() => setShowDatePicker(true)}
    style={[styles.dateButton, { backgroundColor: '#d8d2c4' }]}
  >
    <BodyText>Seleccionar fecha (día único): {isoDate}</BodyText>
  </TouchableOpacity>
</View>

{showDatePicker && (
  <DateTimePicker
    value={selectedDate}
    mode="date"
    display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
    onChange={(_, date) => {
      setShowDatePicker(false);
      if (date) {
        setSelectedDate(date); // ✅ This must update the state
      }
    }}
    textColor="black"
  />
)}

<View style={styles.switchRow}>
  <BodyText>¿Día libre (día único)?</BodyText>
  <Switch value={isDayOff} onValueChange={setIsDayOff} />
</View>

{!isDayOff && (
  <Button_style2 title="Editar horarios" onPress={() => setModalVisible(true)} />
)}

{!isDayOff && selectedSlots.length > 0 && (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 16 }}>
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {selectedSlots
        .sort((a, b) => {
          const [ah, am] = a.time.replace(/['"]+/g, '').trim().split(':').map(Number);
          const [bh, bm] = b.time.replace(/['"]+/g, '').trim().split(':').map(Number);
          return ah === bh ? am - bm : ah - bh;
        })
        .map((slot, index) => {
          const slotContent = (
            <View
              key={index}
              style={[
                styles.gridItem,
                {
                  backgroundColor: slot.booked ? '#ddd' : '#f0f0f0',
                  borderColor: slot.booked ? '#aaa' : '#ccc',
                  borderWidth: 1,
                  opacity: slot.booked ? 0.6 : 1,
                },
              ]}
            >
              <Text style={{ color: slot.booked ? '#888' : 'black' }}>
                {slot.booked ? '🔒' : '✅'} {slot.time}
              </Text>
            </View>
          );

          // If booked, wrap in TouchableOpacity to show booking details modal
          if (slot.booked) {
            return (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setBookedSlot(slot);
                  setBookedDateIso(isoDate);
                  setBookedModalVisible(true);
                }}
              >
                {slotContent}
              </TouchableOpacity>
            );
          }

          return slotContent;
        })}
    </View>
  </ScrollView>
)}

{!isDayOff && selectedSlots.length === 0 && (
  <View style={{ marginVertical: 16 }}>
    <BodyText>Horarios seleccionados: Ninguno</BodyText>
  </View>
)}

<Button_style2 title="Guardar disponibilidad" onPress={saveAvailability} />

{/* Daily Slot Modal */}
<Modal visible={modalVisible} animationType="slide" transparent>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Selecciona horarios</Text>
      <FlatList
        data={availableTimes}
        keyExtractor={item => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.slotButton,
              selectedSlots.some(slot => slot.time === item) && styles.slotSelected,
            ]}
            onPress={() => toggleSlot(item)}
          >
            <Text style={styles.slotText}>{item}</Text>
          </TouchableOpacity>
        )}
      />
      <Button_style2 title="Cerrar" onPress={() => setModalVisible(false)} />
    </View>
  </View>
</Modal>

<Modal
  visible={bookedModalVisible}
  animationType="slide"
  transparent
  onRequestClose={() => setBookedModalVisible(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Detalles de la cita</Text>

      {bookedSlot && (
        <>
          <Text>Fecha: {bookedDateIso}</Text>
          <Text>Hora: {bookedSlot.time}</Text>
          <Text>Estado: Reservado</Text>
          {bookingDetails?.autoNumber && (
            <Text>Cita número: {bookingDetails.autoNumber}</Text>
          )}
          {bookingDetails?.userAutoNumber && (
            <Text>Usuario número: {bookingDetails.userAutoNumber}</Text>
          )}
        </>
      )}
      {bookingDetails && (
        <>
          <Text>Cliente: {bookingDetails.guestName}</Text>
          <Text>Email: {bookingDetails.email}</Text>
          <Text>Teléfono: {bookingDetails.phoneNumber}</Text>
          <Text>Servicio: {bookingDetails.service}</Text>
        </>
      )}

      <View style={{ marginBottom: 20 }}><Button_style2 title="Cerrar" onPress={() => setBookedModalVisible(false)} />
      </View>
      {bookedSlot?.bookingId && (
  <Button_style2
    title="Cancelar cita"
    onPress={() => cancelFromStaff(bookedSlot.bookingId!)}
  />
)}

    </View>
  </View>
</Modal>

{/* WEEKLY EDITION */}
<View style={{ marginTop: 24, width: '100%' }}>
  {/* Centered Subtitle */}
  <View style={{ alignItems: 'center', marginBottom: 12 }}>
    <SubTitleText>Disponibilidad semanal:</SubTitleText>
  </View>

  {/* Left-aligned date selector */}
  <View style={{ marginLeft: 26, alignItems: 'flex-start' }}>
    <TouchableOpacity
      onPress={() => setShowWeekPicker(true)}
      style={[styles.dateButton, { backgroundColor: '#d8d2c4' }]}
    >
      <BodyText>Seleccionar inicio de semana: {format(weekStartDate, 'yyyy-MM-dd')}</BodyText>
    </TouchableOpacity>
  </View>
</View>

{showWeekPicker && (
  <DateTimePicker
    value={weekStartDate}
    mode="date"
    display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
    onChange={(_, date) => {
      setShowWeekPicker(false);
      if (date) setWeekStartDate(date);
    }}
    textColor="black"
  />
)}

{weekDates.map(date => {
  const iso = format(date, 'yyyy-MM-dd');
  const dayLabel = new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);

  const data = weeklyAvailability[iso];
  const slots = data?.timeSlots || [];
  const isOff = data?.isDayOff;

  return (
    <View key={iso} style={styles.weekDayBlock}>
      <Text style={styles.weekDay}>
        {dayLabel} {isOff ? '— Día libre' : ''}
      </Text>

      {!isOff && slots.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {slots
  .sort((a, b) => {
    const [ah, am] = a.time.replace(/['"]+/g, '').trim().split(':').map(Number);
    const [bh, bm] = b.time.replace(/['"]+/g, '').trim().split(':').map(Number);
    return ah === bh ? am - bm : ah - bh;
  })
  .map((slot, index) => {
    const slotContent = (
      <View
        key={index}
        style={[
          styles.gridItem,
          {
            backgroundColor: slot.booked ? '#ddd' : '#f0f0f0',
            borderColor: slot.booked ? '#aaa' : '#ccc',
            borderWidth: 1,
            opacity: slot.booked ? 0.6 : 1,
          },
        ]}
      >
        <Text style={{ color: slot.booked ? '#888' : 'black' }}>
          {slot.booked ? '🔒' : '✅'} {slot.time}
        </Text>
      </View>
    );

    // If booked, wrap in TouchableOpacity to show booked details modal
if (slot.booked) {
  return (
    <TouchableOpacity
      key={index}
      onPress={() => {
        setBookedSlot(slot);
        setBookedDateIso(iso);
        setBookedModalVisible(true);
      }}
    >
      {slotContent}
    </TouchableOpacity>
  );
}

    return slotContent;
  })}

          </View>
        </ScrollView>
      )}

      {!isOff && slots.length === 0 && (
        <Text style={styles.weekSlots}>Sin horarios</Text>
      )}
    </View>
  );
})}

<View style={styles.marginTop}>
<Button_style2 title="Editar semana completa" onPress={() => setBulkModalVisible(true)} />
</View>
{/* Weekly Bulk Modal */}
<Modal visible={bulkModalVisible} animationType="slide" transparent>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Editar semana completa</Text>
      <View style={styles.switchRow}>
        <BodyText>¿Día libre (toda la semana)?</BodyText>
        <Switch value={bulkIsDayOff} onValueChange={setBulkIsDayOff} />
      </View>
      {!bulkIsDayOff && (
        <FlatList
          data={availableTimes}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.slotButton,
                bulkSlots.some(slot => slot.time === item)
               && styles.slotSelected,
              ]}
             onPress={() =>
  setBulkSlots(prev =>
    prev.some(slot => slot.time === item)
      // If already selected, remove it from availability
      ? prev.filter(slot => slot.time !== item)
      // If not selected, add it as available
      : [...prev, { time: item, booked: false, bookingId: null }]
  )
}
            >
              <Text style={styles.slotText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      )}
        <Button_style2 title="Aplicar a la semana" onPress={handleApplyBulk} />
        <View style={{ marginTop: 12 }}>
            <Button_style2 title="Cancelar" onPress={() => setBulkModalVisible(false)} />
        </View>
    </View>
  </View>
</Modal>

    </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  dateButton: { padding: 12, backgroundColor: '#eee', borderRadius: 8 },
  dateText: { fontSize: 16 },
  switchRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12, // ✅ adds space between text and switch
},
  switchLabel: { fontSize: 16, marginRight: 10 },
  selectedText: { marginTop: 10, fontSize: 16 },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  slotButton: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#eee',
    borderRadius: 6,
  },
  slotSelected: { backgroundColor: '#cce5ff' },
  slotText: { fontSize: 16 },
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
  },
  weekHeader: {
  fontSize: 18,
  fontWeight: 'bold',
  marginTop: 20,
  marginBottom: 10,
},
weekDayBlock: {
  marginTop: 10,
  alignItems: 'flex-start', // ✅ aligns text to the left
  width: '100%',            // ✅ ensures full-width layout
  marginLeft: 26, // ✅ adds left spacing per day block
},
weekDay: {
  fontSize: 16,
  fontWeight: '600',
},
weekSlots: {
  fontSize: 14,
  color: '#555',
  marginLeft: 10,
},
scrollContent: {
  justifyContent: 'flex-start',
  paddingBottom: 40,
  alignItems: 'center',
},
savingOverlay: {
  position: 'absolute',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.6)',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 999,
},
savingBox: {
  backgroundColor: '#333',
  padding: 20,
  borderRadius: 10,
  alignItems: 'center',
},
savingText: {
  marginTop: 10,
  color: '#fff',
  fontSize: 16,
  fontWeight: '500',
},
marginTop:{
  marginTop: 10,
},
gridItem: {
  paddingVertical: 10,
  paddingHorizontal: 14,
  borderRadius: 6,
  minWidth: 80,
  alignItems: 'center',
  justifyContent: 'center',
},
});
