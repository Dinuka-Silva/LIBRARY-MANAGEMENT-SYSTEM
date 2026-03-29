import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../ThemeContext';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: 1,
    title: 'Welcome to our smart library',
    description: 'Explore thousands of books at your fingertips. From classics to modern bestsellers.',
    animation: 'https://assets9.lottiefiles.com/packages/lf20_at6p77j3.json', // Book animation
  },
  {
    id: 2,
    title: 'Smart Management',
    description: 'Borrow and return books with a single scan. No more long queues or paperwork.',
    animation: 'https://assets5.lottiefiles.com/packages/lf20_m6cuL6.json', // QR/Smart scan
  },
  {
    id: 3,
    title: 'Digital Library',
    description: 'Read your favorite books online. Upload and manage your digital collection anywhere.',
    animation: 'https://assets10.lottiefiles.com/packages/lf20_vnikbe6u.json', // Digital Reading
  }
];

export default function OnboardingScreen({ onFinish }) {
  const { theme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onFinish();
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const currentSlide = SLIDES[currentIndex];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.animationContainer}>
        <LottieView
          source={{ uri: currentSlide.animation }}
          autoPlay
          loop
          style={styles.lottie}
        />
      </View>

      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{currentSlide.title}</Text>
        <Text style={[styles.description, { color: theme.textSecondary }]}>{currentSlide.description}</Text>
      </View>

      <View style={styles.indicatorContainer}>
        {SLIDES.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              { backgroundColor: index === currentIndex ? theme.accent : theme.border },
              index === currentIndex && { width: 24 }
            ]}
          />
        ))}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.backButton, currentIndex === 0 && { opacity: 0 }]}
          onPress={handleBack}
          disabled={currentIndex === 0}
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.textSecondary} />
          <Text style={[styles.buttonText, { color: theme.textSecondary }]}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.nextButton, { backgroundColor: theme.accent }]} onPress={handleNext}>
          <Text style={styles.nextText}>{currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}</Text>
          <MaterialIcons
            name={currentIndex === SLIDES.length - 1 ? 'check' : 'arrow-forward'}
            size={24}
            color="#fff"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 40, justifyContent: 'center', alignItems: 'center' },
  animationContainer: { width: '100%', height: 350, justifyContent: 'center', alignItems: 'center' },
  lottie: { width: 300, height: 300 },
  textContainer: { marginTop: 40, alignItems: 'center' },
  title: { fontSize: 32, fontWeight: '800', textAlign: 'center', marginBottom: 16 },
  description: { fontSize: 18, textAlign: 'center', lineHeight: 28, paddingHorizontal: 20 },
  indicatorContainer: { flexDirection: 'row', gap: 8, marginTop: 40 },
  indicator: { width: 10, height: 10, borderRadius: 5 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 60, alignItems: 'center' },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10 },
  nextButton: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 28, borderRadius: 16, elevation: 4 },
  buttonText: { fontSize: 16, fontWeight: '600' },
  nextText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
