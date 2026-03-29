import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Platform, Modal, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { fetchDonations, createDonation, createPaymentIntent, confirmPayment } from '../api';

export default function DonationsScreen({ token }) {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]       = useState(false);

  const [donorName, setDonorName]   = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [amount, setAmount]         = useState('');
  const [message, setMessage]       = useState('');

  // Payment Gateway specific states
  const [step, setStep]             = useState('form'); // form | gateway | processing | success
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry]         = useState('');
  const [cvv, setCvv]               = useState('');
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [lastTx, setLastTx]         = useState(null);

  const loadDonations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchDonations(token);
      setDonations(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadDonations(); }, [loadDonations]);

  const totalDonated = donations.reduce((sum, d) => sum + (d.amount || 0), 0);

  const startCheckout = async () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      alert('Please enter a valid donation amount.');
      return;
    }
    try {
      setSaving(true);
      // Create payment intent first
      const intent = await createPaymentIntent({
        amount: parseFloat(amount),
        currency: 'USD',
        description: `Donation from ${donorName || 'Anonymous'}`,
        memberId: donorEmail || 'guest', // Using email as identifier if no memberId
      }, token);
      
      setPaymentIntent(intent);
      setStep('gateway');
    } catch (e) {
      alert('Failed to start checkout: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const executePayment = async () => {
    try {
      setStep('processing');
      const confirmation = await confirmPayment(paymentIntent.paymentIntentId, token);
      
      // Record the donation in our database after successful payment
      await createDonation({
        donorName: donorName || 'Anonymous',
        donorEmail: donorEmail,
        amount: parseFloat(amount),
        message,
      }, token);
      
      setLastTx(confirmation);
      setStep('success');
      await loadDonations();
    } catch (e) {
      alert('Payment failed: ' + e.message);
      setStep('gateway');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setStep('form');
    setDonorName(''); setDonorEmail(''); setAmount(''); setMessage('');
    setCardNumber(''); setExpiry(''); setCvv('');
    setPaymentIntent(null);
  };

  if (loading) return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color="#F59E0B" />
      <Text style={styles.loadingText}>Loading donations...</Text>
    </View>
  );

  if (error) return (
    <View style={styles.centered}>
      <MaterialIcons name="error-outline" size={48} color="#EF4444" />
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={loadDonations}><Text style={styles.retryText}>Retry</Text></TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Donations</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.refreshBtn} onPress={loadDonations}>
            <MaterialIcons name="refresh" size={20} color="#94A3B8" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
            <MaterialIcons name="volunteer-activism" size={20} color="#fff" />
            <Text style={styles.addText}>Record Donation</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <MaterialIcons name="volunteer-activism" size={32} color="#F59E0B" />
          <Text style={styles.summaryNumber}>{donations.length}</Text>
          <Text style={styles.summaryLabel}>Total Donations</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <MaterialIcons name="attach-money" size={32} color="#10B981" />
          <Text style={styles.summaryNumber}>${totalDonated.toFixed(2)}</Text>
          <Text style={styles.summaryLabel}>Amount Raised</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.listContainer}>
        {donations.length === 0 ? (
          <View style={styles.centered}>
            <MaterialIcons name="volunteer-activism" size={48} color="#334155" />
            <Text style={styles.emptyText}>No donations yet. Be the first!</Text>
          </View>
        ) : [...donations].reverse().map((d) => (
          <View key={d.id} style={styles.donationCard}>
            <View style={styles.donationAvatar}>
              <MaterialIcons name="favorite" size={22} color="#F59E0B" />
            </View>
            <View style={styles.donationInfo}>
              <Text style={styles.donorName}>{d.donorName || 'Anonymous'}</Text>
              {d.message ? <Text style={styles.donationMsg}>"{d.message}"</Text> : null}
              <Text style={styles.donationDate}>{d.donationDate ? new Date(d.donationDate).toLocaleDateString() : '—'}</Text>
            </View>
            <View style={styles.amountBadge}>
              <Text style={styles.amountText}>${(d.amount || 0).toFixed(2)}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* New Donation Modal */}
      {showModal && (
        <Modal transparent animationType="fade" visible>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {step === 'form' && (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Record Donation</Text>
                    <TouchableOpacity onPress={closeModal}>
                      <MaterialIcons name="close" size={24} color="#F8FAFC" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Donor Name (Optional)</Text>
                    <TextInput style={styles.input} placeholder="Leave blank for Anonymous" placeholderTextColor="#64748B" value={donorName} onChangeText={setDonorName} />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Email Address (For Thank You Mail)</Text>
                    <TextInput style={styles.input} placeholder="your@email.com" placeholderTextColor="#64748B" keyboardType="email-address" value={donorEmail} onChangeText={setDonorEmail} />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Amount ($) *</Text>
                    <TextInput style={styles.input} placeholder="0.00" placeholderTextColor="#64748B" keyboardType="numeric" value={amount} onChangeText={setAmount} />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Message (Optional)</Text>
                    <TextInput style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]} placeholder="A kind note..." placeholderTextColor="#64748B" multiline numberOfLines={3} value={message} onChangeText={setMessage} />
                  </View>

                  <TouchableOpacity style={[styles.submitButton, saving && { opacity: 0.6 }]} onPress={startCheckout} disabled={saving}>
                    {saving ? <ActivityIndicator color="#fff" /> : <>
                      <MaterialIcons name="favorite" size={18} color="#fff" />
                      <Text style={styles.submitText}>Next Step</Text>
                    </>}
                  </TouchableOpacity>
                </>
              )}

              {step === 'gateway' && (
                <View>
                  <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={() => setStep('form')}>
                      <MaterialIcons name="arrow-back" size={24} color="#F8FAFC" />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Secure Checkout</Text>
                    <MaterialIcons name="security" size={24} color="#10B981" />
                  </View>

                  <View style={styles.cardPreview}>
                    <View style={styles.cardInner}>
                      <MaterialIcons name="credit-card" size={40} color="#fff" style={{ opacity: 0.8 }} />
                      <Text style={styles.cardBrand}>{cardNumber.startsWith('4') ? 'Visa' : cardNumber.startsWith('5') ? 'Mastercard' : 'Generic'}</Text>
                      <Text style={styles.cardNumberPreview}>
                        {cardNumber.length > 0 ? cardNumber.match(/.{1,4}/g).join(' ') : '**** **** **** ****'}
                      </Text>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 20 }}>
                        <View>
                          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10 }}>CARD HOLDER</Text>
                          <Text style={{ color: '#fff', fontWeight: 'bold' }}>{donorName || 'VALUED DONOR'}</Text>
                        </View>
                        <View>
                          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10 }}>EXPIRES</Text>
                          <Text style={{ color: '#fff', fontWeight: 'bold' }}>{expiry || 'MM/YY'}</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Card Number</Text>
                    <View style={styles.inputWrapper}>
                      <TextInput 
                        style={styles.inputIconified} 
                        placeholder="4242 4242 4242 4242" 
                        placeholderTextColor="#64748B" 
                        value={cardNumber} 
                        onChangeText={v => setCardNumber(v.replace(/\s/g, '').slice(0, 16))}
                        keyboardType="numeric"
                      />
                      <MaterialIcons name="credit-card" size={20} color="#334155" style={styles.inputIcon} />
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.label}>Expiry Date</Text>
                      <TextInput style={styles.input} placeholder="MM/YY" placeholderTextColor="#64748B" value={expiry} onChangeText={setExpiry} />
                    </View>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.label}>CVV</Text>
                      <TextInput style={styles.input} placeholder="123" placeholderTextColor="#64748B" secureTextEntry value={cvv} onChangeText={v => setCvv(v.slice(0, 3))} />
                    </View>
                  </View>

                  <TouchableOpacity style={styles.payButton} onPress={executePayment}>
                    <MaterialIcons name="lock" size={18} color="#fff" />
                    <Text style={styles.submitText}>Donate ${parseFloat(amount).toFixed(2)} Securely</Text>
                  </TouchableOpacity>

                  <View style={{ alignItems: 'center', marginTop: 16 }}>
                    <Text style={{ color: '#64748B', fontSize: 12 }}>Powered by <Text style={{ color: '#818CF8', fontWeight: 'bold' }}>Antigravity Pay</Text></Text>
                  </View>
                </View>
              )}

              {step === 'processing' && (
                <View style={[styles.centered, { paddingVertical: 40 }]}>
                  <ActivityIndicator size="large" color="#4F46E5" />
                  <Text style={[styles.modalTitle, { marginTop: 24 }]}>Processing Donation...</Text>
                  <Text style={{ color: '#94A3B8', marginTop: 8 }}>Securing your generous gift</Text>
                </View>
              )}

              {step === 'success' && (
                <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                  <View style={styles.successIcon}>
                    <MaterialIcons name="check-circle" size={80} color="#10B981" />
                  </View>
                  <Text style={styles.successTitle}>Thank You!</Text>
                  <Text style={styles.successSub}>Your donation was successful.</Text>
                  
                  <View style={styles.receiptContainer}>
                    <Text style={{ color: '#64748B', fontSize: 12 }}>TRANSACTION ID</Text>
                    <Text style={{ color: '#F8FAFC', fontWeight: 'bold', marginBottom: 12 }}>{lastTx?.id || 'TRX-DEFAULT'}</Text>
                    <Text style={{ color: '#64748B', fontSize: 12 }}>AMOUNT</Text>
                    <Text style={{ color: '#10B981', fontWeight: 'bold', fontSize: 24 }}>${parseFloat(amount).toFixed(2)}</Text>
                  </View>

                  <TouchableOpacity style={styles.closeBtn} onPress={closeModal}>
                    <Text style={styles.submitText}>Close Modal</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 16 },
  loadingText: { color: '#94A3B8', fontSize: 16 },
  errorText: { color: '#EF4444', fontSize: 16, textAlign: 'center' },
  emptyText: { color: '#64748B', fontSize: 16 },
  retryBtn: { backgroundColor: '#F59E0B', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  retryText: { color: '#fff', fontWeight: '700' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerRight: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#F8FAFC' },
  refreshBtn: { padding: 8, backgroundColor: '#1E293B', borderRadius: 8, borderWidth: 1, borderColor: '#334155' },
  addButton: { backgroundColor: '#F59E0B', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, gap: 8 },
  addText: { color: '#fff', fontWeight: '600' },
  summaryCard: { backgroundColor: '#1E293B', borderRadius: 16, padding: 24, flexDirection: 'row', borderWidth: 1, borderColor: '#334155', marginBottom: 24 },
  summaryItem: { flex: 1, alignItems: 'center', gap: 8 },
  summaryDivider: { width: 1, backgroundColor: '#334155', marginHorizontal: 16 },
  summaryNumber: { fontSize: 28, fontWeight: '800', color: '#F8FAFC' },
  summaryLabel: { fontSize: 13, color: '#64748B', textTransform: 'uppercase', fontWeight: '600', letterSpacing: 0.5 },
  listContainer: { paddingBottom: 40, gap: 12 },
  donationCard: { backgroundColor: '#1E293B', borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#334155', gap: 16 },
  donationAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(245,158,11,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)' },
  donationInfo: { flex: 1 },
  donorName: { fontSize: 16, fontWeight: '700', color: '#F8FAFC', marginBottom: 2 },
  donationMsg: { fontSize: 13, color: '#94A3B8', fontStyle: 'italic', marginBottom: 4 },
  donationDate: { fontSize: 12, color: '#64748B' },
  amountBadge: { backgroundColor: 'rgba(16,185,129,0.15)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)' },
  amountText: { fontSize: 16, fontWeight: '800', color: '#10B981' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1E293B', borderRadius: 16, padding: 28, width: '100%', maxWidth: 480, borderWidth: 1, borderColor: '#334155' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 22, fontWeight: '700', color: '#F8FAFC' },
  formGroup: { marginBottom: 16 },
  label: { color: '#E2E8F0', marginBottom: 8, fontSize: 14, fontWeight: '500' },
  input: { backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#334155', borderRadius: 10, padding: 16, color: '#F8FAFC', fontSize: 16, ...Platform.select({ web: { outlineStyle: 'none' } }) },
  submitButton: { backgroundColor: '#F59E0B', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 20, flexDirection: 'row', justifyContent: 'center', gap: 8 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cardPreview: { height: 190, marginBottom: 24, borderRadius: 20, overflow: 'hidden', padding: 2 },
  cardInner: { flex: 1, backgroundColor: '#4F46E5', borderRadius: 18, padding: 24, justifyContent: 'space-between', shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 15, elevation: 12 },
  cardBrand: { color: '#fff', fontSize: 18, fontWeight: '900', position: 'absolute', top: 24, right: 24, opacity: 0.9 },
  cardNumberPreview: { color: '#fff', fontSize: 22, fontWeight: 'bold', letterSpacing: 2, marginTop: 30, textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  payButton: { backgroundColor: '#10B981', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 24, flexDirection: 'row', justifyContent: 'center', gap: 10, shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  inputWrapper: { position: 'relative', justifyContent: 'center' },
  inputIconified: { backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#334155', borderRadius: 12, padding: 16, paddingRight: 45, color: '#F8FAFC', fontSize: 16, ...Platform.select({ web: { outlineStyle: 'none' } }) },
  inputIcon: { position: 'absolute', right: 16 },
  successIcon: { marginBottom: 20, transform: [{ scale: 1.2 }] },
  successTitle: { fontSize: 28, fontWeight: '800', color: '#F8FAFC', marginBottom: 8 },
  successSub: { color: '#94A3B8', fontSize: 16, marginBottom: 30 },
  receiptContainer: { backgroundColor: '#0F172A', padding: 24, borderRadius: 16, width: '100%', borderWidth: 1, borderColor: '#334155', alignItems: 'center', marginBottom: 30 },
  closeBtn: { backgroundColor: '#334155', padding: 16, borderRadius: 12, width: '100%', alignItems: 'center' },
});
