import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { db } from "../Services/firebaseConfig";
import { RootStackParamList } from "../src/types"; // ✅ Make sure this exists

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
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
  async function fetchData() {
    try {
      console.log("🔍 Fetching services...");
      const servicesSnapshot = await getDocs(collection(db, "services"));
      console.log("✅ Services fetched:", servicesSnapshot.size);

      const allServices: Service[] = servicesSnapshot.docs.map(doc => {
        const data = doc.data();
        console.log("📄 Service:", doc.id, data.name);
        return {
          id: doc.id,
          name: data.name,
          description: data.description,
          duration: data.duration,
        };
      });
      setServices(allServices);

      console.log("🔍 Fetching users...");
      const usersSnapshot = await getDocs(collection(db, "users"));
      console.log("✅ Users fetched:", usersSnapshot.size);

      const empleadosList: User[] = usersSnapshot.docs
        .map(doc => {
          const data = doc.data() as Omit<User, "id">;
          return { id: doc.id, ...data };
        })
        .filter(user => user.role === "empleado");

      setEmpleados(empleadosList);
      console.log("✅ Empleados filtered:", empleadosList.length);

      const providersMap: Record<string, string[]> = {};

      for (const empleado of empleadosList) {
        try {
          console.log(`🔍 Fetching profile for ${empleado.id} (${empleado.username})`);
          const infoDoc = await getDoc(doc(db, `users/${empleado.id}/profile/info`));
          if (!infoDoc.exists()) {
            console.warn(`⚠️ Profile info missing for ${empleado.id}`);
            continue;
          }

          const info = infoDoc.data();
          const providedServices = info?.services || [];
          console.log(`✅ Services offered by ${empleado.username}:`, providedServices);

          for (const service of providedServices) {
            if (!service.id) {
              console.warn(`⚠️ Missing service ID for ${empleado.username}:`, service);
              continue;
            }
            if (!providersMap[service.id]) providersMap[service.id] = [];
            providersMap[service.id].push(info?.username || "Sin nombre");
          }
        } catch (error) {
          console.error(`❌ Error fetching profile for ${empleado.id}:`, error);
        }
      }

      setServiceProviders(providersMap);
      console.log("✅ Providers map built:", Object.keys(providersMap).length);
    } catch (error) {
      console.error("❌ General fetch error:", error);
    }
  }

  fetchData();
}, []);


  return (
    <ScrollView style={{ padding: 20 }}>
      {services.map(service => (
        <View key={service.id} style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>{service.name}</Text>
          <Text>{service.description}</Text>
          <Text>Duración: {service.duration}</Text>
          <Text>Proveedores:</Text>
          {(serviceProviders[service.id] || []).map((providerName, idx) => {
            const stylist = empleados.find(e => e.username === providerName);
            return (
              <View key={idx} style={{ marginLeft: 10, marginBottom: 6 }}>
                <Text>• {providerName}</Text>
                {stylist && (
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#D1B380',
                      padding: 8,
                      borderRadius: 6,
                      marginTop: 4,
                      alignSelf: 'flex-start',
                    }}
                    onPress={() => {
                      navigation.navigate('UserBookingScreen', {
                        serviceFromUser: service,
                        stylist: {
                          id: stylist.id,
                          name: stylist.username || 'Sin nombre',
                        },
                      });
                    }}
                  >
                    <Text style={{ color: 'white' }}>Reservar con {providerName}</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}
