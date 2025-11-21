import GradientBackground from '@/Components/GradientBackground';
import BodyBoldText from '@/Components/typography/BodyBoldText';
import BodyText from '@/Components/typography/BodyText';
import SubTitleText from '@/Components/typography/SubTitleText';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Platform, StatusBar, StyleSheet, useWindowDimensions, View } from 'react-native';
import Button_style2 from '../Components/Button_style2';
import Logo from '../Components/Logo';
import { RootStackParamList } from '../src/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Registro exitoso'>;

export default function SignUpConfirmationScreen({ navigation, route }: Props) {
  const windowDimensions = useWindowDimensions();
  const windowWidth = windowDimensions.width;
  const windowHeight = windowDimensions.height;

  const { username, email, userId } = route.params;

  return (
    <View style={styles.container}>
      <GradientBackground>
        <View style={{ paddingHorizontal: 24, gap: 10 }}>
          <Logo />
          <View style={{ marginLeft: 24 }}>
            <SubTitleText>Gracias por registrarte</SubTitleText>
          </View>
          <BodyBoldText>
            Por favor usa el enlace enviado a tu correo electronico para verificacion de tu cuenta
          </BodyBoldText>
          <BodyBoldText>
            Mira tu folder de correo no deseado si no lo encuentras
          </BodyBoldText>

          <View style={styles.inlineText}>
            <BodyBoldText>Nombre: </BodyBoldText>
            <BodyText>{username}</BodyText>
          </View>
          <View style={styles.inlineText}>
            <BodyBoldText>Correo electronico: </BodyBoldText>
            <BodyText>{email}</BodyText>
          </View>
          <View style={styles.inlineText}>
            <BodyBoldText>Usuario ID: </BodyBoldText>
            <BodyText>{userId}</BodyText>
          </View>

          <View style={{ padding: 24 }}>
            <Button_style2
              title="Vuelve al inicio"
              onPress={() => navigation.navigate('Inicio-Invitado', { role: "guest" })}
            />
          </View>
        </View>
      </GradientBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'red',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    fontSize: 18,
    marginBottom: 12,
  },
  value: {
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 30,
    marginTop: 30,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  inlineText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
