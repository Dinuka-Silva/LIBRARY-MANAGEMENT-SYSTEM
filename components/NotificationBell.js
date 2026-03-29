import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, ScrollView, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../ThemeContext';

export default function NotificationBell({ notifications = [] }) {
  const { theme } = useTheme();
  const [showModal, setShowModal] = useState(false);
  
  // Sample notifications - in real app, these would come from props
  const sampleNotifications = notifications.length > 0 ? notifications : [
    {
      id: 1,
      type: 'success',
      icon: 'check-circle',
      title: 'Book Returned',
      message: 'You successfully returned "The Great Gatsby"',
      time: '2 hours ago',
      read: false,
    },
    {
      id: 2,
      type: 'warning',
      icon: 'warning',
      title: 'Due Date Reminder',
      message: '3 books are due in 2 days',
      time: '5 hours ago',
      read: false,
    },
    {
      id: 3,
      type: 'info',
      icon: 'info',
      title: 'New Books Available',
      message: '15 new books added to the library',
      time: '1 day ago',
      read: true,
    },
  ];

  const unreadCount = sampleNotifications.filter(n => !n.read).length;

  const getIconColor = (type) => {
    switch (type) {
      case 'success': return theme.success;
      case 'warning': return theme.warning;
      case 'error': return theme.error;
      case 'info': return theme.info;
      default: return theme.accent;
    }
  };

  return (
    <>
      <TouchableOpacity 
        style={[styles.bellButton, { backgroundColor: theme.surface }]} 
        onPress={() => setShowModal(true)}
      >
        <MaterialIcons name="notifications" size={22} color={theme.textPrimary} />
        {unreadCount > 0 && (
          <View style={[styles.badge, { backgroundColor: theme.error }]}>
            <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowModal(false)}
        >
          <View 
            style={[styles.modalContent, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onStartShouldSetResponder={() => true}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.headerLeft}>
                <MaterialIcons name="notifications" size={24} color={theme.accent} />
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Notifications</Text>
              </View>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <MaterialIcons name="close" size={24} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Notifications List */}
            <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
              {sampleNotifications.map((notification) => (
                <View 
                  key={notification.id} 
                  style={[
                    styles.notificationItem,
                    { 
                      backgroundColor: notification.read ? 'transparent' : theme.surfaceSelected,
                      borderColor: theme.borderLight,
                    }
                  ]}
                >
                  <View style={[styles.iconBox, { backgroundColor: getIconColor(notification.type) + '20' }]}>
                    <MaterialIcons 
                      name={notification.icon} 
                      size={24} 
                      color={getIconColor(notification.type)} 
                    />
                  </View>
                  <View style={styles.notificationContent}>
                    <Text style={[styles.notificationTitle, { color: theme.textPrimary }]}>
                      {notification.title}
                    </Text>
                    <Text style={[styles.notificationMessage, { color: theme.textSecondary }]}>
                      {notification.message}
                    </Text>
                    <Text style={[styles.notificationTime, { color: theme.textMuted }]}>
                      {notification.time}
                    </Text>
                  </View>
                  {!notification.read && (
                    <View style={[styles.unreadDot, { backgroundColor: theme.accent }]} />
                  )}
                </View>
              ))}
            </ScrollView>

            {/* Footer */}
            <View style={[styles.modalFooter, { borderTopColor: theme.border }]}>
              <TouchableOpacity style={styles.footerButton}>
                <Text style={[styles.footerButtonText, { color: theme.accent }]}>Mark all as read</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bellButton: {
    position: 'relative',
    padding: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  notificationsList: {
    maxHeight: 400,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    position: 'relative',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
    gap: 4,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    marginTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    top: 20,
    right: 16,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  footerButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  footerButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
