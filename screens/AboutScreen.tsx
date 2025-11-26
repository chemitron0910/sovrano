import GradientBackground from '@/Components/GradientBackground';
import BodyText from '@/Components/typography/BodyText';
import SubTitleText from '@/Components/typography/SubTitleText';
import TitelText from '@/Components/typography/TitleText';
import { ReactElement } from "react";
import { ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";

export default function AboutScreen(): ReactElement {
  const windowDimensions = useWindowDimensions();
  const windowWidth = windowDimensions.width;
  const windowHeight = windowDimensions.height;

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View
          style={[
            styles.contentBox,
            {
              width: windowWidth > 500 ? "70%" : "90%",
              minHeight: windowHeight > 600 ? "60%" : "90%",
            },
          ]}
        >
          <TitelText style={[styles.title, { fontSize: windowWidth > 500 ? 40 : 28 }]}>
            Acerca de Sovrano
          </TitelText>

          <SubTitleText style={styles.paragraph}>
            Sovrano — Crowning Beauty
          </SubTitleText>

          <BodyText style={styles.paragraph}>
            Sovrano representa el equilibrio entre la técnica más avanzada y el cuidado artesanal.
            Inspirada en las casas de alta costura y ateliers europeos, nuestra marca celebra la
            belleza como poder: el cabello es la corona invisible que llevamos cada día.
          </BodyText>

          <BodyText style={styles.subtitle}>Nuestros pilares</BodyText>
          <BodyText style={styles.paragraph}>• Maestría: Solo los mejores profesionales, formados en técnicas internacionales.</BodyText>
          <BodyText style={styles.paragraph}>• Atención sobremedida: Asesoramiento personalizado antes, durante y después de cada servicio.</BodyText>
          <BodyText style={styles.paragraph}>• Exclusividad discreta: Elegancia sin ostentación; lujo que se siente, pero no se grita.</BodyText>

          <BodyText style={styles.subtitle}>Nuestra filosofía</BodyText>
          <BodyText style={styles.paragraph}>
            La belleza no es solo apariencia, es una declaración de quién eres. En Sovrano,
            cada corte, cada tono y cada textura es un acto de soberanía.
          </BodyText>
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 24,
  },
  contentBox: {
    backgroundColor: "#f9f7f2",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#333",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    color: "#222",
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
    color: "#444",
    textAlign: "justify",
  },
});
