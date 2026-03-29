import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform, Modal, ActivityIndicator, RefreshControl, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { fetchBorrowRecords, borrowBook, returnBook, renewBook, triggerOverdueCheck, fetchBooks, fetchMembers } from '../api';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useTheme } from '../ThemeContext';
import { useTranslation } from 'react-i18next';

const STATUS_COLORS = {
  BORROWED: { bg: 'rgba(79,70,229,0.15)', border: 'rgba(79,70,229,0.3)', text: '#818CF8' },
  RETURNED: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', text: '#10B981' },
  OVERDUE: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', text: '#EF4444' },
};

export default function BorrowScreen({ userRole, token, memberId, userName }) {
  const { t } = useTranslation();
  const { theme, isDarkMode } = useTheme();
  const [records, setRecords] = useState([]);
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Toast notification state
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: 'success' }), 3000);
  };
  const [selBookId, setSelBookId] = useState('');
  const [selMemberId, setSelMemberId] = useState('');
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('ALL'); // ALL | BORROWED | RETURNED | OVERDUE
  const [showScanner, setShowScanner] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [manualIsbn, setManualIsbn] = useState('');

  const loadAll = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);
      const [rec, bks, mem] = await Promise.all([
        fetchBorrowRecords(token),
        fetchBooks(token),
        fetchMembers(token),
      ]);
      setRecords(rec || []);
      setBooks(bks || []);
      setMembers(mem || []);
      
      // If user is a regular member, pre-select their ID
      if (userRole === 'user' && memberId) {
        setSelMemberId(memberId);
      }
    } catch (e) {
      setError(e.message);
      showToast('Failed to load records', 'error');
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

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    processScannedData(data);
  };

  const processScannedData = (data) => {
    setShowScanner(false);
    const book = books.find(b => b.isbn === data);
    if (book) {
      setSelBookId(String(book.id));
      setShowModal(true);
      showToast(`Book Found: ${book.title}`, 'success');
    } else {
      showToast(`No book found with ISBN: ${data}`, 'error');
    }
    setScanned(false);
    setManualIsbn('');
  };

  const handleManualSubmit = () => {
    if (!manualIsbn) return;
    processScannedData(manualIsbn);
  };

  const handleBorrow = async () => {
    if (!selBookId || !selMemberId) { 
      showToast('Please select both a book and a member', 'warning'); 
      return; 
    }
    try {
      setSaving(true);
      // Use string IDs directly as MongoDB uses string-based IDs
      await borrowBook(selBookId, selMemberId, token);
      setShowModal(false);
      setSelBookId(''); 
      if (userRole === 'admin') setSelMemberId('');
      showToast('Book borrowed successfully!', 'success');
      loadAll();
    } catch (e) {
      showToast('Borrow failed: ' + e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReturn = async (recordId, title) => {
    if (!window.confirm(`Confirm return of "${title}"?`)) return;
    try {
      await returnBook(recordId, token);
      showToast('Book returned successfully!', 'success');
      loadAll();
    } catch (e) {
      showToast('Return failed: ' + e.message, 'error');
    }
  };

  const handleRenew = async (recordId, title) => {
    if (!window.confirm(`Confirm renewal of "${title}" for 7 more days?`)) return;
    try {
      await renewBook(recordId, token);
      showToast('Book renewed successfully!', 'success');
      loadAll();
    } catch (e) {
      showToast('Renewal failed: ' + e.message, 'error');
    }
  };

  const handleCheckOverdue = async () => {
    try {
      setRefreshing(true);
      await triggerOverdueCheck(token);
      showToast('Overdue check completed!', 'success');
      loadAll();
    } catch (e) {
      showToast('Overdue check failed: ' + e.message, 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const userRecords = userRole === 'admin' ? records : records.filter(r => r.member?.id === memberId);
  const filtered = filter === 'ALL' ? userRecords : userRecords.filter(r => r.status === filter);

  if (loading && !refreshing) return (
    <View style={[styles.centered, { backgroundColor: theme.background }]}>
      <ActivityIndicator size="large" color={theme.primary} />
      <Text style={[styles.loadingText, { color: theme.textSecondary }]}>{t('fetchingStats')}</Text>
    </View>
  );

  if (error && !loading) return (
    <View style={[styles.centered, { backgroundColor: theme.background }]}>
      <MaterialIcons name="error-outline" size={48} color="#EF4444" />
      <Text style={[styles.errorText, { color: theme.textSecondary }]}>{error}</Text>
      <TouchableOpacity style={[styles.retryBtn, { backgroundColor: theme.primary }]} onPress={loadAll}>
        <Text style={styles.retryText}>{t('refresh')}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
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
        <Text style={[styles.title, { color: theme.textPrimary }]}>{t('borrow')}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={[styles.refreshBtn, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={loadAll}>
            <MaterialIcons name="refresh" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
          {userRole === 'admin' && (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.success }]} onPress={() => setShowScanner(true)}>
                <MaterialIcons name="qr-code-scanner" size={20} color="#fff" />
                <Text style={styles.addText}>{t('scan')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.warning }]} onPress={handleCheckOverdue}>
                <MaterialIcons name="notifications-active" size={20} color="#fff" />
                <Text style={styles.addText}>{t('checkOverdue')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.accent }]} onPress={() => setShowModal(true)}>
                <MaterialIcons name="add" size={20} color="#fff" />
                <Text style={styles.addText}>{t('add')}</Text>
              </TouchableOpacity>
            </View>
          )}
          {userRole === 'user' && (
             <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.accent }]} onPress={() => setShowModal(true)}>
              <MaterialIcons name="add" size={20} color="#fff" />
              <Text style={styles.addText}>{t('borrowNow')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* Active Borrowers Summary (Admin Only) */}
      {userRole === 'admin' && filter === 'BORROWED' && records.filter(r => r.status === 'BORROWED').length > 0 && (
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>{t('activeBorrowers')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.summaryList}>
             {[...new Set(records.filter(r => r.status === 'BORROWED').map(r => r.member?.name))].map(name => (
               <View key={name} style={styles.borrowerTag}>
                 <MaterialIcons name="person" size={14} color="#10B981" />
                 <Text style={styles.borrowerTagText}>{name}</Text>
               </View>
             ))}
          </ScrollView>
        </View>
      )}

      {/* Filter tabs */}
      <View style={[styles.filterRow, { borderBottomColor: theme.border }]}>
        {['ALL', 'BORROWED', 'RETURNED', 'OVERDUE'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && { borderBottomColor: theme.accent }]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, { color: filter === f ? theme.accent : theme.textSecondary, fontWeight: filter === f ? '700' : '500' }]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Scanner Modal */}
      {showScanner && (
        <Modal transparent animationType="slide" visible>
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('scan')}</Text>
                <TouchableOpacity onPress={() => setShowScanner(false)}>
                  <MaterialIcons name="close" size={24} color="#F8FAFC" />
                </TouchableOpacity>
              </View>

              <View style={styles.scannerFrame}>
                {Platform.OS !== 'web' ? (
                  <BarCodeScanner
                    onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                    style={StyleSheet.absoluteFillObject}
                  />
                ) : (
                  <View style={styles.webScannerFallback}>
                    <MaterialIcons name="camera-alt" size={48} color="#334155" />
                    <Text style={styles.webScannerText}>Camera Scanner is optimized for mobile.</Text>
                    <Text style={styles.webScannerSubtext}>Use the manual entry below for web access.</Text>
                  </View>
                )}
                <View style={styles.scanTarget} />
              </View>

              <View style={styles.manualEntryContainer}>
                <Text style={styles.label}>Manual ISBN Entry</Text>
                <View style={styles.manualInputRow}>
                  <TextInput
                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                    placeholder="Enter ISBN Number (e.g. 978-...)"
                    placeholderTextColor="#64748B"
                    value={manualIsbn}
                    onChangeText={setManualIsbn}
                  />
                  <TouchableOpacity style={styles.manualSubmitBtn} onPress={handleManualSubmit}>
                    <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.scanHint}>Position the barcode within the frame</Text>
            </View>
          </View>
        </Modal>
      )}

      <ScrollView 
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4F46E5" colors={["#4F46E5"]} />
        }
      >
        {filtered.length === 0 ? (
          <View style={styles.centered}>
            <MaterialIcons name="compare-arrows" size={48} color="#334155" />
            <Text style={styles.emptyText}>{t('noTrending')}</Text>
          </View>
        ) : filtered.map((rec) => {
          const colors = STATUS_COLORS[rec.status] || STATUS_COLORS.BORROWED;
          return (
            <View key={rec.id} style={styles.recordCard}>
              <View style={styles.recordLeft}>
                <View style={[styles.statusDot, { backgroundColor: colors.text }]} />
                <View style={styles.recordInfo}>
                   {userRole === 'admin' && <Text style={styles.borrowerBadge}>{t('members')}: {rec.member?.name}</Text>}
                  <Text style={styles.bookTitle}>{rec.book?.title || '—'}</Text>
                  <Text style={styles.memberName}>by {rec.book?.author}</Text>
                  <View style={styles.dateRow}>
                    <MaterialIcons name="calendar-today" size={13} color="#64748B" />
                    <Text style={styles.dateText}>{t('borrowMonth')}: {rec.borrowDate}</Text>
                    <Text style={styles.dateSep}>·</Text>
                    <Text style={styles.dateText}>{t('due')}: {rec.dueDate}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.recordRight}>
                <View style={[styles.statusBadge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                  <Text style={[styles.statusText, { color: colors.text }]}>{rec.status}</Text>
                </View>
                {rec.fineAmount > 0 && (
                  <View style={styles.fineBadge}>
                    <MaterialIcons name="monetization-on" size={14} color="#F59E0B" />
                    <Text style={styles.fineText}>Fine: ${rec.fineAmount.toFixed(2)}</Text>
                  </View>
                )}
                {rec.status === 'BORROWED' && (
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <TouchableOpacity
                      style={[styles.returnBtn, { backgroundColor: theme.primary }]}
                      onPress={() => handleRenew(rec.id, rec.book?.title)}
                    >
                      <MaterialIcons name="autorenew" size={16} color="#fff" />
                      <Text style={styles.returnBtnText}>{t('renew')}</Text>
                    </TouchableOpacity>
                    {userRole === 'admin' && (
                      <TouchableOpacity
                        style={styles.returnBtn}
                        onPress={() => handleReturn(rec.id, rec.book?.title)}
                      >
                        <MaterialIcons name="keyboard-return" size={16} color="#fff" />
                        <Text style={styles.returnBtnText}>{t('returnBook')}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Borrow Modal */}
      {showModal && (
        <Modal transparent animationType="fade" visible>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{userRole === 'admin' ? t('add') : t('borrowNow')}</Text>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <MaterialIcons name="close" size={24} color="#F8FAFC" />
                </TouchableOpacity>
              </View>
 
               <Text style={styles.label}>{t('selectBook')}</Text>
              <ScrollView style={styles.picker} nestedScrollEnabled>
                {books.filter(b => b.availableCopies > 0).map(b => (
                  <TouchableOpacity
                    key={b.id}
                    style={[styles.pickerItem, selBookId === String(b.id) && styles.pickerItemSelected]}
                    onPress={() => setSelBookId(String(b.id))}
                  >
                    <Text style={[styles.pickerItemText, selBookId === String(b.id) && styles.pickerItemTextSelected]}>
                      {b.title} <Text style={{ color: '#64748B' }}>({b.availableCopies} left)</Text>
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {userRole === 'admin' ? (
                <>
                  <Text style={[styles.label, { marginTop: 16 }]}>Select Member</Text>
                  <ScrollView style={styles.picker} nestedScrollEnabled>
                    {members.map(m => (
                      <TouchableOpacity
                        key={m.id}
                        style={[styles.pickerItem, selMemberId === String(m.id) && styles.pickerItemSelected]}
                        onPress={() => setSelMemberId(String(m.id))}
                      >
                        <Text style={[styles.pickerItemText, selMemberId === String(m.id) && styles.pickerItemTextSelected]}>
                          {m.name} <Text style={{ color: '#64748B' }}>({m.email})</Text>
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              ) : (
                <View style={{ marginTop: 16, padding: 12, backgroundColor: '#0F172A', borderRadius: 10, borderWidth: 1, borderColor: '#334155' }}>
                   <Text style={{ color: '#94A3B8', fontSize: 13, marginBottom: 4 }}>{t('borrowingAs')}:</Text>
                    <Text style={{ color: '#F8FAFC', fontWeight: '700', fontSize: 16 }}>
                      {userName || members.find(m => String(m.id) === String(memberId))?.name || 'Loading user...'}
                    </Text>
                </View>
              )}

              <TouchableOpacity style={[styles.submitButton, saving && { opacity: 0.6 }]} onPress={handleBorrow} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>{userRole === 'admin' ? t('confirm') : t('confirm')}</Text>}
              </TouchableOpacity>
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
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  filterTab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155' },
  filterTabActive: { backgroundColor: 'rgba(79,70,229,0.2)', borderColor: '#4F46E5' },
  filterText: { color: '#64748B', fontWeight: '600', fontSize: 13 },
  filterTextActive: { color: '#818CF8' },
  listContainer: { paddingBottom: 40, gap: 12 },
  recordCard: { backgroundColor: '#1E293B', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#334155', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16 },
  recordLeft: { flex: 1, flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginTop: 6 },
  recordInfo: { flex: 1, gap: 4 },
  bookTitle: { fontSize: 17, fontWeight: '700', color: '#F8FAFC', marginBottom: 2 },
  memberName: { fontSize: 14, color: '#94A3B8', marginBottom: 6 },
  dateRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dateText: { fontSize: 12, color: '#64748B' },
  dateSep: { color: '#334155' },
  recordRight: { alignItems: 'flex-end', gap: 10 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  statusText: { fontSize: 12, fontWeight: '700' },
  returnBtn: { backgroundColor: '#10B981', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, gap: 6 },
  returnBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1E293B', borderRadius: 16, padding: 28, width: '100%', maxWidth: 520, borderWidth: 1, borderColor: '#334155' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 22, fontWeight: '700', color: '#F8FAFC' },
  label: { color: '#E2E8F0', marginBottom: 8, fontSize: 14, fontWeight: '500' },
  picker: { backgroundColor: '#0F172A', borderRadius: 10, borderWidth: 1, borderColor: '#334155', maxHeight: 150 },
  pickerItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  pickerItemSelected: { backgroundColor: 'rgba(79,70,229,0.2)' },
  pickerItemText: { color: '#94A3B8', fontSize: 14 },
  pickerItemTextSelected: { color: '#818CF8', fontWeight: '600' },
  submitButton: { backgroundColor: '#4F46E5', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 24 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  scannerOverlay: { flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },
  scannerContent: { width: '100%', height: '100%', padding: 20 },
  scannerFrame: { flex: 1, borderRadius: 20, overflow: 'hidden', backgroundColor: '#000', marginVertical: 20, position: 'relative' },
  scanTarget: { position: 'absolute', top: '25%', left: '10%', right: '10%', height: '50%', borderStyle: 'dashed', borderWidth: 2, borderColor: '#4F46E5', borderRadius: 10 },
  scanHint: { textAlign: 'center', color: '#94A3B8', fontSize: 16, marginBottom: 40 },
  webScannerFallback: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F172A', gap: 12 },
  webScannerText: { color: '#F8FAFC', fontSize: 16, fontWeight: '700' },
  webScannerSubtext: { color: '#64748B', fontSize: 14 },
  manualEntryContainer: { paddingVertical: 20, borderTopWidth: 1, borderTopColor: '#334155' },
  manualInputRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  manualSubmitBtn: { backgroundColor: '#4F46E5', width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  fineBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(245,158,11,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4, marginTop: 4 },
  fineText: { color: '#F59E0B', fontWeight: '800', fontSize: 12 },
  summarySection: {
    padding: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(16, 185, 129, 0.1)',
    marginBottom: 10,
  },
  summaryTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10B981',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  summaryList: {
    flexDirection: 'row',
  },
  borrowerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    gap: 6,
  },
  borrowerTagText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
  },
  borrowerBadge: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
});
