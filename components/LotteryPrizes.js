import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const PRIZES_DATA = [
  {
    id: 1,
    name: 'Free Book Borrow',
    description: 'Borrow any book for free - no membership required!',
    icon: 'book',
    color: '#FF6B6B',
    benefits: ['Any book available', '7-day loan period', 'No late fees'],
    rarity: 'Common',
    probability: 25,
  },
  {
    id: 2,
    name: 'Extended Loan',
    description: 'Extend your book loan period by additional 14 days',
    icon: 'schedule',
    color: '#4ECDC4',
    benefits: ['+14 days extension', 'Apply to any book', 'One-time use'],
    rarity: 'Common',
    probability: 20,
  },
  {
    id: 3,
    name: 'Premium Upgrade',
    description: 'Get Premium membership benefits for 1 month FREE',
    icon: 'star',
    color: '#45B7D1',
    benefits: ['10 books at once', 'Priority reservations', 'Free home delivery'],
    rarity: 'Rare',
    probability: 15,
  },
  {
    id: 4,
    name: 'Book Discount',
    description: '50% off on any book purchase from our store',
    icon: 'local-offer',
    color: '#96CEB4',
    benefits: ['50% discount', 'Any book available', 'Valid for 30 days'],
    rarity: 'Common',
    probability: 20,
  },
  {
    id: 5,
    name: 'Library Merch',
    description: 'Free library branded merchandise item',
    icon: 'shopping-bag',
    color: '#FFEAA7',
    benefits: ['Tote bag or mug', 'Library logo', 'Pick up anytime'],
    rarity: 'Uncommon',
    probability: 15,
  },
  {
    id: 6,
    name: 'Reading Points',
    description: '500 bonus reading points added to your account',
    icon: 'emoji-events',
    color: '#DDA0DD',
    benefits: ['500 points instant', 'Redeem for rewards', 'Never expires'],
    rarity: 'Legendary',
    probability: 5,
  },
];

const getRarityColor = (rarity) => {
  switch (rarity) {
    case 'Common': return '#94A3B8';
    case 'Uncommon': return '#10B981';
    case 'Rare': return '#3B82F6';
    case 'Legendary': return '#F59E0B';
    default: return '#94A3B8';
  }
};

export default function LotteryPrizes({ onBack }) {
  const { t } = useTranslation();
  const scaleAnim = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={28} color="#F8FAFC" />
        </TouchableOpacity>
        <Text style={styles.title}>🎁 Available Prizes</Text>
        <Text style={styles.subtitle}>Discover what you can win!</Text>
      </View>

      {/* Prize Cards */}
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {PRIZES_DATA.map((prize, index) => (
          <Animated.View
            key={prize.id}
            style={[
              styles.prizeCard,
              { transform: [{ scale: scaleAnim }] }
            ]}
          >
            {/* Prize Header */}
            <View style={[styles.prizeHeader, { backgroundColor: prize.color }]}>
              <View style={styles.iconContainer}>
                <MaterialIcons name={prize.icon} size={32} color="#fff" />
              </View>
              <View style={styles.headerInfo}>
                <Text style={styles.prizeName}>{prize.name}</Text>
                <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(prize.rarity) }]}>
                  <Text style={styles.rarityText}>{prize.rarity}</Text>
                </View>
              </View>
              <View style={styles.probabilityBadge}>
                <Text style={styles.probabilityText}>{prize.probability}%</Text>
              </View>
            </View>

            {/* Prize Body */}
            <View style={styles.prizeBody}>
              <Text style={styles.description}>{prize.description}</Text>
              
              {/* Benefits */}
              <View style={styles.benefitsContainer}>
                <Text style={styles.benefitsTitle}>Benefits:</Text>
                {prize.benefits.map((benefit, idx) => (
                  <View key={idx} style={styles.benefitItem}>
                    <MaterialIcons name="check-circle" size={16} color={prize.color} />
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Prize Footer */}
            <View style={styles.prizeFooter}>
              <MaterialIcons name="casino" size={16} color="#64748B" />
              <Text style={styles.footerText}>Win chance: {prize.probability}%</Text>
            </View>
          </Animated.View>
        ))}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* How to Play Section */}
      <View style={styles.howToPlayContainer}>
        <Text style={styles.howToPlayTitle}>🎮 How to Play</Text>
        <View style={styles.stepsContainer}>
          <View style={styles.step}>
            <View style={[styles.stepNumber, { backgroundColor: '#4F46E5' }]}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>Login daily</Text>
          </View>
          <MaterialIcons name="arrow-forward" size={20} color="#64748B" />
          <View style={styles.step}>
            <View style={[styles.stepNumber, { backgroundColor: '#10B981' }]}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>Get spins</Text>
          </View>
          <MaterialIcons name="arrow-forward" size={20} color="#64748B" />
          <View style={styles.step}>
            <View style={[styles.stepNumber, { backgroundColor: '#F59E0B' }]}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>Win prizes!</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 40,
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  prizeCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  prizeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  prizeName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  rarityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
  },
  probabilityBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  probabilityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  prizeBody: {
    padding: 16,
  },
  description: {
    fontSize: 14,
    color: '#E2E8F0',
    lineHeight: 20,
    marginBottom: 12,
  },
  benefitsContainer: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 12,
  },
  benefitsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  benefitText: {
    fontSize: 13,
    color: '#E2E8F0',
  },
  prizeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    backgroundColor: '#1E293B',
  },
  footerText: {
    fontSize: 12,
    color: '#64748B',
  },
  bottomSpacing: {
    height: 20,
  },
  howToPlayContainer: {
    backgroundColor: '#1E293B',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  howToPlayTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 16,
    textAlign: 'center',
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  step: {
    alignItems: 'center',
    gap: 8,
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  stepText: {
    fontSize: 12,
    color: '#E2E8F0',
    fontWeight: '500',
  },
});
