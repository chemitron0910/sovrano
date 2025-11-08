import GradientBackground from '@/Components/GradientBackground';
import BodyText from '@/Components/typography/BodyText';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Button_style2 from '../Components/Button_style2';
import Logo from '../Components/Logo';
import { logout } from '../Services/authService';
import { auth, db } from '../Services/firebaseConfig';
import { RootStackParamList } from '../src/types';
import { assignWeeklyAvailability } from '../utils/assignWeeklyAvailability';

export default function StaffScreen() {
  type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
  const navigation = useNavigation<NavigationProp>();
  const windowDimensions = useWindowDimensions();
  const windowWidth = windowDimensions.width;
  const windowHeight = windowDimensions.height;
  const [uid, setUid] = useState<string | null>(null);
  const [buttonTitle, setButtonTitle] = useState('Salir');
  const [showExtendWarning, setShowExtendWarning] = useState(false);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : 'Buenas tardes';
  const username = auth.currentUser?.displayName;

  useEffect(() => {
    const fetchRoleAndAvailability = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const currentUid = currentUser.uid;
      setUid(currentUid);

      const userDoc = await getDoc(doc(db, 'users', currentUid));
      const role = userDoc.data()?.role;

      if (role === 'admin') {
        setButtonTitle('Inicio admin');
      } else {
        setButtonTitle('Salir');

        // 🔄 Check availability under unified users/{uid}/availability
        const availabilitySnap = await getDocs(collection(db, 'users', currentUid, 'availability'));

        if (availabilitySnap.empty) {
          setShowExtendWarning(true);
          return;
        }

        const dates = availabilitySnap.docs.map(doc => doc.id).sort();
        const lastDate = dates[dates.length - 1];
        const daysAhead = (new Date(lastDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);

        if (daysAhead < 5) {
          setShowExtendWarning(true);
        }
      }
    };

    fetchRoleAndAvailability();
  }, []);

  return (
    <GradientBackground>
      {loadingAvailability && (
        <View style={styles.overlay}>
          <View style={styles.overlayContent}>
            <Text style={styles.overlayText}>Configurando disponibilidad...</Text>
          </View>
        </View>
      )}

      <Logo />
      <View style={styles.container}>
        <View
          style={{
            width: windowWidth > 500 ? '70%' : '90%',
            height: windowHeight > 600 ? '60%' : '90%',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <View>
            <Text style={styles.welcomeText}>{`${greeting}, ${username || 'invitado'} 👋`}</Text>
          </View>
          <View>
            <Text style={styles.welcomeText}>¡Nos alegra verte en Sovrano!</Text>
          </View>

          {showExtendWarning && uid && (
            <View style={{ marginBottom: 10 }}>
              <BodyText
                style={{
                  color: '#a94442',
                  fontSize: 16,
                  textAlign: 'center',
                  marginBottom: 8,
                }}
              >
                Tu disponibilidad termina en 5 dias o no está configurada. ¿Deseas extenderla?
              </BodyText>
              <Button_style2
                title="Extender disponibilidad"
                onPress={async () => {
                  if (!uid) return;
                  try {
                    setLoadingAvailability(true); // 🔄 Show overlay
                    await assignWeeklyAvailability(uid, 4);
                    setShowExtendWarning(false);
                    Alert.alert('Éxito', 'Disponibilidad extendida por 4 semanas.');
                  } catch (error) {
                    Alert.alert('Error', 'No se pudo extender la disponibilidad.');
                  } finally {
                    setLoadingAvailability(false); // ✅ Hide overlay
                  }
                }}
              />
            </View>
          )}

          <Button_style2 title="Calendario de citas" onPress={() => navigation.navigate('Calendario de citas.')} />
          <Button_style2 title="Historia de citas" onPress={() => navigation.navigate('Historia de citas.')} />

          <Button_style2
            title={buttonTitle}
            onPress={async () => {
              const currentUser = auth.currentUser;

              if (!currentUser) {
                await logout();
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Inicio-Sovrano' }],
                });
                return;
              }

              const uid = currentUser.uid;
              const userDoc = await getDoc(doc(db, 'users', uid));
              const role = userDoc.data()?.role;

              if (role === 'empleado') {
                await logout();
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Inicio-Sovrano' }],
                });
              } else if (role === 'admin') {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Inicio-Admin', params: { userId: uid, role } }],
                });
              } else {
                await logout();
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Inicio-Sovrano' }],
                });
              }
            }}
          />
        </View>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  welcomeText: {
    fontFamily: 'Playfair-Bold',
    fontSize: 18,
    color: '#3e3e3e',
    textAlign: 'center',
    marginBottom: 16,
  },
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
