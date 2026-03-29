import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Easing,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import LottieView from 'lottie-react-native';

const { width } = Dimensions.get('window');

const PRIZES = [
  { id: 1, name: 'Free Book Borrow', color: '#FF6B6B', icon: 'book', probability: 25 },
  { id: 2, name: 'Extended Loan', color: '#4ECDC4', icon: 'schedule', probability: 20 },
  { id: 3, name: 'Premium Upgrade', color: '#45B7D1', icon: 'star', probability: 15 },
  { id: 4, name: 'Book Discount', color: '#96CEB4', icon: 'local-offer', probability: 20 },
  { id: 5, name: 'Library Merch', color: '#FFEAA7', icon: 'shopping-bag', probability: 15 },
  { id: 6, name: 'Reading Points', color: '#DDA0DD', icon: 'emoji-events', probability: 5 },
];

export default function LotteryScreen({ onClose, authToken, userRole }) {
  const { t } = useTranslation();
  const [isSpinning, setIsSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [wonPrize, setWonPrize] = useState(null);
  const [spinsLeft, setSpinsLeft] = useState(3);
  const [spinHistory, setSpinHistory] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadUserSpins();
  }, []);

  const loadUserSpins = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/lottery/spins', {
        headers: { 
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSpinsLeft(data.spinsLeft || 3);
        setSpinHistory(data.history || []);
      }
    } catch (error) {
      console.error('Failed to load spins:', error);
    }
  };

  const getWeightedRandomPrize = () => {
    const totalWeight = PRIZES.reduce((sum, prize) => sum + prize.probability, 0);
    let random = Math.random() * totalWeight;
    
    for (const prize of PRIZES) {
      random -= prize.probability;
      if (random <= 0) return prize;
    }
    return PRIZES[0];
  };

  const calculateRotationForPrize = (prizeIndex) => {
    const segmentAngle = 360 / PRIZES.length;
    const targetAngle = 360 - (prizeIndex * segmentAngle) - (segmentAngle / 2);
    const extraSpins = 5 + Math.floor(Math.random() * 3); // 5-8 full spins
    return (extraSpins * 360) + targetAngle;
  };

  const spinWheel = async () => {
    if (isSpinning || spinsLeft <= 0) return;

    setIsSpinning(true);
    setShowConfetti(false);
    
    const prize = getWeightedRandomPrize();
    const prizeIndex = PRIZES.findIndex(p => p.id === prize.id);
    const finalRotation = calculateRotationForPrize(prizeIndex);

    Animated.timing(rotationAnim, {
      toValue: finalRotation,
      duration: 5000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(async () => {
      setWonPrize(prize);
      setShowResult(true);
      setShowConfetti(true);
      setSpinsLeft(prev => prev - 1);
      setIsSpinning(false);

      // Save result to backend
      try {
        await fetch('http://localhost:8080/api/lottery/spin', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ prizeId: prize.id })
        });
      } catch (error) {
        console.error('Failed to save spin result:', error);
      }

      setSpinHistory(prev => [{ prize: prize.name, date: new Date().toLocaleDateString() }, ...prev.slice(0, 4)]);
    });
  };

  const resetWheel = () => {
    setShowResult(false);
    setWonPrize(null);
    setShowConfetti(false);
    rotationAnim.setValue(0);
  };

  const getWheelSlicePath = (index, total) => {
    const angle = (360 / total) * (Math.PI / 180);
    const startAngle = index * angle;
    const endAngle = (index + 1) * angle;
    const radius = 140;
    const centerX = 150;
    const centerY = 150;

    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);

    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;
  };

  const interpolateRotation = rotationAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <MaterialIcons name="close" size={28} color="#F8FAFC" />
        </TouchableOpacity>
        <Text style={styles.title}>🎰 Library Lottery</Text>
        <Text style={styles.subtitle}>Spin to win amazing prizes!</Text>
      </View>

      {/* Confetti Animation */}
      {showConfetti && (
        <LottieView
          source={{ uri: 'https://lottie.host/4b880c-4b8c-4b8c-4b8c-4b8c4b8c4b8c/xyz123.json' }}
          autoPlay
          loop={false}
          style={styles.confetti}
        />
      )}

      {/* Spins Counter */}
      <View style={styles.spinsContainer}>
        <MaterialIcons name="casino" size={24} color="#4F46E5" />
        <Text style={styles.spinsText}>
          {spinsLeft} {spinsLeft === 1 ? 'Spin' : 'Spins'} Left
        </Text>
      </View>

      {/* Wheel Container */}
      <View style={styles.wheelContainer}>
        {/* Pointer */}
        <View style={styles.pointer}>
          <MaterialIcons name="arrow-drop-down" size={40} color="#F8FAFC" />
        </View>

        {/* Spinning Wheel */}
        <Animated.View
          style={[
            styles.wheel,
            { transform: [{ rotate: interpolateRotation }] }
          ]}
        >
          <View style={styles.wheelContent}>
            {PRIZES.map((prize, index) => (
              <View
                key={prize.id}
                style={[
                  styles.prizeSegment,
                  {
                    backgroundColor: prize.color,
                    transform: [
                      { rotate: `${(index * 360) / PRIZES.length}deg` },
                      { translateY: -70 }
                    ]
                  }
                ]}
              >
                <MaterialIcons name={prize.icon} size={20} color="#fff" />
                <Text style={styles.prizeText}>{prize.name}</Text>
              </View>
            ))}
          </View>
          
          {/* Center Hub */}
          <View style={styles.wheelCenter}>
            <MaterialIcons name="stars" size={30} color="#4F46E5" />
          </View>
        </Animated.View>

        {/* Spin Button */}
        <TouchableOpacity
          style={[
            styles.spinButton,
            (isSpinning || spinsLeft <= 0) && styles.spinButtonDisabled
          ]}
          onPress={spinWheel}
          disabled={isSpinning || spinsLeft <= 0}
        >
          <Text style={styles.spinButtonText}>
            {isSpinning ? 'Spinning...' : spinsLeft > 0 ? 'SPIN NOW!' : 'No Spins Left'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Prize Legend */}
      <ScrollView style={styles.legendContainer} horizontal showsHorizontalScrollIndicator={false}>
        {PRIZES.map((prize) => (
          <View key={prize.id} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: prize.color }]} />
            <MaterialIcons name={prize.icon} size={16} color={prize.color} />
            <Text style={styles.legendText}>{prize.name}</Text>
            <Text style={styles.legendProb}>{prize.probability}%</Text>
          </View>
        ))}
      </ScrollView>

      {/* Recent Wins */}
      {spinHistory.length > 0 && (
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>🎉 Recent Wins</Text>
          {spinHistory.slice(0, 3).map((spin, index) => (
            <View key={index} style={styles.historyItem}>
              <MaterialIcons name="emoji-events" size={16} color="#4F46E5" />
              <Text style={styles.historyText}>{spin.prize}</Text>
              <Text style={styles.historyDate}>{spin.date}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Result Modal */}
      <Modal
        visible={showResult}
        transparent
        animationType="fade"
        onRequestClose={resetWheel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LottieView
              source={{ uri: 'https://lottie.host/abc123-abc123/celebration.json' }}
              autoPlay
              loop={false}
              style={styles.celebrationLottie}
            />
            
            <Text style={styles.congratsText}>🎊 Congratulations! 🎊</Text>
            <Text style={styles.youWonText}>You Won:</Text>
            
            {wonPrize && (
              <View style={[styles.prizeDisplay, { backgroundColor: wonPrize.color }]}>
                <MaterialIcons name={wonPrize.icon} size={50} color="#fff" />
                <Text style={styles.prizeName}>{wonPrize.name}</Text>
              </View>
            )}
            
            <TouchableOpacity style={styles.claimButton} onPress={resetWheel}>
              <Text style={styles.claimButtonText}>Claim Prize</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 20,
  },
  closeButton: {
    position: 'absolute',
    left: 0,
    top: 20,
    padding: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
  },
  spinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 20,
    gap: 8,
  },
  spinsText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  wheelContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pointer: {
    position: 'absolute',
    top: -20,
    zIndex: 10,
    backgroundColor: '#EF4444',
    borderRadius: 20,
    padding: 5,
  },
  wheel: {
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 8,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  wheelContent: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  prizeSegment: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    left: 110,
    top: 110,
  },
  prizeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 2,
  },
  wheelCenter: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  spinButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
    marginTop: 30,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  spinButtonDisabled: {
    backgroundColor: '#475569',
    shadowOpacity: 0,
  },
  spinButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },
  legendContainer: {
    maxHeight: 80,
    marginBottom: 20,
  },
  legendItem: {
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 10,
    minWidth: 100,
  },
  legendColor: {
    width: 20,
    height: 4,
    borderRadius: 2,
    marginBottom: 5,
  },
  legendText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
  },
  legendProb: {
    color: '#94A3B8',
    fontSize: 10,
  },
  historyContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 12,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    gap: 8,
  },
  historyText: {
    flex: 1,
    color: '#E2E8F0',
    fontSize: 14,
  },
  historyDate: {
    color: '#94A3B8',
    fontSize: 12,
  },
  confetti: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    pointerEvents: 'none',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    width: '100%',
    maxWidth: 350,
    borderWidth: 2,
    borderColor: '#4F46E5',
  },
  celebrationLottie: {
    width: 200,
    height: 200,
  },
  congratsText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 10,
  },
  youWonText: {
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 20,
  },
  prizeDisplay: {
    width: 150,
    height: 150,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  prizeName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  claimButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 25,
    width: '100%',
  },
  claimButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});
