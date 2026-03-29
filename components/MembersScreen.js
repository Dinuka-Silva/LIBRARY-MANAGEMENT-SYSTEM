import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Platform, Modal, ActivityIndicator, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { fetchMembers, createMember, updateMember, deleteMember, fetchMembershipPlans, assignMembership } from '../api';

export default function MembersScreen({ userRole, token }) {
    const { t } = useTranslation();
    const [members, setMembers] = useState([]);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    
    // Toast notification state
    const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ visible: true, message, type });
        setTimeout(() => setToast({ visible: false, message: '', type: 'success' }), 3000);
    };
    const [showAddModal, setShowAddModal] = useState(false);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [saving, setSaving] = useState(false);

    // Add/Edit Member form
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [editingMember, setEditingMember] = useState(null);

    const loadData = useCallback(async (isRefresh = false) => {
        try {
            if (!isRefresh) setLoading(true);
            setError(null);
            const [membersData, plansData] = await Promise.all([
                fetchMembers(token),
                fetchMembershipPlans(token),
            ]);
            setMembers(membersData || []);
            setPlans(plansData || []);
        } catch (e) {
            setError(e.message);
            showToast('Failed to load members', 'error');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [token]);

    const onRefresh = () => {
        setRefreshing(true);
        loadData(true);
    };

    useEffect(() => { loadData(); }, [loadData]);

    const handleAddOrUpdateMember = async () => {
        if (!newName || !newEmail) {
            showToast('Name and Email are required', 'warning');
            return;
        }
        try {
            setSaving(true);
            const memberData = { name: newName, email: newEmail, phone: newPhone };
            if (editingMember) {
                await updateMember(editingMember.id, memberData, token);
                showToast('Member updated successfully!', 'success');
            } else {
                await createMember(memberData, token);
                showToast('Member added successfully!', 'success');
            }
            setShowAddModal(false);
            setEditingMember(null);
            setNewName(''); setNewEmail(''); setNewPhone('');
            loadData();
        } catch (e) {
            showToast(editingMember ? 'Failed to update member' : 'Failed to add member', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteMember = async (id, name) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
        try {
            await deleteMember(id, token);
            showToast('Member deleted successfully!', 'success');
            loadData();
        } catch (e) {
            showToast('Failed to delete member', 'error');
        }
    };

    const handleAssignPlan = async (planId) => {
        try {
            setSaving(true);
            await assignMembership(selectedMember.id, planId, token);
            setShowPlanModal(false);
            setSelectedMember(null);
            await loadData();
        } catch (e) {
            showToast('Failed to assign plan: ' + e.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const openEditModal = (member) => {
        setEditingMember(member);
        setNewName(member.name);
        setNewEmail(member.email);
        setNewPhone(member.phone || '');
        setShowAddModal(true);
    };

    const filteredMembers = members.filter(m => 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        m.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading && !refreshing) {
        return (
            <View style={[styles.centered, { backgroundColor: '#0F172A' }]}>
                <ActivityIndicator size="large" color="#10B981" />
                <Text style={styles.loadingText}>Loading members...</Text>
            </View>
        );
    }

    if (error && !loading) {
        return (
            <View style={[styles.centered, { backgroundColor: '#0F172A' }]}>
                <MaterialIcons name="error-outline" size={48} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={[styles.retryBtn, { backgroundColor: '#4F46E5' }]} onPress={loadData}>
                    <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

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

            <View style={styles.topSection}>
                <View style={styles.searchBar}>
                    <MaterialIcons name="search" size={20} color="#64748B" />
                    <TextInput 
                        style={styles.searchInput} 
                        placeholder="Search members by name or email..." 
                        placeholderTextColor="#64748B" 
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <View style={styles.header}>
                    <Text style={styles.title}>Members & Memberships</Text>
                    <View style={styles.headerRight}>
                        <TouchableOpacity style={styles.refreshBtn} onPress={loadData}>
                            <MaterialIcons name="refresh" size={20} color="#94A3B8" />
                        </TouchableOpacity>
                        {userRole === 'admin' && (
                            <TouchableOpacity style={styles.addButton} onPress={() => { setEditingMember(null); setNewName(''); setNewEmail(''); setNewPhone(''); setShowAddModal(true); }}>
                                <MaterialIcons name="person-add" size={20} color="#fff" />
                                <Text style={styles.addText}>Add Member</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>

            <ScrollView 
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" colors={["#10B981"]} />
                }
            >
                {filteredMembers.length === 0 ? (
                    <View style={styles.centered}>
                        <MaterialIcons name="people" size={48} color="#334155" />
                        <Text style={styles.emptyText}>{searchQuery ? 'No members match your search' : 'No members yet'}</Text>
                    </View>
                ) : filteredMembers.map(member => (
                    <View key={member.id} style={styles.memberCard}>
                        <View style={styles.memberAvatar}>
                            <Text style={styles.avatarText}>{member.name.charAt(0).toUpperCase()}</Text>
                        </View>

                        <View style={styles.memberInfo}>
                            <Text style={styles.memberName}>{member.name}</Text>
                            <Text style={styles.memberEmail}>{member.email}</Text>
                            {member.phone && <Text style={styles.memberPhone}>{member.phone}</Text>}
                            <View style={styles.badgeRow}>
                                {member.membershipPlan ? (
                                    <View style={styles.badgePremium}>
                                        <Text style={styles.badgeText}>{member.membershipPlan.name} Plan</Text>
                                    </View>
                                ) : (
                                    <View style={styles.badgeNone}>
                                        <Text style={[styles.badgeText, { color: '#64748B' }]}>No Plan</Text>
                                    </View>
                                )}
                                {member.membershipExpiryDate && (
                                    <View style={styles.badgeExpiry}>
                                        <Text style={styles.badgeExpiryText}>Expires: {member.membershipExpiryDate}</Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {userRole === 'admin' && (
                            <View style={styles.memberActions}>
                                <TouchableOpacity
                                    style={styles.assignBtn}
                                    onPress={() => { setSelectedMember(member); setShowPlanModal(true); }}
                                >
                                    <MaterialIcons name="card-membership" size={16} color="#fff" />
                                    <Text style={styles.assignBtnText}>Plan</Text>
                                </TouchableOpacity>
                                <View style={styles.miniActionRow}>
                                    <TouchableOpacity style={styles.editBtn} onPress={() => openEditModal(member)}>
                                        <MaterialIcons name="edit" size={18} color="#94A3B8" />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteMember(member.id, member.name)}>
                                        <MaterialIcons name="delete-outline" size={18} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>
                ))}
            </ScrollView>

            {/* Add Member Modal */}
            {showAddModal && (
                <Modal transparent animationType="fade" visible>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>{editingMember ? 'Edit Member' : 'Add New Member'}</Text>
                                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                                    <MaterialIcons name="close" size={24} color="#F8FAFC" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Full Name *</Text>
                                <TextInput style={styles.input} placeholder="John Doe" placeholderTextColor="#64748B" value={newName} onChangeText={setNewName} />
                            </View>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Email *</Text>
                                <TextInput style={styles.input} placeholder="john@example.com" placeholderTextColor="#64748B" keyboardType="email-address" autoCapitalize="none" value={newEmail} onChangeText={setNewEmail} />
                            </View>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Phone (Optional)</Text>
                                <TextInput style={styles.input} placeholder="+1 234 567 890" placeholderTextColor="#64748B" keyboardType="phone-pad" value={newPhone} onChangeText={setNewPhone} />
                            </View>
                            <TouchableOpacity style={[styles.submitButton, saving && { opacity: 0.6 }]} onPress={handleAddOrUpdateMember} disabled={saving}>
                                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>{editingMember ? 'Update Member' : 'Save Member'}</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}

            {/* Assign Plan Modal */}
            {showPlanModal && selectedMember && (
                <Modal transparent animationType="fade" visible>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Assign Membership Plan</Text>
                                <TouchableOpacity onPress={() => { setShowPlanModal(false); setSelectedMember(null); }}>
                                    <MaterialIcons name="close" size={24} color="#F8FAFC" />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.planSubtitle}>Member: <Text style={{ color: '#818CF8' }}>{selectedMember.name}</Text></Text>
                            <View style={styles.plansGrid}>
                                {plans.map(plan => (
                                    <TouchableOpacity
                                        key={plan.id}
                                        style={styles.planCard}
                                        onPress={() => handleAssignPlan(plan.id)}
                                        disabled={saving}
                                    >
                                        <MaterialIcons name="card-membership" size={28} color="#10B981" />
                                        <Text style={styles.planName}>{plan.name}</Text>
                                        <Text style={styles.planPrice}>${plan.price}/mo</Text>
                                        <Text style={styles.planDetails}>{plan.durationMonths} months · {plan.maxBooksAllowed} books</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
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
    retryBtn: { backgroundColor: '#10B981', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
    retryText: { color: '#fff', fontWeight: '700' },
    topSection: { marginBottom: 20, gap: 16 },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', borderRadius: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: '#334155' },
    searchInput: { flex: 1, paddingVertical: 14, color: '#F8FAFC', fontSize: 16, ...Platform.select({ web: { outlineStyle: 'none' } }) },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#F8FAFC' },
    refreshBtn: { padding: 8, backgroundColor: '#1E293B', borderRadius: 8, borderWidth: 1, borderColor: '#334155' },
    addButton: { backgroundColor: '#4F46E5', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, gap: 8 },
    addText: { color: '#fff', fontWeight: '600' },
    listContainer: { gap: 16, paddingBottom: 40 },
    memberCard: { backgroundColor: '#1E293B', borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#334155', gap: 16 },
    memberAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#334155', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    avatarText: { fontSize: 22, fontWeight: 'bold', color: '#818CF8' },
    memberInfo: { flex: 1, gap: 4 },
    memberName: { fontSize: 18, fontWeight: '700', color: '#F8FAFC' },
    memberEmail: { fontSize: 14, color: '#94A3B8' },
    memberPhone: { fontSize: 14, color: '#64748B' },
    badgeRow: { flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' },
    badgePremium: { backgroundColor: 'rgba(245,158,11,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)' },
    badgeNone: { backgroundColor: '#1E293B', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#334155' },
    badgeExpiry: { backgroundColor: 'rgba(148,163,184,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#334155' },
    badgeText: { fontSize: 12, fontWeight: '600', color: '#F5A623' },
    badgeExpiryText: { fontSize: 12, fontWeight: '500', color: '#64748B' },
    memberActions: { flexDirection: 'column', gap: 10, alignItems: 'flex-end' },
    assignBtn: { backgroundColor: '#4F46E5', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, gap: 6 },
    assignBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
    miniActionRow: { flexDirection: 'row', gap: 8 },
    editBtn: { backgroundColor: 'rgba(148,163,184,0.1)', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(148,163,184,0.2)' },
    deleteBtn: { backgroundColor: 'rgba(239,68,68,0.1)', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { backgroundColor: '#1E293B', borderRadius: 16, padding: 30, width: '100%', maxWidth: 480, borderWidth: 1, borderColor: '#334155' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 22, fontWeight: '700', color: '#F8FAFC' },
    planSubtitle: { color: '#94A3B8', fontSize: 15, marginBottom: 20 },
    plansGrid: { gap: 12 },
    planCard: { backgroundColor: '#0F172A', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#334155', alignItems: 'center', gap: 8 },
    planName: { fontSize: 18, fontWeight: '700', color: '#F8FAFC' },
    planPrice: { fontSize: 22, fontWeight: '800', color: '#10B981' },
    planDetails: { fontSize: 13, color: '#64748B' },
    formGroup: { marginBottom: 16 },
    label: { color: '#E2E8F0', marginBottom: 8, fontSize: 14, fontWeight: '500' },
    input: { backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#334155', borderRadius: 10, padding: 16, color: '#F8FAFC', fontSize: 16, ...Platform.select({ web: { outlineStyle: 'none' } }) },
    submitButton: { backgroundColor: '#10B981', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 20 },
    submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
