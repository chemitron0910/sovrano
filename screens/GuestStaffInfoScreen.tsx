import GradientBackground from '@/Components/GradientBackground';
import BodyBoldText from '@/Components/typography/BodyBoldText';
import BodyText from '@/Components/typography/BodyText';
import SubTitleText from '@/Components/typography/SubTitleText';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Button_style2 from '../Components/Button_style2';
import { RootStackParamList } from '../src/types';
import { logError } from "../utils/logger";

// Define route type
type GuestStaffInfoScreenRouteProp = RouteProp<RootStackParamList, "Nuestros artistas">;
type GuestStaffInfoScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Nuestros artistas"
>;

type Props = {
  route: GuestStaffInfoScreenRouteProp;
  navigation: GuestStaffInfoScreenNavigationProp;
};

export default function GuestStaffInfoScreen({ route, navigation }: Props) {
  const { staffId, role } = route.params;
  const firestore = getFirestore();
  const [loading, setLoading] = useState(true);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [socialLinks, setSocialLinks] = useState<{ instagram?: string; facebook?: string; website?: string }>({});
  const [generalInfo, setGeneralInfo] = useState('');
  const [services, setServices] = useState<{ id: string; name: string; duration: string; cost?: string }[]>([]);
  const [stylistName, setStylistName] = useState<string>("Sin nombre");
  const [stylistAutoNumber, setStylistAutoNumber] = useState<string | null>(null);

  useEffect(() => {
  const loadProfile = async () => {
    try {
      // 🔎 Fetch main user doc
      const userRef = doc(firestore, "users", staffId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setStylistName(userData.username || userData.email || "Sin nombre");
        setStylistAutoNumber(userData.autoNumber?.toString() || null);
      }

      // 🔎 Fetch profile subdoc
      const ref = doc(firestore, `users/${staffId}/profile/info`);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setProfilePic(data.profilePic ?? null);
        setSocialLinks(data.socialLinks ?? {});
        setGeneralInfo(data.generalInfo ?? "");
        setServices(data.services ?? []);
      }
    } catch (err) {
      logError("Error loading staff profile:", err);
    } finally {
      setLoading(false);
    }
  };
  loadProfile();
}, [staffId]);

  if (loading) {
    return (
      <View style={styles.overlay}>
        <ActivityIndicator size="large" color="#fff" />
        <BodyText style={{ color: '#fff', fontSize: 18 }}>Cargando perfil...</BodyText>
      </View>
    );
  }

  return (
    <GradientBackground>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <View style={styles.centerText}>
          {profilePic ? (
            <Image
              source={{ uri: profilePic }}
              style={{ width: 120, height: 120, borderRadius: 60 }}
            />
          ) : (
            <View style={styles.placeholderPic}>
              <BodyText style={{ textAlign: 'center' }}>Sin imagen</BodyText>
            </View>
          )}
        </View>
        <BodyBoldText style={styles.stylistName}>
          {stylistName} {stylistAutoNumber ? `(Artista id: ${stylistAutoNumber})` : ""}
        </BodyBoldText>
        <SubTitleText>Sobre mí</SubTitleText>
        <BodyText style={styles.generalInfo}>{generalInfo || 'No disponible'}</BodyText>
        <SubTitleText>Redes sociales</SubTitleText>
        {socialLinks.instagram ? (
          <TouchableOpacity onPress={() => Linking.openURL(socialLinks.instagram!)}>
            <BodyText style={styles.link}>Instagram</BodyText>
          </TouchableOpacity>
        ) : null}
        {socialLinks.facebook ? (
          <TouchableOpacity onPress={() => Linking.openURL(socialLinks.facebook!)}>
            <BodyText style={styles.link}>Facebook</BodyText>
          </TouchableOpacity>
        ) : null}
        {socialLinks.website ? (
          <TouchableOpacity onPress={() => Linking.openURL(socialLinks.website!)}>
            <BodyText style={styles.link}>Sitio web</BodyText>
          </TouchableOpacity>
        ) : null}

        <SubTitleText>Servicios ofrecidos</SubTitleText>
        {services.length > 0 ? (
          services.map((service, index) => (
            <View key={index} style={styles.serviceItem}>
              <BodyBoldText style={styles.serviceName}>{service.name}</BodyBoldText>
              <BodyText style={styles.serviceTime}>
                {service.duration} {Number(service.duration) === 1 ? 'hora' : 'horas'} — ${service.cost || 'N/A'}
              </BodyText>

              <Button_style2
  title="Reservar"
  onPress={() =>
    navigation.navigate("Agenda tu cita", {
      role,
      serviceFromUser: {
        id: service.id,
        name: service.name,
        duration: service.duration,
        cost: service.cost || "N/A",
        description: "", // optional
      },
      stylist: {
        id: staffId,
        name: stylistName, // fetched from Firestore
        autoNumber: stylistAutoNumber || null,
      },
    })
  }
/>

            </View>
          ))
        ) : (
          <BodyText>No hay servicios disponibles</BodyText>
        )}
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  centerText: {
    alignItems: 'center',
    marginBottom: 16,
  },
  placeholderPic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  generalInfo: {
    marginBottom: 16,
    fontSize: 14,
    color: '#333',
  },
  serviceItem: {
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  serviceName: {
    fontSize: 16,
    marginBottom: 4,
  },
  serviceTime: {
    fontSize: 14,
    color: '#666',
  },
  link: {
    color: '#0072ff',
    marginBottom: 8,
  },
  stylistName: {
  fontSize: 18,
  fontWeight: "700",
  marginBottom: 12,
  textAlign: "center",
  color: "#3e3e3e",
},

});
