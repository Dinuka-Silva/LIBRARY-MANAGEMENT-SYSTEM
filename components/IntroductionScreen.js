import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Animated, 
  Dimensions,
  Platform 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function IntroductionScreen({ onGetStarted }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const slides = [
    {
      icon: 'local-library',
      title: 'Welcome to Smart Library',
      subtitle: 'Your Digital Gateway to Knowledge',
      description: 'Discover thousands of books, manage your reading journey, and connect with a community of book lovers.',
      color: '#6366F1',
      gradient: ['#6366F1', '#8B5CF6'],
      features: [
        { icon: 'auto-stories', text: 'Browse 10,000+ Books' },
        { icon: 'search', text: 'Smart Search & Filters' },
        { icon: 'bookmark', text: 'Personal Collections' }
      ]
    },
    {
      icon: 'compare-arrows',
      title: 'Seamless Borrowing',
      subtitle: 'Borrow & Return with Ease',
      description: 'Manage your borrowed books, track due dates, and get automatic reminders - all in one place.',
      color: '#10B981',
      gradient: ['#10B981', '#059669'],
      features: [
        { icon: 'schedule', text: 'Real-time Availability' },
        { icon: 'notifications', text: 'Due Date Reminders' },
        { icon: 'history', text: 'Borrowing History' }
      ]
    },
    {
      icon: 'casino',
      title: 'Exciting Rewards',
      subtitle: 'Earn Points & Win Prizes',
      description: 'Participate in our lottery system, earn reading points, and unlock exclusive rewards for active members.',
      color: '#F59E0B',
      gradient: ['#F59E0B', '#EF4444'],
      features: [
        { icon: 'stars', text: 'Daily Lottery Draws' },
        { icon: 'card-giftcard', text: 'Exclusive Prizes' },
        { icon: 'trending-up', text: 'Reading Achievements' }
      ]
    },
    {
      icon: 'dashboard',
      title: 'Powerful Analytics',
      subtitle: 'Track Your Reading Journey',
      description: 'Get insights into your reading habits, discover trending books, and see your progress over time.',
      color: '#EC4899',
      gradient: ['#EC4899', '#8B5CF6'],
      features: [
        { icon: 'insights', text: 'Reading Statistics' },
        { icon: 'local-fire-department', text: 'Trending Books' },
        { icon: 'leaderboard', text: 'Community Rankings' }
      ]
    }
  ];

  useEffect(() => {
    animateSlide();
  }, [currentSlide]);

  const animateSlide = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      scaleAnim.setValue(0.8);
      setCurrentSlide(currentSlide + 1);
    } else {
      onGetStarted();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      fadeAnim.setValue(0);
      slideAnim.setValue(-50);
      scaleAnim.setValue(0.8);
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleSkip = () => {
    onGetStarted();
  };

  const currentSlideData = slides[currentSlide];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F172A', '#1E293B', '#0F172A']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
            <MaterialIcons name="arrow-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ]
              }
            ]}
          >
            {/* Icon Circle */}
            <View style={[styles.iconCircle, { backgroundColor: currentSlideData.color + '20' }]}>
              <LinearGradient
                colors={currentSlideData.gradient}
                style={styles.iconGradient}
              >
                <MaterialIcons 
                  name={currentSlideData.icon} 
                  size={80} 
                  color="#FFFFFF" 
                />
              </LinearGradient>
            </View>

            {/* Title Section */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>{currentSlideData.title}</Text>
              <Text style={[styles.subtitle, { color: currentSlideData.color }]}>
                {currentSlideData.subtitle}
              </Text>
              <Text style={styles.description}>{currentSlideData.description}</Text>
            </View>

            {/* Features List */}
            <View style={styles.featuresContainer}>
              {currentSlideData.features.map((feature, index) => (
                <Animated.View 
                  key={index}
                  style={[
                    styles.featureItem,
                    {
                      opacity: fadeAnim,
                      transform: [{
                        translateX: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-20, 0]
                        })
                      }]
                    }
                  ]}
                >
                  <View style={[styles.featureIconBox, { backgroundColor: currentSlideData.color + '20' }]}>
                    <MaterialIcons name={feature.icon} size={24} color={currentSlideData.color} />
                  </View>
                  <Text style={styles.featureText}>{feature.text}</Text>
                </Animated.View>
              ))}
            </View>

            {/* Stats Preview */}
            <View style={styles.statsPreview}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>10K+</Text>
                <Text style={styles.statLabel}>Books</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>5K+</Text>
                <Text style={styles.statLabel}>Members</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>50K+</Text>
                <Text style={styles.statLabel}>Borrows</Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Footer Navigation */}
        <View style={styles.footer}>
          {/* Pagination Dots */}
          <View style={styles.pagination}>
            {slides.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentSlide === index && [
                    styles.activeDot,
                    { backgroundColor: currentSlideData.color }
                  ]
                ]}
              />
            ))}
          </View>

          {/* Navigation Buttons */}
          <View style={styles.navigationButtons}>
            {currentSlide > 0 && (
              <TouchableOpacity 
                onPress={handlePrev} 
                style={[styles.navButton, styles.prevButton]}
              >
                <MaterialIcons name="arrow-back" size={24} color="#94A3B8" />
                <Text style={styles.navButtonText}>Previous</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              onPress={handleNext} 
              style={[styles.navButton, styles.nextButton]}
            >
              <LinearGradient
                colors={currentSlideData.gradient}
                style={styles.nextButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.nextButtonText}>
                  {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
                </Text>
                <MaterialIcons 
                  name={currentSlide === slides.length - 1 ? 'check' : 'arrow-forward'} 
                  size={24} 
                  color="#FFFFFF" 
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 24,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
  },
  skipText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  content: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  iconCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconGradient: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  featureIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#E2E8F0',
    fontWeight: '600',
    flex: 1,
  },
  statsPreview: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingTop: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(148, 163, 184, 0.3)',
  },
  activeDot: {
    width: 32,
    height: 8,
    borderRadius: 4,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  navButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  prevButton: {
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  navButtonText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
