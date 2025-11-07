import GradientBackground from '@/Components/GradientBackground';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Button_style2 from "../Components/Button_style2";
import Logo from '../Components/Logo';
import { logout } from '../Services/authService';
import { auth, db } from '../Services/firebaseConfig';
import { RootStackParamList } from '../src/types';

export default function StaffScreen() { 
  type NavigationProp = NativeStackNavigationProp<RootStackParamList>; 
  const navigation = useNavigation<NavigationProp>(); 
  const windowDimensions = useWindowDimensions(); 
  const windowWidth = windowDimensions.width; 
  const windowHeight = windowDimensions.height; 
  const username = auth.currentUser?.displayName; 
  const hour = new Date().getHours(); 
  const greeting = hour < 12 ? 'Buenos días' : 'Buenas tardes'; 

  const [buttonTitle, setButtonTitle] = useState('Salir');

  useEffect(() => {
    const fetchRole = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const userDoc = await getDoc(doc(db, 'users', uid));
      const role = userDoc.data()?.role;

      if (role === 'admin') {
        setButtonTitle('Inicio admin');
      } else {
        setButtonTitle('Salir');
      }
    };

    fetchRole();
  }, []);
  
  return ( <GradientBackground> 
    <Logo/> 
    <View style={styles.container}> 
      <View style={{ width: windowWidth > 500 ? "70%" : "90%", height: windowHeight > 600 ? "60%" : "90%", 
      flexDirection: 'column', gap: 10 } }> 
      <View> 
        <Text style={styles.welcomeText}> {`${greeting}, ${username || 'invitado'} 👋`} </Text> 
      </View> 
      <View> 
        <Text style={styles.welcomeText}> {`¡Nos alegra verte en Sovrano!`} </Text> 
        </View> 
        <Button_style2 title="Calendario de citas" onPress={()=>navigation.navigate("Calendario de citas.")}> 
          
        </Button_style2> 
        <Button_style2 title="Historia de citas" onPress={()=>navigation.navigate("Historia de citas.")}> 
        </Button_style2>
        <Button_style2
          title={buttonTitle}
          onPress={async () => {
            const uid = auth.currentUser?.uid;

            if (!uid) {
              await logout();
              navigation.reset({
              index: 0,
              routes: [{ name: 'Inicio-Sovrano' }],
              });
              return;
            }

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
            // fallback for unknown roles
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
        ); } 

        const styles = StyleSheet.create({ 
          container: { flex: 1, justifyContent: "flex-start", alignItems: "center", }, 
          text: { fontSize: 24, fontWeight: "bold", marginBottom: 16, }, 
          welcomeText: { fontFamily: 'Playfair-Bold', // ✅ Your custom font 
          fontSize: 18, 
          color: '#3e3e3e', // Optional: match Sovrano’s palette 
          textAlign: 'center', 
          marginBottom: 16, }, 
        });