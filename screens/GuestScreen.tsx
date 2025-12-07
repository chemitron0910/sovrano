import GradientBackground from '@/Components/GradientBackground';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { collection, doc, getDoc, getDocs, getFirestore } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import Button_style2 from "../Components/Button_style2";
import Logo from '../Components/Logo';
import { logout } from '../Services/authService';
import { RootStackParamList } from '../src/types';
import { logError } from "../utils/logger";

export default function GuestScreen() {
  type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
  const navigation = useNavigation<NavigationProp>();
  const windowDimensions = useWindowDimensions();
  const [modalVisible, setModalVisible] = useState(false);
  const [stylists, setStylists] = useState<{ id: string; name: string; profilePic?: string }[]>([]);

  // 🔎 Load stylists from Firestore
  useEffect(() => {
    const loadStylists = async () => {
      try {
        const db = getFirestore();
        const snapshot = await getDocs(collection(db, "users"));
        const list: { id: string; name: string; profilePic?: string }[] = [];

        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();
          if ((data.role === "empleado" || data.role === "admin") && data.activo === true) {
            // fetch profile info subdoc for picture
            let profilePic: string | undefined;
            try {
              const profileRef = doc(db, `users/${docSnap.id}/profile/info`);
              const profileSnap = await getDoc(profileRef);
              if (profileSnap.exists()) {
                profilePic = profileSnap.data().profilePic;
              }
            } catch (err) {
              logError("Error fetching profile info:", err);
            }

            list.push({
              id: docSnap.id,
              name: data.username || "Sin nombre",
              profilePic,
            });
          }
        }

        setStylists(list);
      } catch (err) {
        logError("Error loading stylists:", err);
      }
    };
    loadStylists();
  }, []);

  return (
    <GradientBackground>
      <View style={styles.container}>
        <Logo/>

        <Button_style2 
          title="Nuestros servicios" 
          onPress={() => navigation.navigate("Nuestros servicios", { role: "guest" })}
        />

        {/* ✅ Open modal instead of navigating directly */}
        <Button_style2 
          title="Nuestros artistas" 
          onPress={() => setModalVisible(true)}
        />

        <Button_style2 
          title="Agenda tu cita" 
          onPress={() => navigation.navigate("Agenda tu cita", { role: "guest" })}
        />

        <Button_style2
          title="Registrarse"
          onPress={() => navigation.navigate('Registrarse')}
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

        {/* ✅ Modal for stylist selection */}
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
                        role: "guest",
                        staffId: item.id,
                      });
                    }}
                  >
                    {item.profilePic ? (
                      <Image
                        source={{ uri: item.profilePic }}
                        style={styles.stylistImage}
                      />
                    ) : (
                      <View style={styles.placeholderPic}>
                        <Text>Sin foto</Text>
                      </View>
                    )}
                    <Text style={styles.stylistText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
              <View style={{ padding: 10 }}>
                <Button_style2 title="Cerrar" onPress={() => setModalVisible(false)} />
              </View>
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
    paddingTop: StatusBar.currentHeight || 50,
    justifyContent: 'flex-start',
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'column',
    gap: 16,
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
});
