import React, { useState } from 'react';
import {
  View, Text, ScrollView, Image, StyleSheet,
  TouchableOpacity, Linking, TextInput,
  StatusBar, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme';

const { width } = Dimensions.get('window');

// ── Service grid items ──────────────────────────────────────────────
const SERVICES = [
  { icon: 'desktop-outline',     label: 'E-Services',            screen: 'Services' },
  { icon: 'medkit-outline',      label: 'Health Services',       screen: 'Programs' },
  { icon: 'car-outline',         label: 'Asenso Caravan',        url: 'https://asenso-caravan.vercel.app' },
  { icon: 'airplane-outline',    label: 'Tourism',               url: null },
  { icon: 'warning-outline',     label: 'Emergency',             url: 'tel:911' },
  { icon: 'eye-outline',         label: 'Transparency',          url: null },
  { icon: 'document-text-outline',label: 'Resolutions &\nOrdinances', url: null },
  { icon: 'information-circle-outline', label: 'About Bago',     screen: 'About' },
];

// ── News items ──────────────────────────────────────────────────────
const NEWS = [
  {
    id: 1,
    title: 'Heart Warriors Conducts Free Cardiac Screening',
    date: 'May 14, 2026',
    image: require('../../assets/images/hw-cover.png'),
    url: 'https://heart-warriors.vercel.app',
  },
  {
    id: 2,
    title: 'Wheels of Love Distributes 200 Wheelchairs',
    date: 'May 10, 2026',
    image: require('../../assets/images/wol-cover.png'),
    url: 'https://wheels-of-love.vercel.app',
  },
  {
    id: 3,
    title: 'Smile Bright Bago Reaches 5,000 Beneficiaries',
    date: 'May 5, 2026',
    image: require('../../assets/images/sbb-cover.png'),
    url: 'https://smile-bright-bago.vercel.app',
  },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Maayong Aga,';
  if (h < 18) return 'Maayong Hapon,';
  return 'Maayong Gabi,';
}

function ServiceIcon({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.serviceItem} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.serviceIconBox}>
        <Ionicons name={item.icon} size={28} color="#fff" />
      </View>
      <Text style={styles.serviceLabel}>{item.label}</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const [search, setSearch] = useState('');

  const handleService = (item) => {
    if (item.url) { Linking.openURL(item.url); return; }
    if (item.screen) { navigation.navigate(item.screen); }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Top Bar ── */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.greetingSub}>Bagonhon</Text>
          </View>
          <View style={styles.topRight}>
            <Text style={styles.appName}>Asenso{'\n'}
              <Text style={styles.appNameGold}>Bago</Text>
            </Text>
          </View>
        </View>

        {/* ── Search Bar ── */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for a Service..."
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* ── Services Grid ── */}
        <View style={styles.servicesGrid}>
          {SERVICES.map((item) => (
            <ServiceIcon
              key={item.label}
              item={item}
              onPress={() => handleService(item)}
            />
          ))}
        </View>

        {/* ── CTA Banner ── */}
        <View style={styles.ctaBanner}>
          <View style={styles.ctaLeft}>
            <Text style={styles.ctaTitle}>Bago City, at your fingertips</Text>
            <Text style={styles.ctaDesc}>
              Sign up to access a full suite of digital government services designed for{' '}
              <Text style={{ fontWeight: '700' }}>Bagonhons</Text>
            </Text>
            <TouchableOpacity style={styles.ctaBtn} activeOpacity={0.85}>
              <Text style={styles.ctaBtnText}>Create an Account</Text>
            </TouchableOpacity>
          </View>
          <Image
            source={require('../../assets/images/bago-city-logo.png')}
            style={styles.ctaImage}
            resizeMode="contain"
          />
        </View>

        {/* ── Latest News ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Latest News &amp; Updates</Text>
          <TouchableOpacity onPress={() => navigation.navigate('News')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.newsRow}
        >
          {NEWS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.newsCard}
              onPress={() => Linking.openURL(item.url)}
              activeOpacity={0.8}
            >
              <Image source={item.image} style={styles.newsImage} resizeMode="cover" />
              <View style={styles.newsBody}>
                <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.newsDate}>{item.date}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Programs Quick Access ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Health Programs</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Programs')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.programsRow}>
          {[
            { name: 'Heart Warriors', logo: require('../../assets/images/hw-logo.png'), color: colors.red, url: 'https://heart-warriors.vercel.app' },
            { name: 'Wheels of Love', logo: require('../../assets/images/wol-logo.png'), color: '#e05c00', url: 'https://wheels-of-love.vercel.app' },
            { name: 'Smile Bright',   logo: require('../../assets/images/sbb-logo.png'), color: '#0077b6', url: 'https://smile-bright-bago.vercel.app' },
          ].map((p) => (
            <TouchableOpacity
              key={p.name}
              style={styles.programChip}
              onPress={() => Linking.openURL(p.url)}
              activeOpacity={0.8}
            >
              <Image source={p.logo} style={styles.programChipLogo} />
              <Text style={styles.programChipName}>{p.name}</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:     { flex: 1, backgroundColor: colors.bg },
  scroll:   { flex: 1 },
  content:  { paddingBottom: 32 },

  // Top bar
  topBar:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  greeting:     { fontSize: 22, fontWeight: '800', color: colors.textPrimary, lineHeight: 28 },
  greetingSub:  { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
  topRight:     { alignItems: 'flex-end' },
  appName:      { fontSize: 22, fontWeight: '900', color: colors.red, fontStyle: 'italic', textAlign: 'right', lineHeight: 26 },
  appNameGold:  { color: colors.gold },

  // Search
  searchRow:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 24, gap: 10 },
  searchBox:    { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 10, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  searchInput:  { flex: 1, fontSize: 14, color: colors.textPrimary },
  notifBtn:     { width: 44, height: 44, backgroundColor: '#fff', borderRadius: 22, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },

  // Services grid
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, marginBottom: 20, gap: 4 },
  serviceItem:  { width: (width - 32) / 4, alignItems: 'center', paddingVertical: 10 },
  serviceIconBox: { width: 60, height: 60, borderRadius: radius.icon, backgroundColor: colors.red, alignItems: 'center', justifyContent: 'center', marginBottom: 8, shadowColor: colors.red, shadowOpacity: 0.35, shadowRadius: 8, elevation: 4 },
  serviceLabel: { fontSize: 11, color: colors.textSecondary, textAlign: 'center', lineHeight: 15 },

  // CTA Banner
  ctaBanner:    { marginHorizontal: 16, marginBottom: 24, backgroundColor: colors.navy, borderRadius: radius.card, padding: 20, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  ctaLeft:      { flex: 1 },
  ctaTitle:     { fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: 6 },
  ctaDesc:      { fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 18, marginBottom: 14 },
  ctaBtn:       { backgroundColor: '#fff', borderRadius: radius.btn, paddingVertical: 10, paddingHorizontal: 20, alignSelf: 'stretch', alignItems: 'center' },
  ctaBtnText:   { fontSize: 13, fontWeight: '700', color: colors.navy },
  ctaImage:     { width: 70, height: 70, opacity: 0.25, marginLeft: 10 },

  // Section header
  sectionHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  seeAll:       { fontSize: 13, color: colors.red, fontWeight: '600' },

  // News
  newsRow:      { paddingLeft: 20, paddingRight: 8, marginBottom: 24 },
  newsCard:     { width: 200, backgroundColor: '#fff', borderRadius: radius.card, marginRight: 12, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  newsImage:    { width: '100%', height: 110 },
  newsBody:     { padding: 12 },
  newsTitle:    { fontSize: 13, fontWeight: '700', color: colors.textPrimary, lineHeight: 18, marginBottom: 4 },
  newsDate:     { fontSize: 11, color: colors.textMuted },

  // Programs
  programsRow:  { paddingHorizontal: 16, gap: 10, marginBottom: 8 },
  programChip:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: radius.card, padding: 14, gap: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  programChipLogo: { width: 36, height: 36, borderRadius: 18 },
  programChipName: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.textPrimary },
});
