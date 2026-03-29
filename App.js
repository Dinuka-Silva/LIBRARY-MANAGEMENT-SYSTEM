import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import './i18n';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LoginScreen from './components/LoginScreen';
import BooksScreen from './components/BooksScreen';
import MembersScreen from './components/MembersScreen';
import BorrowScreen from './components/BorrowScreen';
import DonationsScreen from './components/DonationsScreen';
import PaymentsScreen from './components/PaymentsScreen';
import OnboardingScreen from './components/OnboardingScreen';
import IntroductionScreen from './components/IntroductionScreen';
import LotteryScreen from './components/LotteryScreen';
import LotteryPrizes from './components/LotteryPrizes';
import SearchBar from './components/SearchBar';
import NotificationBell from './components/NotificationBell';
import { fetchStats } from './api';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { ThemeProvider, useTheme } from './ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

function AppContent() {
  const { theme, toggleTheme, isDarkMode } = useTheme();
  const { t, i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState('en');

  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);   // 'admin' or 'user'
  const [authToken, setAuthToken] = useState(null);

  // Navigation State
  const [activeTab, setActiveTab] = useState('home');
  const [showLottery, setShowLottery] = useState(false);
  const [showLotteryPrizes, setShowLotteryPrizes] = useState(false);

  // Dashboard Stats
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showIntroduction, setShowIntroduction] = useState(true);

   const [memberId, setMemberId] = useState(null);
   const [userName, setUserName] = useState(null);

  const handleLogin = (role, token, mId, name) => {
    setUserRole(role);
    setAuthToken(token);
    setMemberId(mId);
    setUserName(name);
    setIsLoggedIn(true);
    setActiveTab('home');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setAuthToken(null);
    setMemberId(null);
    setUserName(null);
    setStats(null);
  };

  const loadStats = useCallback(async () => {
    if (!authToken) return;
    try {
      setStatsLoading(true);
      const data = await fetchStats(authToken);
      setStats(data);
    } catch (e) {
      console.warn('Stats fetch failed:', e.message);
    } finally {
      setStatsLoading(false);
    }
  }, [authToken]);

  // Load stats on login and when returning to home
  useEffect(() => {
    if (isLoggedIn && authToken && activeTab === 'home') {
      loadStats();
    }
  }, [isLoggedIn, authToken, activeTab, loadStats]);

  const toggleLanguage = () => {
    if (currentLang === 'en') {
      i18n.changeLanguage('si');
      setCurrentLang('si');
    } else if (currentLang === 'si') {
      i18n.changeLanguage('ta');
      setCurrentLang('ta');
    } else {
      i18n.changeLanguage('en');
      setCurrentLang('en');
    }
  };

  if (!isLoggedIn) {
    if (showIntroduction) {
      return <IntroductionScreen onGetStarted={() => setShowIntroduction(false)} />;
    }
    
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.langHeader}>
          <TouchableOpacity onPress={toggleLanguage} style={styles.langBtn}>
            <MaterialIcons name="language" size={24} color="#ffffff" />
            <Text style={styles.langText}>{currentLang.toUpperCase()}</Text>
          </TouchableOpacity>
        </View>
        {showLottery ? (
          <LotteryScreen 
            onClose={() => setShowLottery(false)} 
            authToken={authToken}
            userRole={userRole}
          />
        ) : showLotteryPrizes ? (
          <LotteryPrizes onBack={() => setShowLotteryPrizes(false)} />
        ) : (
          <LoginScreen 
            onLogin={handleLogin} 
            onShowLottery={() => setShowLotteryPrizes(true)}
          />
        )}
      </SafeAreaView>
    );
  }

  if (showOnboarding) {
    return <OnboardingScreen onFinish={() => setShowOnboarding(false)} />;
  }

  const NAV_ITEMS = [
    { key: 'home',    label: t('home'),    icon: 'dashboard',         adminOnly: false },
    { key: 'books',   label: t('books'),   icon: 'library-books',     adminOnly: false },
    { key: 'borrow',  label: t('borrow'),  icon: 'compare-arrows',    adminOnly: false },
    { key: 'lottery', label: t('lottery'), icon: 'casino',            adminOnly: false },
    { key: 'members', label: t('members'), icon: 'people',            adminOnly: true  },
    { key: 'donations', label: t('donations'), icon: 'volunteer-activism', adminOnly: false },
    { key: 'payments',  label: t('payments'),  icon: 'payment',           adminOnly: true  },
  ].filter(item => !item.adminOnly || userRole === 'admin');

  const renderContent = () => {
    const screenProps = { userRole, token: authToken, memberId, userName };
    switch (activeTab) {
      case 'books':     return <BooksScreen {...screenProps} />;
      case 'members':   return <MembersScreen {...screenProps} />;
      case 'borrow':    return <BorrowScreen {...screenProps} />;
      case 'lottery':   return <LotteryScreen onClose={() => setActiveTab('home')} authToken={authToken} userRole={userRole} />;
      case 'donations': return <DonationsScreen token={authToken} />;
      case 'payments':  return <PaymentsScreen token={authToken} />;
      case 'home':
      default:
        return (
          <>
            <LinearGradient
              colors={theme.gradient1}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.welcomeCard}
            >
              <MaterialIcons name="local-library" size={48} color="rgba(255,255,255,0.9)" style={{ marginBottom: 12 }} />
              <Text style={styles.welcomeTitle}>{t('welcome')}</Text>
              <Text style={styles.welcomeSub}>
                Antigravity Library System · {t('loggedInAs')}: <Text style={{ color: '#E0E7FF', fontWeight: '700' }}>{userRole === 'admin' ? t('adminRole') : t('userRole')}</Text>
              </Text>
            </LinearGradient>

            <Text style={styles.sectionLabel}>{t('liveOverview')}</Text>
            {statsLoading ? (
              <View style={styles.statsLoading}>
                <ActivityIndicator color="#4F46E5" size="large" />
                <Text style={{ color: '#64748B', marginTop: 8 }}>{t('fetchingStats')}</Text>
              </View>
            ) : (
              <View style={styles.statsGrid}>
                <StatCard icon="menu-book"       color="#4F46E5" value={stats?.totalBooks ?? '—'}      label={t('totalBooks')} />
                <StatCard icon="people-alt"      color="#10B981" value={stats?.totalMembers ?? '—'}    label={t('activeMembers')} />
                <StatCard icon="compare-arrows"  color="#818CF8" value={stats?.activeBorrows ?? '—'}   label={t('borrowedBooks')} />
                <StatCard icon="today"           color="#EC4899" value={stats?.borrowedToday ?? '—'}   label={t('overdueBooks')} />
                <StatCard icon="volunteer-activism" color="#F59E0B" value={stats ? `$${Number(stats.totalDonations).toFixed(0)}` : '—'} label={t('donations')} />
                <StatCard icon="payments"        color="#14B8A6" value={stats ? `$${Number(stats.totalRevenue).toFixed(0)}` : '—'} label={t('payments')} />
              </View>
            )}

            {userRole === 'admin' && stats?.popularBooks?.length > 0 && (
              <View style={styles.analyticsSection}>
                <Text style={styles.sectionLabel}>{t('popularBooks')}</Text>
                <View style={styles.chartContainer}>
                  <BarChart
                    data={{
                      labels: stats.popularBooks.map(b => b.title.substring(0, 10) + (b.title.length > 10 ? '..' : '')),
                      datasets: [{ data: stats.popularBooks.map(b => b.count) }]
                    }}
                    width={Dimensions.get('window').width > 800 ? 600 : Dimensions.get('window').width - 60}
                    height={220}
                    yAxisLabel=""
                    chartConfig={{
                      backgroundColor: '#1E293B',
                      backgroundGradientFrom: '#1E293B',
                      backgroundGradientTo: '#1E293B',
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(129, 140, 248, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
                      style: { borderRadius: 16 },
                      propsForDots: { r: '6', strokeWidth: '2', stroke: '#ffa726' }
                    }}
                    style={{ marginVertical: 8, borderRadius: 16 }}
                  />
                </View>
              </View>
            )}

            <View style={styles.recommendationsSection}>
              <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>{t('trendingThisWeek')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingScroll}>
                {stats?.popularBooks?.map((book, idx) => (
                  <View key={idx} style={[styles.trendingCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    {/* Rank Badge */}
                    <View style={[styles.trendingRank, { backgroundColor: theme.accent }]}>
                      <Text style={styles.rankText}>#{idx + 1}</Text>
                      <MaterialIcons name="star" size={10} color="#FBBF24" style={{marginLeft: 2}} />
                    </View>
                    
                    {/* Book Cover Placeholder */}
                    <View style={[styles.bookCover, { backgroundColor: theme.background }]}>
                      <MaterialIcons name="auto-stories" size={40} color={theme.accent + '80'} />
                      <View style={styles.coverOverlay} />
                    </View>

                    {/* Content Section */}
                    <View style={styles.trendingContent}>
                      <Text style={[styles.trendingTitle, { color: theme.textPrimary }]} numberOfLines={2}>{book.title}</Text>
                      <View style={styles.trendingMeta}>
                        <View style={[styles.fireBadge, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                          <MaterialIcons name="local-fire-department" size={14} color={theme.error} />
                          <Text style={[styles.trendingCount, { color: theme.error }]}>{book.count} Borrows</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
                {(!stats?.popularBooks || stats.popularBooks.length === 0) && (
                  <Text style={[styles.emptyText, { color: theme.textMuted }]}>{t('noTrending')}</Text>
                )}
              </ScrollView>
            </View>

            {userRole === 'admin' && (
              <View style={styles.analyticsSection}>
                <Text style={styles.sectionLabel}>{t('borrowingTrends') ?? 'Borrowing Trends'}</Text>
                <View style={styles.chartContainer}>
                  <LineChart
                    data={{
                      labels: stats?.borrowsPerMonth?.map(m => m.month) || ['No Data'],
                      datasets: [{ data: stats?.borrowsPerMonth?.map(m => m.count) || [0] }]
                    }}
                    width={Dimensions.get('window').width > 800 ? 600 : Dimensions.get('window').width - 60}
                    height={220}
                    chartConfig={{
                      backgroundColor: '#1E293B',
                      backgroundGradientFrom: '#1E293B',
                      backgroundGradientTo: '#1E293B',
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
                      style: { borderRadius: 16 },
                      propsForDots: { r: '6', strokeWidth: '2', stroke: '#10B981' }
                    }}
                    bezier
                    style={{ marginVertical: 8, borderRadius: 16 }}
                  />
                </View>
              </View>
            )}

            {userRole === 'admin' && stats?.revenueBreakdown?.length > 0 && (
              <View style={styles.analyticsSection}>
                <Text style={styles.sectionLabel}>{t('revenueByType') ?? 'Revenue by Type'}</Text>
                <View style={[styles.chartContainer, { flexDirection: Dimensions.get('window').width > 800 ? 'row' : 'column', justifyContent: 'center' }]}>
                  <PieChart
                    data={stats.revenueBreakdown.map((r, i) => ({
                      name: r.name,
                      total: r.total,
                      color: r.color,
                      legendFontColor: theme.textSecondary,
                      legendFontSize: 14
                    }))}
                    width={Dimensions.get('window').width > 800 ? 600 : Dimensions.get('window').width - 60}
                    height={220}
                    chartConfig={{
                      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    }}
                    accessor="total"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute
                  />
                </View>
              </View>
            )}

            {userRole === 'admin' && stats?.recentBooks?.length > 0 && (
              <View style={styles.analyticsSection}>
                <Text style={styles.sectionLabel}>{t('recentBooks') ?? 'Recently Added Books'}</Text>
                <View style={styles.recentBooksContainer}>
                  {stats.recentBooks.map((b, i) => (
                    <View key={i} style={[styles.recentBookCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                      <View style={[styles.recentBookIconBox, { backgroundColor: theme.accent + '20' }]}>
                        <MaterialIcons name="auto-stories" size={24} color={theme.accentLight} />
                      </View>
                      <View style={styles.recentBookInfo}>
                        <Text style={[styles.recentBookTitle, { color: theme.textPrimary }]} numberOfLines={1}>{b.title}</Text>
                        <Text style={[styles.recentBookAuthor, { color: theme.textSecondary }]}>{b.author} • {b.category}</Text>
                      </View>
                      <View style={[styles.recentBadge, { backgroundColor: theme.success + '20' }]}>
                        <Text style={[styles.recentBadgeText, { color: theme.success }]}>New</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {userRole === 'admin' && stats?.categoryDistribution?.length > 0 && (
              <View style={styles.analyticsSection}>
                <Text style={styles.sectionLabel}>{t('categoryDistribution') ?? 'Books by Category'}</Text>
                <View style={styles.chartContainer}>
                  <PieChart
                    data={stats.categoryDistribution.map((c, i) => ({
                      name: c.name,
                      count: c.count,
                      color: ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][i % 5],
                      legendFontColor: theme.textSecondary,
                      legendFontSize: 12
                    }))}
                    width={Dimensions.get('window').width > 800 ? 600 : Dimensions.get('window').width - 60}
                    height={220}
                    chartConfig={{
                      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    }}
                    accessor="count"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute
                  />
                </View>
              </View>
            )}

            {userRole === 'admin' && stats?.memberActivity?.length > 0 && (
              <View style={styles.analyticsSection}>
                <Text style={styles.sectionLabel}>{t('topMembers') ?? 'Top Active Members'}</Text>
                <View style={styles.memberList}>
                  {stats.memberActivity.map((m, i) => (
                    <View key={i} style={[styles.memberItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                      <View style={[styles.memberRank, { backgroundColor: theme.accent + '20' }]}>
                        <Text style={[styles.rankText, { color: theme.accentLight }]}>{i + 1}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.memberName, { color: theme.textPrimary }]}>{m.name}</Text>
                        <Text style={[styles.memberCount, { color: theme.textSecondary }]}>{m.count} {t('borrows') ?? 'Borrows'}</Text>
                      </View>
                      <MaterialIcons name="trending-up" size={20} color={theme.success} />
                    </View>
                  ))}
                </View>
              </View>
            )}

            {userRole === 'admin' && stats?.financialHistory?.length > 0 && (
              <View style={styles.analyticsSection}>
                <Text style={styles.sectionLabel}>{t('financialSummary') ?? 'Financial Performance'}</Text>
                <View style={styles.chartContainer}>
                  <BarChart
                    data={{
                      labels: stats.financialHistory.map(f => f.month),
                      datasets: [
                        { data: stats.financialHistory.map(f => f.donations), color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})` },
                        { data: stats.financialHistory.map(f => f.payments), color: (opacity = 1) => `rgba(20, 184, 166, ${opacity})` }
                      ],
                      legend: [t('donations') ?? 'Donations', t('payments') ?? 'Payments']
                    }}
                    width={Dimensions.get('window').width > 800 ? 600 : Dimensions.get('window').width - 60}
                    height={220}
                    chartConfig={{
                      backgroundColor: '#1E293B',
                      backgroundGradientFrom: '#1E293B',
                      backgroundGradientTo: '#1E293B',
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(163, 163, 163, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
                      style: { borderRadius: 16 }
                    }}
                    style={{ marginVertical: 8, borderRadius: 16 }}
                  />
                </View>
              </View>
            )}

            <View style={styles.quickActions}>
              <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>{t('quickActions')}</Text>
              <View style={styles.actionsRow}>
                <TouchableOpacity style={[styles.actionCard, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => setActiveTab('books')}>
                  <MaterialIcons name="library-books" size={28} color={theme.accent} />
                  <Text style={[styles.actionLabel, { color: theme.textSecondary }]}>{t('browseBooks')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionCard, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => setActiveTab('borrow')}>
                  <MaterialIcons name="compare-arrows" size={28} color={theme.accentLight} />
                  <Text style={[styles.actionLabel, { color: theme.textSecondary }]}>{t('borrowReturn')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionCard, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => setActiveTab('donations')}>
                  <MaterialIcons name="volunteer-activism" size={28} color={theme.warning} />
                  <Text style={[styles.actionLabel, { color: theme.textSecondary }]}>{t('donateAction')}</Text>
                </TouchableOpacity>
                {userRole === 'admin' && (
                  <TouchableOpacity style={[styles.actionCard, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => setActiveTab('members')}>
                    <MaterialIcons name="people" size={28} color={theme.success} />
                    <Text style={[styles.actionLabel, { color: theme.textSecondary }]}>{t('manageMembers')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

          </>
        );
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <View style={styles.headerLeft}>
            <MaterialIcons name="local-library" size={28} color={theme.accent} />
            <Text style={[styles.logo, { color: theme.textPrimary }]}>{t('title')}</Text>
          </View>
          
          {/* Search Bar - Only on web/larger screens */}
          {Platform.OS === 'web' && (
            <View style={styles.headerCenter}>
              <SearchBar onSearch={(text) => console.log('Search:', text)} />
            </View>
          )}
          
          <View style={styles.headerRight}>
            <NotificationBell />
            <TouchableOpacity onPress={loadStats} style={styles.iconBtn}>
              <MaterialIcons name="refresh" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleTheme} style={styles.iconBtn}>
              <MaterialIcons name={isDarkMode ? 'light-mode' : 'dark-mode'} size={20} color={theme.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleLanguage} style={styles.langBtn}>
              <MaterialIcons name="language" size={20} color={theme.textPrimary} />
              <Text style={[styles.langText, { color: theme.textPrimary }]}>{currentLang.toUpperCase()}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
              <Text style={styles.logoutText}>{t('logout')}</Text>
              <MaterialIcons name="logout" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sidebar + Content */}
        <View style={styles.body}>
          <View style={[styles.sidebar, { backgroundColor: theme.surface, borderRightColor: theme.border }]}>
            {NAV_ITEMS.map(item => (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.navItem, 
                  activeTab === item.key && { backgroundColor: theme.surfaceSelected, borderColor: theme.accent + '4D', borderWidth: 1 }
                ]}
                onPress={() => setActiveTab(item.key)}
              >
                <MaterialIcons 
                  name={item.icon} 
                  size={22} 
                  color={activeTab === item.key ? theme.accentLight : theme.textSecondary} 
                />
                <Text style={[
                  styles.navText, 
                  { color: activeTab === item.key ? theme.accentLight : theme.textSecondary, fontWeight: activeTab === item.key ? '700' : '500' }
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Main Content */}
          <ScrollView contentContainerStyle={[styles.mainContent, { backgroundColor: theme.background }]}>
            {renderContent()}
          </ScrollView>
        </View>

        <StatusBar style="light" />
      </View>
    </SafeAreaView>
  );
}

function StatCard({ icon, color, value, label }) {
  const { theme } = useTheme();
  return (
    <View style={[cardStyles.card, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
      <View style={[cardStyles.iconWrap, { backgroundColor: color + '20' }]}>
        <MaterialIcons name={icon} size={32} color={color} />
      </View>
      <Text style={[cardStyles.value, { color: theme.textPrimary }]}>{value}</Text>
      <Text style={[cardStyles.label, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 170,
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  value: {
    fontSize: 36,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -1,
  },
  label: {
    fontSize: 13,
    color: '#64748B',
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0F172A' },
  langHeader: { flexDirection: 'row', justifyContent: 'flex-end', padding: 20, backgroundColor: '#0F172A' },
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 18,
    backgroundColor: '#1E293B',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    gap: 20,
    ...Platform.select({ web: { position: 'sticky', top: 0, zIndex: 10 } }),
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  headerCenter: { flex: 1, maxWidth: 500, alignItems: 'center' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: { fontSize: 22, fontWeight: '800', color: '#F8FAFC', letterSpacing: 0.5 },
  iconBtn: { padding: 10, borderRadius: 10 },
  langBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#334155', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, gap: 6 },
  langText: { color: '#F8FAFC', fontWeight: '600', fontSize: 13 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  logoutText: { color: '#EF4444', fontWeight: '700', fontSize: 14 },
  body: { flex: 1, flexDirection: Platform.OS === 'web' ? 'row' : 'column' },
  sidebar: {
    width: Platform.OS === 'web' ? 230 : '100%',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRightWidth: Platform.OS === 'web' ? 1 : 0,
    borderRightColor: '#334155',
  },
  navItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 12, borderRadius: 10, marginBottom: 4, gap: 12 },
  navItemActive: { backgroundColor: 'rgba(79,70,229,0.15)', borderWidth: 1, borderColor: 'rgba(79,70,229,0.3)' },
  navText: { color: '#94A3B8', fontSize: 15, fontWeight: '500' },
  navTextActive: { color: '#818CF8', fontSize: 15, fontWeight: '700' },
  mainContent: { flexGrow: 1, padding: 28, ...Platform.select({ web: { minHeight: '100vh' } }) },
  welcomeCard: {
    padding: 36,
    borderRadius: 24,
    marginBottom: 32,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  welcomeTitle: { fontSize: 32, fontWeight: '800', color: '#ffffff', marginBottom: 10, letterSpacing: -0.5 },
  welcomeSub: { fontSize: 16, color: '#E0E7FF', opacity: 0.95, lineHeight: 24 },
  sectionLabel: { fontSize: 13, color: '#64748B', textTransform: 'uppercase', fontWeight: '700', letterSpacing: 1, marginBottom: 14 },
  statsLoading: { alignItems: 'center', paddingVertical: 40 },
  statsGrid: { flexDirection: 'row', gap: 16, flexWrap: 'wrap', marginBottom: 32 },
  quickActions: { marginTop: 4 },
  actionsRow: { flexDirection: 'row', gap: 14, flexWrap: 'wrap' },
  actionCard: {
    backgroundColor: '#1E293B',
    flex: 1,
    minWidth: 140,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    gap: 12,
  },
  actionLabel: { color: '#94A3B8', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  analyticsSection: { marginTop: 24, marginBottom: 32 },
  chartContainer: { backgroundColor: '#1E293B', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#334155', alignItems: 'center' },
  memberList: { gap: 12 },
  memberItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, gap: 16 },
  memberRank: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  rankText: { fontSize: 16, fontWeight: '700' },
  memberName: { fontSize: 16, fontWeight: '600' },
  memberCount: { fontSize: 13 },
  // Trending Section New Styles
  recommendationsSection: { marginTop: 24, marginBottom: 32 },
  trendingScroll: { paddingVertical: 12, paddingHorizontal: 4, gap: 16 },
  trendingCard: {
    width: 200,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    paddingTop: 24,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  trendingRank: {
    position: 'absolute',
    top: -12,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 2,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  rankText: { color: '#ffffff', fontWeight: '800', fontSize: 13 },
  bookCover: {
    height: 140,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
  },
  trendingContent: { flex: 1, justifyContent: 'space-between' },
  trendingTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, lineHeight: 22 },
  trendingMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fireBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  trendingCount: { fontSize: 13, fontWeight: '700' },
  // Recent Books Styles
  recentBooksContainer: { gap: 12 },
  recentBookCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, gap: 16 },
  recentBookIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  recentBookInfo: { flex: 1, gap: 4 },
  recentBookTitle: { fontSize: 16, fontWeight: '700' },
  recentBookAuthor: { fontSize: 13 },
  recentBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  recentBadgeText: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase' }
});
