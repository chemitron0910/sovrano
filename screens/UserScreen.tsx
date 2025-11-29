import GradientBackground from '@/Components/GradientBackground';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { collection, doc, getDoc, getDocs, getFirestore } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { FlatList, Image, Modal, StatusBar, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import Button_style2 from "../Components/Button_style2";
import Logo from '../Components/Logo';
import { logout } from '../Services/authService';
import { auth } from '../Services/firebaseConfig';
import { RootStackParamList } from '../src/types';

export default function UserScreen() {

  type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
  const navigation = useNavigation<NavigationProp>();
  const windowDimensions = useWindowDimensions();
  const windowWidth = windowDimensions.width;
  const windowHeight = windowDimensions.height;
  const username = auth.currentUser?.displayName;
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Buenos días' : 'Buenas tardes';
  const [modalVisible, setModalVisible] = useState(false);
  const [stylists, setStylists] = useState<{ id: string; name: string; profilePic?: string }[]>([]);

  useEffect(() => {
  const loadStylists = async () => {
    try {
      const db = getFirestore();
      const snapshot = await getDocs(collection(db, "users"));
      const list: { id: string; name: string; profilePic?: string; role: string }[] = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if ((data.role === "empleado" || data.role === "admin") && data.activo === true) {
          let profilePic: string | undefined;
          try {
            const profileRef = doc(db, `users/${docSnap.id}/profile/info`);
            const profileSnap = await getDoc(profileRef);
            if (profileSnap.exists()) {
              profilePic = profileSnap.data().profilePic;
            }
          } catch (err) {
            console.error("Error fetching profile info:", err);
          }

          list.push({
            id: docSnap.id,
            name: data.username || "Sin nombre",
            profilePic,
            role: data.role,
          });
        }
      }

      setStylists(list);
    } catch (err) {
      console.error("Error loading stylists:", err);
    }
  };
  loadStylists();
}, []);

  return (
    <GradientBackground>
      <Logo/>
      <View style={styles.container}>
        <Text style={styles.welcomeText}>
          {`${greeting}, ${username || 'usuario'} 👋!`}
        </Text>

        <Text style={styles.welcomeText}>
          {`¡Nos alegra verte en Sovrano!`}
        </Text>

        <View style={{ padding: 10 }}>
        <Button_style2 
          title="Nuestros artistas" 
          onPress={() => setModalVisible(true)} // ✅ open modal
        />
        </View>

        
        <View style={{ padding: 10 }}>
          <Button_style2 
            title="Ir a servicios" 
            onPress={() => navigation.navigate("Nuestros servicios", { role: "usuario" })}
          />
        </View>

        <View style={{ padding: 10 }}>
          {/* 👇 Pass role explicitly when navigating */}
          <Button_style2
            title="Agenda tu cita"
            onPress={() => navigation.navigate("Agenda tu cita", { role: "usuario" })}
          />
        </View>

        <View style={{ padding: 10 }}>
          <Button_style2 
            title="Historia de citas" 
            onPress={() => navigation.navigate("Historial de citas")}
          />
        </View>

        <View style={{ padding: 10 }}>
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

        <Modal visible={modalVisible} animationType="slide" transparent>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Selecciona un artista</Text>
      <FlatList
        data={stylists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.stylistButton}
            onPress={() => {
              setModalVisible(false);
              navigation.navigate("Nuestros artistas", {
                role: "usuario", // ✅ role is usuario here
                staffId: item.id,
              });
            }}
          >
            {item.profilePic ? (
              <Image source={{ uri: item.profilePic }} style={styles.stylistImage} />
            ) : (
              <View style={styles.placeholderPic}>
                <Text>Sin foto</Text>
              </View>
            )}
            <View>
              <Text style={styles.stylistText}>{item.name}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
      <Button_style2 title="Cerrar" onPress={() => setModalVisible(false)} />
    </View>
  </View>
</Modal>

      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    alignContent: 'center', 
    padding:10,
    paddingTop: StatusBar.currentHeight || 0,
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  welcomeText: {
    fontFamily: 'Playfair-Bold', // ✅ Your custom font
    fontSize: 18,
    color: '#3e3e3e', // Optional: match Sovrano’s palette
    textAlign: 'center',
    marginBottom: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  stylistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  stylistImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  stylistText: {
    fontSize: 16,
  },
  placeholderPic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  roleText: {
  fontSize: 12,
  color: '#666',
},
});
