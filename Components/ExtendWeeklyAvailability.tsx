import Button_style2 from '@/Components/Button_style2';
import BodyText from '@/Components/typography/BodyText';
import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { db } from '../Services/firebaseConfig';
import { assignWeeklyAvailability } from '../utils/assignWeeklyAvailability';

type Props = {
  uid: string;
};

export default function ExtendWeeklyAvailability({ uid }: Props) {
  const [showExtendWarning, setShowExtendWarning] = useState(false);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  useEffect(() => {
    const checkAvailability = async () => {
      if (!uid) return;

      const availabilitySnap = await getDocs(collection(db, 'users', uid, 'availability'));

      if (availabilitySnap.empty) {
        setShowExtendWarning(true);
        return;
      }

      const dates = availabilitySnap.docs.map(doc => doc.id).sort();
      const lastDate = dates[dates.length - 1];
      const daysAhead =
        (new Date(lastDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);

      if (daysAhead < 5) {
        setShowExtendWarning(true);
      }
    };

    checkAvailability();
  }, [uid]);

  if (!showExtendWarning) return null;

  return (
    <View style={{ marginBottom: 10 }}>
      {loadingAvailability && (
        <View style={styles.overlay}>
          <View style={styles.overlayContent}>
            <Text style={styles.overlayText}>Configurando disponibilidad...</Text>
          </View>
        </View>
      )}

      <BodyText
        style={{
          color: '#a94442',
          fontSize: 16,
          textAlign: 'center',
          marginBottom: 8,
        }}
      >
        Tu disponibilidad termina en 5 días o no está configurada. ¿Deseas extenderla?
      </BodyText>
      <Button_style2
        title="Extender disponibilidad"
        onPress={async () => {
          try {
            setLoadingAvailability(true);
            await assignWeeklyAvailability(uid, 4);
            setShowExtendWarning(false);
            Alert.alert('Éxito', 'Disponibilidad extendida por 4 semanas.');
          } catch (error) {
            Alert.alert('Error', 'No se pudo extender la disponibilidad.');
          } finally {
            setLoadingAvailability(false);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  overlayContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  overlayText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
});
