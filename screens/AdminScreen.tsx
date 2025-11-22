import GradientBackground from '@/Components/GradientBackground';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Button_style2 from "../Components/Button_style2";
import ExtendWeeklyAvailability from '../Components/ExtendWeeklyAvailability'; // ✅ import reusable component
import Logo from '../Components/Logo';
import { logout } from '../Services/authService';
import { auth, db } from '../Services/firebaseConfig';
import { RootStackParamList } from '../src/types';

export default function AdminScreen() {
  type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
  const navigation = useNavigation<NavigationProp>();
  const windowDimensions = useWindowDimensions();
  const windowWidth = windowDimensions.width;
  const windowHeight = windowDimensions.height;
  const username = auth.currentUser?.displayName;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : 'Buenas tardes';

  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    const fetchUid = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const currentUid = currentUser.uid;
      setUid(currentUid);

      // optional: confirm role is admin
      const userDoc = await getDoc(doc(db, 'users', currentUid));
      const role = userDoc.data()?.role;
      if (role !== 'admin') {
        // if needed, handle non-admin case
      }
    };

    fetchUid();
  }, []);

  return (
    <GradientBackground>
      <ScrollView 
            style={{ flex: 1 }}
            contentContainerStyle={styles.scrollContent}>
      <Logo/>
      <View style={styles.container}>
        <View style={{
          width: windowWidth > 500 ? '70%' : '90%',
          height: windowHeight > 600 ? '60%' : '90%',
          flexDirection: 'column',
          gap: 10
        }}>
          <Text style={styles.welcomeText}>
            {`${greeting}, ${username || 'invitado'} 👋`}
          </Text>
          <Text style={styles.welcomeText}>
            {`¡Nos alegra verte en Sovrano!`}
          </Text>

          {/* ✅ Weekly availability extension */}
          {uid && <ExtendWeeklyAvailability uid={uid} />}

          <Button_style2 title="Assignar responsabilidad" onPress={() => navigation.navigate("Assignar responsabilidad")} />
          <Button_style2 title="Manejar servicios" onPress={() => navigation.navigate("Manejar servicios")} />
          <Button_style2 title="Calendario de citas" onPress={() => navigation.navigate("Calendario de citas")} />
          <Button_style2 title="Historia de citas" onPress={() => navigation.navigate("Historia de citas")} />

          <Button_style2
            title="Inicio empleado"
            onPress={() =>
              navigation.navigate("Inicio-Empleado", { role: "admin" })
            }
          />

          <Button_style2
            title="Salir"
            onPress={async () => {
              await logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Inicio-Sovrano' }],
              });
            }}
          />
        </View>
      </View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  welcomeText: {
    fontFamily: 'Playfair-Bold',
    fontSize: 18,
    color: '#3e3e3e',
    textAlign: 'center',
    marginBottom: 16,
  },
  scrollContent: {
  justifyContent: 'flex-start',
  paddingBottom: 40,
  alignItems: 'center',
},
});
