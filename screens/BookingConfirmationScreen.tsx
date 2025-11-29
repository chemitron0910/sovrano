import GradientBackground from '@/Components/GradientBackground';
import BodyBoldText from '@/Components/typography/BodyBoldText';
import BodyText from '@/Components/typography/BodyText';
import SubTitleText from '@/Components/typography/SubTitleText';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Button_style2 from '../Components/Button_style2';
import Logo from '../Components/Logo';
import { RootStackParamList } from '../src/types';

type BookingConfirmationScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Cita confirmada'
>;

type BookingConfirmationScreenRouteProp = RouteProp<
  RootStackParamList,
  'Cita confirmada'
>;

type Props = {
  navigation: BookingConfirmationScreenNavigationProp;
  route: BookingConfirmationScreenRouteProp;
};

export default function BookingConfirmationScreen({ navigation, route }: Props) {
  const windowDimensions = useWindowDimensions();
  const windowWidth = windowDimensions.width;
  const windowHeight = windowDimensions.height;

  // ✅ Now using autoNumber and userAutoNumber
  const { service, date, time, stylistName, autoNumber, userAutoNumber } = route.params;

  return (
    <View style={styles.container}>
      <GradientBackground>
        <View>
          <Logo />
        </View>
        <View style={{ gap: 10 }}>
          <View style={{ marginLeft: 24 }}>
            <SubTitleText>Gracias por agendar tu cita</SubTitleText>
          </View>
          <View style={styles.inlineText}>
            <BodyBoldText>Estilista: </BodyBoldText>
            <BodyText>{stylistName}</BodyText>
          </View>
          <View style={styles.inlineText}>
            <BodyBoldText>Servicio: </BodyBoldText>
            <BodyText>{service}</BodyText>
          </View>
          <View style={styles.inlineText}>
            <BodyBoldText>Fecha: </BodyBoldText>
            <BodyText>{date}</BodyText>
          </View>
          <View style={styles.inlineText}>
            <BodyBoldText>Hora: </BodyBoldText>
            <BodyText>{time}</BodyText>
          </View>
          <View style={styles.inlineText}>
            <BodyBoldText>Cita número: </BodyBoldText>
            <BodyText>{autoNumber}</BodyText>
          </View>
          {userAutoNumber && (
            <View style={styles.inlineText}>
              <BodyBoldText>Usuario número: </BodyBoldText>
              <BodyText>{userAutoNumber}</BodyText>
            </View>
          )}
          <View style={{ marginLeft: 24 }}>
            <BodyBoldText>
              Un correo fue enviado a tu direccion electronica. Si no lo encuentras, revisa tu carpeta de spam o correo no deseado
            </BodyBoldText>
          </View>

          <Button_style2
            title="Vuelve al inicio"
            onPress={() => {
              if (route.params.role === 'usuario') {
                navigation.navigate('Menu-Usuario', { role: 'usuario' });
              } else {
                navigation.navigate('Menu-Invitado', { role: 'guest' });
              }
            }}
          />
        </View>
      </GradientBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    alignContent: 'center',
  },
  inlineText: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 24,
  },
});
