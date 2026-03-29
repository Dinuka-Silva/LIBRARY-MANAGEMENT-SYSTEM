import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Platform, Modal, ActivityIndicator, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { fetchPayments, processPayment, fetchMembers, createPaymentIntent, confirmPayment } from '../api';

const PAYMENT_METHODS = ['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'PAYPAL'];

const STATUS_COLORS = {
  COMPLETED: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', text: '#10B981' },
  PENDING:   { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', text: '#F59E0B' },
  FAILED:    { bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.3)',  text: '#EF4444' },
};

export default function PaymentsScreen({ token }) {
  const [payments, setPayments] = useState([]);
  const [members, setMembers]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]       = useState(null);
  
  // Toast notification state
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: 'success' }), 3000);
  };
  const [showModal, setShowModal] = useState(false);
  const [step, setStep]           = useState('form'); // form, gateway, processing, success
  const [lastTx, setLastTx]       = useState(null);

  // Card Info
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry]         = useState('');
  const [cvv, setCvv]               = useState('');

  // Form State
  const [selMemberId, setSelMemberId] = useState('');
  const [amount, setAmount]           = useState('');
  const [method, setMethod]           = useState('CASH');
  const [description, setDescription] = useState('');

  const loadAll = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);
      const [pData, mData] = await Promise.all([fetchPayments(token), fetchMembers(token)]);
      setPayments(pData || []);
      setMembers(mData || []);
    } catch (e) {
      setError(e.message);
      showToast('Failed to load payments', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  const onRefresh = () => {
    setRefreshing(true);
    loadAll(true);
  };

  useEffect(() => { loadAll(); }, [loadAll]);

  const totalRevenue = payments.filter(p => p.status === 'COMPLETED').reduce((s, p) => s + (p.amount || 0), 0);

  const startCheckout = async () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      showToast('Please enter a valid amount', 'warning');
      return;
    }
    
    try {
      setLoading(true);
      const intent = await createPaymentIntent({
        memberId: selMemberId || null,
        amount: parseFloat(amount),
        paymentMethod: method,
        description: description || 'Library Payment',
      }, token);
      
      setLastTx(intent);
      setStep(method === 'CREDIT_CARD' || method === 'DEBIT_CARD' ? 'gateway' : 'processing');
      if (method !== 'CREDIT_CARD' && method !== 'DEBIT_CARD') {
        executePayment(intent.paymentIntentId);
      }
    } catch (e) {
      showToast('Failed to initialize payment: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const executePayment = async (intentIdOverride = null) => {
    const intentId = intentIdOverride || lastTx?.paymentIntentId;
    setStep('processing');
    try {
      // Small artificial delay for "gateway feel"
      await new Promise(r => setTimeout(r, 2000));

      const result = await confirmPayment(intentId, token);

      setLastTx(result);
      setStep('success');
      showToast('Payment completed successfully!', 'success');
      loadAll();
    } catch (e) {
      showToast('Payment failed: ' + e.message, 'error');
      setStep('form');
    }
  };

  const closeGateway = () => {
    setShowModal(false);
    setStep('form');
    setSelMemberId(''); setAmount(''); setMethod('CASH'); setDescription('');
    setCardNumber(''); setExpiry(''); setCvv(''); setLastTx(null);
  };

  if (loading && !refreshing) return (
    <View style={[styles.centered, { backgroundColor: '#0F172A' }]}>
      <ActivityIndicator size="large" color="#10B981" />
      <Text style={styles.loadingText}>Loading payments...</Text>
    </View>
  );

  if (error && !loading) return (
    <View style={[styles.centered, { backgroundColor: '#0F172A' }]}>
      <MaterialIcons name="error-outline" size={48} color="#EF4444" />
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={[styles.retryBtn, { backgroundColor: '#4F46E5' }]} onPress={loadAll}>
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  const renderModalContent = () => {
    switch(step) {
      case 'form':
        return (
          <>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Process Payment</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <MaterialIcons name="close" size={24} color="#F8FAFC" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Member (Optional)</Text>
            <ScrollView style={styles.picker} nestedScrollEnabled>
              <TouchableOpacity
                style={[styles.pickerItem, selMemberId === '' && styles.pickerItemSelected]}
                onPress={() => setSelMemberId('')}
              >
                <Text style={[styles.pickerItemText, selMemberId === '' && styles.pickerItemTextSelected]}>— Anonymous / Walk-in —</Text>
              </TouchableOpacity>
              {members.map(m => (
                <TouchableOpacity
                  key={m.id}
                  style={[styles.pickerItem, selMemberId === String(m.id) && styles.pickerItemSelected]}
                  onPress={() => setSelMemberId(String(m.id))}
                >
                  <Text style={[styles.pickerItemText, selMemberId === String(m.id) && styles.pickerItemTextSelected]}>
                    {m.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Amount ($) *</Text>
              <TextInput style={styles.input} placeholder="0.00" placeholderTextColor="#64748B" keyboardType="numeric" value={amount} onChangeText={setAmount} />
            </View>

            <Text style={styles.label}>Payment Method</Text>
            <View style={styles.methodRow}>
              {PAYMENT_METHODS.map(m => (
                <TouchableOpacity
                  key={m}
                  style={[styles.methodBtn, method === m && styles.methodBtnActive]}
                  onPress={() => setMethod(m)}
                >
                  <Text style={[styles.methodBtnText, method === m && styles.methodBtnTextActive]}>{m.replace('_', ' ')}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={startCheckout}>
              <Text style={styles.submitText}>Next Step</Text>
              <MaterialIcons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </>
        );

      case 'gateway':
        const getCardBrand = (num) => {
          if (num.startsWith('4')) return { name: 'Visa', icon: 'payments', color: '#2563EB' };
          if (num.startsWith('5')) return { name: 'Mastercard', icon: 'credit-card', color: '#EA580C' };
          return { name: 'Generic', icon: 'credit-card', color: '#6366F1' };
        };
        const brand = getCardBrand(cardNumber);

        return (
          <>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setStep('form')}>
                <MaterialIcons name="arrow-back" size={24} color="#94A3B8" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Secure Checkout</Text>
              <MaterialIcons name="security" size={20} color="#10B981" />
            </View>

            <View style={[styles.cardPreview, { backgroundColor: brand.color }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <MaterialIcons name={brand.icon} size={40} color="#fff" style={{ opacity: 0.9 }} />
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800', opacity: 0.8 }}>{brand.name}</Text>
              </View>
              <Text style={[styles.cardPreviewNumber, { marginTop: 20 }]}>
                {cardNumber ? cardNumber.match(/.{1,4}/g).join(' ') : '**** **** **** ****'}
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 }}>
                 <View>
                   <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, textTransform: 'uppercase' }}>Card Holder</Text>
                   <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>{selMemberId ? members.find(m => String(m.id) === selMemberId)?.name : 'VALUED MEMBER'}</Text>
                 </View>
                 <View style={{ alignItems: 'flex-end' }}>
                   <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, textTransform: 'uppercase' }}>Expires</Text>
                   <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>{expiry || 'MM/YY'}</Text>
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
                    keyboardType="numeric" 
                    value={cardNumber} 
                    onChangeText={setCardNumber}
                    maxLength={16}
                 />
                 <MaterialIcons name={brand.icon} size={20} color="#64748B" style={styles.inputIcon} />
               </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 16 }}>
               <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Expiry Date</Text>
                  <TextInput style={styles.input} placeholder="MM/YY" placeholderTextColor="#64748B" value={expiry} onChangeText={setExpiry} maxLength={5} />
               </View>
               <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>CVV</Text>
                  <TextInput style={styles.input} placeholder="123" placeholderTextColor="#64748B" secureTextEntry value={cvv} onChangeText={setCvv} maxLength={3} />
               </View>
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={() => executePayment()}>
              <MaterialIcons name="lock" size={18} color="#fff" />
              <Text style={styles.submitText}>Pay ${parseFloat(amount).toFixed(2)} Securely</Text>
            </TouchableOpacity>
            
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16, gap: 12 }}>
               <Text style={{ color: '#64748B', fontSize: 12 }}>Powered by</Text>
               <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                 <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#6366F1' }} />
                 <Text style={{ color: '#F8FAFC', fontWeight: '800', fontSize: 14, letterSpacing: -0.5 }}>Antigravity Pay</Text>
               </View>
            </View>
          </>
        );

      case 'processing':
        return (
          <View style={{ alignItems: 'center', paddingVertical: 40, gap: 20 }}>
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={{ color: '#F8FAFC', fontSize: 18, fontWeight: '700' }}>Verifying Transaction...</Text>
            <Text style={{ color: '#94A3B8', textAlign: 'center' }}>Wait a moment while we process your request with the bank.</Text>
          </View>
        );

      case 'success':
        return (
          <View style={{ alignItems: 'center', paddingVertical: 20 }}>
            <MaterialIcons name="check-circle" size={80} color="#10B981" />
            <Text style={{ color: '#F8FAFC', fontSize: 24, fontWeight: '800', marginTop: 16 }}>Payment Successful!</Text>
            <Text style={{ color: '#94A3B8', marginTop: 8 }}>The transaction has been recorded.</Text>
            
            <View style={styles.receipt}>
               <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Transaction ID</Text><Text style={styles.receiptVal}>{lastTx?.transactionId}</Text></View>
               <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Reference</Text><Text style={styles.receiptVal}>{lastTx?.referenceNumber}</Text></View>
               <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Amount Paid</Text><Text style={[styles.receiptVal, { color: '#F8FAFC', fontWeight: '800' }]}>${parseFloat(amount).toFixed(2)}</Text></View>
            </View>

            <TouchableOpacity style={[styles.submitButton, { backgroundColor: '#334155', width: '100%' }]} onPress={closeGateway}>
              <Text style={styles.submitText}>Close Receipt</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      {/* Toast Notification */}
      {toast.visible && (
        <View style={[styles.toastContainer, { backgroundColor: toast.type === 'error' ? '#EF4444' : toast.type === 'warning' ? '#F59E0B' : '#10B981' }]}>
          <MaterialIcons 
            name={toast.type === 'error' ? 'error' : toast.type === 'warning' ? 'warning' : 'check-circle'} 
            size={20} 
            color="#fff" 
          />
          <Text style={styles.toastText}>{toast.message}</Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.title}>Payments</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.refreshBtn} onPress={loadAll}>
            <MaterialIcons name="refresh" size={20} color="#94A3B8" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
            <MaterialIcons name="add" size={20} color="#fff" />
            <Text style={styles.addText}>New Payment</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Overview */}
      <View style={styles.revenueCard}>
        <View style={styles.revenueItem}>
          <MaterialIcons name="receipt-long" size={32} color="#818CF8" />
          <Text style={styles.revenueNumber}>{payments.length}</Text>
          <Text style={styles.revenueLabel}>Transactions</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.revenueItem}>
          <MaterialIcons name="payments" size={32} color="#10B981" />
          <Text style={styles.revenueNumber}>${totalRevenue.toFixed(0)}</Text>
          <Text style={styles.revenueLabel}>Total Rev.</Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" colors={["#10B981"]} />
        }
      >
        {payments.length === 0 ? (
          <View style={styles.centered}>
            <MaterialIcons name="payment" size={48} color="#334155" />
            <Text style={styles.emptyText}>No payment history</Text>
          </View>
        ) : [...payments].reverse().map((p) => {
          const c = STATUS_COLORS[p.status] || STATUS_COLORS.COMPLETED;
          return (
            <View key={p.id} style={styles.paymentCard}>
              <View style={styles.paymentIcon}>
                <MaterialIcons name={p.paymentMethod.includes('CARD') ? "credit-card" : "account-balance-wallet"} size={22} color="#818CF8" />
              </View>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentDesc}>{p.description || 'Library Payment'}</Text>
                <Text style={styles.paymentMember}>{p.member?.name || 'Walk-in Guest'} · {p.paymentMethod}</Text>
              </View>
              <View style={styles.paymentRight}>
                <Text style={styles.paymentAmount}>${(p.amount || 0).toFixed(2)}</Text>
                <Text style={styles.paymentDate}>{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '—'}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {showModal && (
        <Modal transparent animationType="slide" visible>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
               {renderModalContent()}
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  // Toast Styles
  toastContainer: { position: 'absolute', top: 60, left: 20, right: 20, flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, zIndex: 9999, gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 10 },
  toastText: { color: '#fff', fontWeight: '600', fontSize: 14, flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 16 },
  loadingText: { color: '#94A3B8', fontSize: 16 },
  errorText: { color: '#EF4444', fontSize: 16, textAlign: 'center' },
  emptyText: { color: '#64748B', fontSize: 16 },
  retryBtn: { backgroundColor: '#4F46E5', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  retryText: { color: '#fff', fontWeight: '700' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerRight: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#F8FAFC' },
  refreshBtn: { padding: 8, backgroundColor: '#1E293B', borderRadius: 8, borderWidth: 1, borderColor: '#334155' },
  addButton: { backgroundColor: '#4F46E5', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, gap: 8 },
  addText: { color: '#fff', fontWeight: '600' },
  revenueCard: { backgroundColor: '#1E293B', borderRadius: 16, padding: 24, flexDirection: 'row', borderWidth: 1, borderColor: '#334155', marginBottom: 24 },
  revenueItem: { flex: 1, alignItems: 'center', gap: 6 },
  divider: { width: 1, backgroundColor: '#334155', marginHorizontal: 16 },
  revenueNumber: { fontSize: 28, fontWeight: '800', color: '#F8FAFC' },
  revenueLabel: { fontSize: 12, color: '#64748B', textTransform: 'uppercase', fontWeight: '700', letterSpacing: 0.5 },
  listContainer: { paddingBottom: 40, gap: 12 },
  paymentCard: { backgroundColor: '#1E293B', borderRadius: 14, padding: 18, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#334155', gap: 14 },
  paymentIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(79,70,229,0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(79,70,229,0.2)' },
  paymentInfo: { flex: 1 },
  paymentDesc: { fontSize: 16, fontWeight: '700', color: '#F8FAFC', marginBottom: 2 },
  paymentMember: { fontSize: 13, color: '#94A3B8' },
  paymentRight: { alignItems: 'flex-end', gap: 4 },
  paymentAmount: { fontSize: 18, fontWeight: '800', color: '#F8FAFC' },
  paymentDate: { fontSize: 12, color: '#64748B' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1E293B', borderRadius: 20, padding: 30, width: '100%', maxWidth: 480, borderWidth: 1, borderColor: '#334155' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 22, fontWeight: '700', color: '#F8FAFC' },
  label: { color: '#E2E8F0', marginBottom: 8, fontSize: 14, fontWeight: '500' },
  picker: { backgroundColor: '#0F172A', borderRadius: 12, borderWidth: 1, borderColor: '#334155', maxHeight: 110, marginBottom: 16 },
  pickerItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  pickerItemSelected: { backgroundColor: 'rgba(79,70,229,0.15)' },
  pickerItemText: { color: '#94A3B8', fontSize: 14 },
  pickerItemTextSelected: { color: '#818CF8', fontWeight: '600' },
  formGroup: { marginBottom: 16 },
  input: { backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#334155', borderRadius: 12, padding: 16, color: '#F8FAFC', fontSize: 16, ...Platform.select({ web: { outlineStyle: 'none' } }) },
  inputWrapper: { position: 'relative', justifyContent: 'center' },
  inputIconified: { backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#334155', borderRadius: 12, padding: 16, paddingRight: 45, color: '#F8FAFC', fontSize: 16, ...Platform.select({ web: { outlineStyle: 'none' } }) },
  inputIcon: { position: 'absolute', right: 16 },
  methodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  methodBtn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#334155' },
  methodBtnActive: { backgroundColor: 'rgba(79,70,229,0.15)', borderColor: '#4F46E5', borderWidth: 1.5 },
  methodBtnText: { color: '#64748B', fontSize: 13, fontWeight: '600' },
  methodBtnTextActive: { color: '#818CF8' },
  submitButton: { backgroundColor: '#4F46E5', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10, flexDirection: 'row', justifyContent: 'center', gap: 10 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cardPreview: { backgroundColor: '#4F46E5', borderRadius: 16, padding: 24, marginBottom: 24, shadowColor: '#4F46E5', shadowOffset: { width:0, height:8 }, shadowOpacity: 0.4, shadowRadius: 15 },
  cardPreviewNumber: { color: '#fff', fontSize: 20, fontWeight: 'bold', letterSpacing: 2 },
  receipt: { backgroundColor: '#0F172A', borderRadius: 12, padding: 20, width: '100%', marginVertical: 24, gap: 12 },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between' },
  receiptLabel: { color: '#64748B', fontSize: 13 },
  receiptVal: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
});
