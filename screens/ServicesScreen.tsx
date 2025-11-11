import GradientBackground from '@/Components/GradientBackground';
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Button_style2 from "../Components/Button_style2";
import { db } from "../Services/firebaseConfig";
import { RootStackParamList } from "../src/types";

type Service = {
  id: string;
  name: string;
  description: string;
  duration: string;
};

type User = {
  id: string;
  role: string;
  username?: string;
};

export default function ServicesScreen() {
  const [services, setServices] = useState<Service[]>([]);
  const [serviceProviders, setServiceProviders] = useState<Record<string, string[]>>({});
  const [empleados, setEmpleados] = useState<User[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    async function fetchData() {
      try {
        const servicesSnapshot = await getDocs(collection(db, "services"));
        const allServices: Service[] = servicesSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            description: data.description,
            duration: data.duration,
          };
        });
        setServices(allServices);

        const usersSnapshot = await getDocs(collection(db, "users"));
        const empleadosList: User[] = usersSnapshot.docs
          .map(doc => {
            const data = doc.data() as Omit<User, "id">;
            return { id: doc.id, ...data };
          })
          .filter(user => user.role === "empleado");
        setEmpleados(empleadosList);

        const providersMap: Record<string, string[]> = {};
        for (const empleado of empleadosList) {
          try {
            const infoDoc = await getDoc(doc(db, `users/${empleado.id}/profile/info`));
            if (!infoDoc.exists()) continue;
            const info = infoDoc.data();
            const providedServices = info?.services || [];
            for (const service of providedServices) {
              if (!service.id) continue;
              if (!providersMap[service.id]) providersMap[service.id] = [];
              providersMap[service.id].push(empleado.id);
            }
          } catch (error) {
            console.error(`❌ Error fetching profile for ${empleado.id}:`, error);
          }
        }
        setServiceProviders(providersMap);
      } catch (error) {
        console.error("❌ General fetch error:", error);
      }
    }

    fetchData();
  }, []);

  const openModal = (service: Service) => {
    setSelectedService(service);
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedService(null);
    setModalVisible(false);
  };

  const handleSelectStylist = (stylist: User) => {
    if (!selectedService) return;
    navigation.navigate("Agenda tu cita.", {
      serviceFromUser: selectedService,
      stylist: {
        id: stylist.id,
        name: stylist.username || "Sin nombre",
      },
    });
    closeModal();
  };

  return (
    <GradientBackground>
    <View style={styles.container}>
      
        
      <ScrollView style={{ padding: 20 }}>
        
        {services.map(service => (
          <View key={service.id} style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>{service.name}</Text>
            <Text>{service.description}</Text>
            <Text>Duración: {service.duration}</Text>
            <View style={{ padding: 10 }}>
                      <Button_style2 title="Reservar" onPress={() => openModal(service)}>
                      </Button_style2>
                      </View>
            
          </View>
        ))}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
              Elige un estilista
            </Text>
            {(selectedService && serviceProviders[selectedService.id] || []).map((stylistId, idx) => {
              const stylist = empleados.find(e => e.id === stylistId);
              if (!stylist) return null;
              return (
                <TouchableOpacity
                  key={idx}
                  style={styles.stylistButton}
                  onPress={() => handleSelectStylist(stylist)}
                >
                  <Text style={{ color: "white" }}>{stylist.username || "Sin nombre"}</Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity onPress={closeModal} style={styles.cancelButton}>
              <Text style={{ color: "#333" }}>Cancelar</Text>
            </TouchableOpacity>
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
  stylistButton: {
    backgroundColor: "#D1B380",
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  cancelButton: {
    marginTop: 10,
    alignSelf: "center",
  },
});
