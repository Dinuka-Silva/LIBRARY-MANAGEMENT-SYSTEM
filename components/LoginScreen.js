import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Platform, Modal, Animated } from 'react-native';
import LottieView from 'lottie-react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export default function LoginScreen({ onLogin, onShowLottery }) {
  const { t } = useTranslation();
  const [lottieError, setLottieError] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('user');
  const [isLogin, setIsLogin] = useState(true);
  const [showLotteryModal, setShowLotteryModal] = useState(false);
  const [wonPrize, setWonPrize] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  
  // Forgot password states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthAction = async () => {
    if (!email || !password) {
      alert('Please enter both email and password.');
      return;
    }

    // Validation for registration
    if (!isLogin) {
      if (!firstName || !lastName) {
        alert('Please enter your first and last name.');
        return;
      }
      if (password.length < 6) {
        alert('Password must be at least 6 characters long.');
        return;
      }
    }

    setIsLoading(true);
    try {
        const endpoint = isLogin ? 'authenticate' : 'register';
        const bodyObj = isLogin 
            ? { email, password }
            : { firstName, lastName, email, password, role: role.toUpperCase() };

        const response = await fetch(`http://localhost:8080/api/v1/auth/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyObj)
        });

        if (!response.ok) {
            const errorText = await response.text();
            alert(isLogin ? 'Login Failed. Invalid credentials.' : `Registration failed: ${errorText}`);
            return;
        }

        const data = await response.json();
        
        if (!isLogin) {
            // Show lottery modal for new registrations
            setWonPrize({
              name: 'Welcome Bonus',
              description: '3 Free Spins + 100 Reading Points',
              icon: 'card-giftcard',
              color: '#F59E0B'
            });
            setShowLotteryModal(true);
            setIsLogin(true);
            setPassword('');
            setEmail('');
            setFirstName('');
            setLastName('');
        } else {
            onLogin(data.role.toLowerCase(), data.token, data.memberId, data.firstName + ' ' + data.lastName);
        }
    } catch (err) {
        alert('Network error: Ensure the Spring Boot backend is running on port 8080.');
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  };

  // Forgot Password Handler
  const handleForgotPassword = async () => {
    if (!email) {
      alert('Please enter your email address.');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (response.ok) {
        alert('Password reset email sent! Please check your email for the reset token.');
        setShowForgotPassword(false);
        setShowResetPassword(true);
      } else {
        alert('Failed to send reset email. Please check if the email exists.');
      }
    } catch (err) {
      alert('Network error. Please ensure the backend is running.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset Password Handler
  const handleResetPassword = async () => {
    if (!resetToken || !newPassword || !confirmPassword) {
      alert('Please fill in all fields.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, newPassword })
      });
      
      if (response.ok) {
        alert('Password reset successful! Please login with your new password.');
        setShowResetPassword(false);
        setIsLogin(true);
        setEmail('');
        setPassword('');
        setResetToken('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const error = await response.text();
        alert(`Password reset failed: ${error}`);
      }
    } catch (err) {
      alert('Network error. Please ensure the backend is running.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView 
        contentContainerStyle={styles.container} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
    >
      {/* Lottery Welcome Modal */}
      <Modal
        visible={showLotteryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLotteryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LottieView
              source={{ uri: 'https://lottie.host/abc123/celebration.json' }}
              autoPlay
              loop={false}
              style={styles.celebrationLottie}
            />
            
            <Text style={styles.congratsText}>🎊 Welcome Bonus! 🎊</Text>
            <Text style={styles.welcomeText}>Thanks for joining our library!</Text>
            
            {wonPrize && (
              <View style={[styles.prizeDisplay, { backgroundColor: wonPrize.color }]}>
                <MaterialIcons name={wonPrize.icon} size={50} color="#fff" />
                <Text style={styles.prizeName}>{wonPrize.name}</Text>
                <Text style={styles.prizeDescription}>{wonPrize.description}</Text>
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.playLotteryBtn}
              onPress={() => {
                setShowLotteryModal(false);
                onShowLottery && onShowLottery();
              }}
            >
              <MaterialIcons name="casino" size={20} color="#fff" />
              <Text style={styles.playLotteryBtnText}>Play Lottery Now</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.laterBtn}
              onPress={() => setShowLotteryModal(false)}
            >
              <Text style={styles.laterBtnText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.card}>
        <View style={styles.header}>
            <View style={styles.lottieContainer}>
              <LottieView 
                source={{ uri: 'https://lottie.host/80860533-85bb-4752-9f17-8e6f14068305/0YmN9bX7fD.json' }} 
                autoPlay 
                loop 
                style={styles.lottie}
              />
            </View>
            <Text style={styles.title}>{t('title')}</Text>
            <Text style={styles.subtitle}>{isLogin ? t('login') : t('register')}</Text>
        </View>

        {/* Role Selector */}
        <View style={styles.roleTabs}>
            <TouchableOpacity 
                style={[styles.roleTab, role === 'user' && styles.roleTabActive]} 
                onPress={() => { setRole('user'); setIsLogin(true); setEmail(''); setPassword(''); }}
            >
                <MaterialIcons name="person" size={20} color={role === 'user' ? '#fff' : '#94A3B8'} />
                <Text style={[styles.roleText, role === 'user' && styles.roleTextActive]}>{t('userRole')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
                style={[styles.roleTab, role === 'admin' && styles.roleTabActive]} 
                onPress={() => { setRole('admin'); setIsLogin(true); setEmail(''); setPassword(''); }}
            >
                <MaterialIcons name="admin-panel-settings" size={20} color={role === 'admin' ? '#fff' : '#94A3B8'} />
                <Text style={[styles.roleText, role === 'admin' && styles.roleTextActive]}>{t('adminRole')}</Text>
            </TouchableOpacity>
        </View>

        {/* Lottery Promotion Banner - Show only for registration mode */}
        {!isLogin && role === 'user' && (
            <View style={styles.lotteryBanner}>
                <View style={styles.lotteryBannerContent}>
                    <MaterialIcons name="card-giftcard" size={24} color="#F59E0B" />
                    <View style={styles.lotteryBannerText}>
                        <Text style={styles.lotteryBannerTitle}>🎰 New User Bonus!</Text>
                        <Text style={styles.lotteryBannerSubtitle}>Get 3 FREE lottery spins when you register</Text>
                    </View>
                </View>
                <TouchableOpacity 
                    style={styles.viewPrizesBtn}
                    onPress={() => onShowLottery && onShowLottery()}
                >
                    <Text style={styles.viewPrizesText}>View Prizes</Text>
                </TouchableOpacity>
            </View>
        )}

        {/* Lottery Promotion for Login mode */}
        {isLogin && role === 'user' && (
            <TouchableOpacity 
                style={styles.miniLotteryBanner}
                onPress={() => onShowLottery && onShowLottery()}
            >
                <MaterialIcons name="emoji-events" size={20} color="#F59E0B" />
                <Text style={styles.miniLotteryText}>Try your luck! Spin to win prizes 🎰</Text>
                <MaterialIcons name="chevron-right" size={20} color="#94A3B8" />
            </TouchableOpacity>
        )}

        <View style={styles.formGroup}>
            <Text style={styles.label}>{role === 'admin' ? t('adminUsername') : t('emailAddress')}</Text>
            <TextInput 
                style={styles.input} 
                placeholder={role === 'admin' ? t('adminPlaceholder') : t('emailPlaceholder')} 
                placeholderTextColor="#64748B"
                value={email}
                onChangeText={setEmail}
                keyboardType={role === 'admin' ? "default" : "email-address"}
                autoCapitalize="none"
            />
        </View>

        {!isLogin && (
            <View style={{ flexDirection: 'row', gap: 15, marginBottom: 20 }}>
                <View style={[styles.formGroup, { flex: 1, marginBottom: 0 }]}>
                    <Text style={styles.label}>{t('firstName')}</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="John" 
                        placeholderTextColor="#64748B"
                        value={firstName}
                        onChangeText={setFirstName}
                    />
                </View>
                <View style={[styles.formGroup, { flex: 1, marginBottom: 0 }]}>
                    <Text style={styles.label}>{t('lastName')}</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="Doe" 
                        placeholderTextColor="#64748B"
                        value={lastName}
                        onChangeText={setLastName}
                    />
                </View>
            </View>
        )}

        <View style={styles.formGroup}>
            <Text style={styles.label}>{t('password')}</Text>
            <View style={styles.passwordWrapper}>
                <TextInput 
                    style={[styles.input, { flex: 1, borderRightWidth: 0, borderRadius: 10, borderTopRightRadius: 0, borderBottomRightRadius: 0 }]} 
                    placeholder={t('passwordPlaceholder')} 
                    placeholderTextColor="#64748B"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                />
                <TouchableOpacity 
                    style={styles.eyeBtn} 
                    onPress={() => setShowPassword(!showPassword)}
                >
                  <MaterialIcons name={showPassword ? "visibility-off" : "visibility"} size={22} color="#94A3B8" />
                </TouchableOpacity>
            </View>
        </View>

        <TouchableOpacity style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} onPress={handleAuthAction} disabled={isLoading}>
            <Text style={styles.loginButtonText}>
                {isLoading ? t('processing') : (isLogin ? `${t('signInAs')} ${role === 'admin' ? t('adminRole') : t('userRole')}` : t('register'))}
            </Text>
        </TouchableOpacity>

        {/* Forgot Password Link */}
        {isLogin && role === 'user' && (
            <TouchableOpacity 
                style={styles.forgotPasswordContainer}
                onPress={() => setShowForgotPassword(true)}
            >
                <Text style={styles.forgotPasswordText}>{t('forgotPassword')}</Text>
            </TouchableOpacity>
        )}

        {/* Toggle Login/Register for Users only */}
        {role === 'user' && (
            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    {isLogin ? t('donthaveAccount') : t('alreadyhaveAccount')}
                </Text>
                <TouchableOpacity 
                    onPress={() => {
                        setIsLogin(!isLogin);
                        setEmail('');
                        setPassword('');
                        setFirstName('');
                        setLastName('');
                    }}
                >
                    <Text style={styles.switchModeText}>
                        {isLogin ? t('registerNow') : t('login')}
                    </Text>
                </TouchableOpacity>
            </View>
        )}
      </View>

      {/* Forgot Password Modal */}
      <Modal
        visible={showForgotPassword}
        transparent
        animationType="fade"
        onRequestClose={() => setShowForgotPassword(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { borderColor: '#4F46E5' }]}>
            <MaterialIcons name="lock-reset" size={50} color="#4F46E5" />
            <Text style={styles.modalTitle}>Forgot Password?</Text>
            <Text style={styles.modalSubtitle}>Enter your email and we'll send you a reset token</Text>
            
            <View style={styles.modalInputContainer}>
              <MaterialIcons name="email" size={20} color="#94A3B8" style={styles.modalInputIcon} />
              <TextInput
                style={styles.modalInput}
                placeholder="Your email address"
                placeholderTextColor="#64748B"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <TouchableOpacity 
              style={[styles.modalButton, isLoading && styles.modalButtonDisabled]} 
              onPress={handleForgotPassword}
              disabled={isLoading}
            >
              <Text style={styles.modalButtonText}>
                {isLoading ? 'Sending...' : 'Send Reset Token'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalCancelButton}
              onPress={() => setShowForgotPassword(false)}
            >
              <Text style={styles.modalCancelText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        visible={showResetPassword}
        transparent
        animationType="fade"
        onRequestClose={() => setShowResetPassword(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { borderColor: '#10B981' }]}>
            <MaterialIcons name="lock-open" size={50} color="#10B981" />
            <Text style={styles.modalTitle}>Reset Password</Text>
            <Text style={styles.modalSubtitle}>Enter the token from your email and your new password</Text>
            
            <View style={styles.modalInputContainer}>
              <MaterialIcons name="confirmation-number" size={20} color="#94A3B8" style={styles.modalInputIcon} />
              <TextInput
                style={styles.modalInput}
                placeholder="Reset token"
                placeholderTextColor="#64748B"
                value={resetToken}
                onChangeText={setResetToken}
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.modalInputContainer}>
              <MaterialIcons name="lock" size={20} color="#94A3B8" style={styles.modalInputIcon} />
              <TextInput
                style={styles.modalInput}
                placeholder="New password (min 6 characters)"
                placeholderTextColor="#64748B"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
            </View>
            
            <View style={styles.modalInputContainer}>
              <MaterialIcons name="lock-outline" size={20} color="#94A3B8" style={styles.modalInputIcon} />
              <TextInput
                style={styles.modalInput}
                placeholder="Confirm new password"
                placeholderTextColor="#64748B"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.resetButton, isLoading && styles.modalButtonDisabled]} 
              onPress={handleResetPassword}
              disabled={isLoading}
            >
              <Text style={styles.modalButtonText}>
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalCancelButton}
              onPress={() => setShowResetPassword(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 40,
    backgroundColor: '#0A0E1A',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    minHeight: '100%',
  },
  card: {
    backgroundColor: '#1E293B',
    padding: 44,
    borderRadius: 24,
    width: '100%',
    maxWidth: 480,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  lottieContainer: {
    width: 140,
    height: 140,
    marginBottom: 10,
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F8FAFC',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 17,
    fontWeight: '500',
  },
  roleTabs: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 5,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 10,
  },
  roleTabActive: {
    backgroundColor: '#6366F1',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  roleText: {
    color: '#94A3B8',
    fontWeight: '600',
    fontSize: 15,
  },
  roleTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#E2E8F0',
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#0F172A',
    borderWidth: 2,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    borderRadius: 12,
    padding: 18,
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '500',
    ...Platform.select({
      web: { outlineStyle: 'none' } 
    })
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  eyeBtn: {
    paddingHorizontal: 16,
    height: '100%',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  loginButton: {
    backgroundColor: '#6366F1',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  loginButtonDisabled: {
    backgroundColor: '#475569',
    shadowOpacity: 0,
  },
  forgotPasswordContainer: {
    marginTop: 15,
    paddingVertical: 10,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#818CF8',
    fontWeight: '600',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  footerText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  switchModeText: {
    color: '#818CF8',
    fontWeight: '700',
    fontSize: 14,
  },
  // Lottery Banner Styles
  lotteryBanner: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  lotteryBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  lotteryBannerText: {
    flex: 1,
  },
  lotteryBannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F59E0B',
    marginBottom: 4,
  },
  lotteryBannerSubtitle: {
    fontSize: 13,
    color: '#E2E8F0',
  },
  viewPrizesBtn: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewPrizesText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '700',
  },
  miniLotteryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  miniLotteryText: {
    flex: 1,
    fontSize: 13,
    color: '#E2E8F0',
    fontWeight: '500',
  },
  modalButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  modalButtonDisabled: {
    backgroundColor: '#475569',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  resetButton: {
    backgroundColor: '#10B981',
  },
  modalCancelButton: {
    marginTop: 15,
    paddingVertical: 10,
  },
  modalCancelText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  modalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 15,
    width: '100%',
  },
  modalInputIcon: {
    paddingLeft: 12,
  },
  modalInput: {
    flex: 1,
    padding: 12,
    color: '#F8FAFC',
    fontSize: 14,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
    marginTop: 15,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 20,
    textAlign: 'center',
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
    borderColor: '#F59E0B',
  },
  celebrationLottie: {
    width: 150,
    height: 150,
  },
  congratsText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 20,
  },
  prizeDisplay: {
    width: 200,
    height: 180,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  prizeName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 10,
  },
  prizeDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 20,
  },
  playLotteryBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    justifyContent: 'center',
    marginBottom: 12,
  },
  playLotteryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  laterBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  laterBtnText: {
    color: '#94A3B8',
    fontSize: 14,
  }
});
