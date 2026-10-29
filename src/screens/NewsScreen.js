import React from 'react';
import {
  View, Text, ScrollView, Image, StyleSheet,
  TouchableOpacity, Linking, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme';

const NEWS = [
  {
    id: 1,
    category: 'Health',
    categoryColor: colors.red,
    title: 'Heart Warriors Conducts Free Cardiac Screening in 10 Barangays',
    excerpt: 'The Heart Warriors program successfully conducted free cardiac screening for over 500 residents across 10 barangays this month.',
    date: 'May 14, 2026',
    image: require('../../assets/images/hw-cover.png'),
    url: 'https://heart-warriors.vercel.app',
  },
  {
    id: 2,
    category: 'PWD',
    categoryColor: '#e05c00',
    title: 'Wheels of Love Distributes 200 Wheelchairs to PWD Beneficiaries',
    excerpt: 'Two hundred persons with disabilities received brand-new wheelchairs from the Wheels of Love program during the latest distribution event.',
    date: 'May 10, 2026',
    image: require('../../assets/images/wol-cover.png'),
    url: 'https://wheels-of-love.vercel.app',
  },
  {
    id: 3,
    category: 'Dental',
    categoryColor: '#0077b6',
    title: 'Smile Bright Bago Reaches 5,000 Beneficiaries Milestone',
    excerpt: 'The Smile Bright Bago dental health program has now served over 5,000 residents since its launch, providing free dental care citywide.',
    date: 'May 5, 2026',
    image: require('../../assets/images/sbb-cover.png'),
    url: 'https://smile-bright-bago.vercel.app',
  },
  {
    id: 4,
    category: 'City News',
    categoryColor: colors.navy,
    title: 'Mayor Yao Leads Bago City Development Summit 2026',
    excerpt: 'Mayor Marina Mayette Javellana Yao presided over the annual development summit, outlining key infrastructure and social programs for 2026.',
    date: 'April 28, 2026',
    image: require('../../assets/images/bago-city-logo.png'),
    url: 'https://www.facebook.com/TheCitybridge',
  },
];

function NewsCard({ item }) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => Linking.openURL(item.url)}
      activeOpacity={0.8}
    >
      <Image source={item.image} style={styles.cardImage} resizeMode="cover" />
      <View style={styles.cardBody}>
        <View style={[styles.catBadge, { backgroundColor: item.categoryColor + '18' }]}>
          <Text style={[styles.catText, { color: item.categoryColor }]}>{item.category}</Text>
        </View>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardExcerpt} numberOfLines={2}>{item.excerpt}</Text>
        <View style={styles.cardFooter}>
          <Ionicons name="calendar-outline" size={12} color={colors.textMuted} />
          <Text style={styles.cardDate}>{item.date}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function NewsScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.heading}>Latest News</Text>
          <Text style={styles.subheading}>&amp; Updates</Text>
        </View>

        {/* Facebook follow */}
        <TouchableOpacity
          style={styles.fbBanner}
          onPress={() => Linking.openURL('https://www.facebook.com/TheCitybridge')}
          activeOpacity={0.8}
        >
          <Ionicons name="logo-facebook" size={20} color="#1877f2" />
          <Text style={styles.fbText}>Follow The Citybridge — Bago City Newsletter</Text>
          <Ionicons name="open-outline" size={16} color={colors.textMuted} />
        </TouchableOpacity>

        {/* News list */}
        {NEWS.map((item) => <NewsCard key={item.id} item={item} />)}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: colors.bg },
  scroll:     { flex: 1 },
  content:    { paddingBottom: 32 },

  header:     { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16 },
  heading:    { fontSize: 28, fontWeight: '900', color: colors.textPrimary },
  subheading: { fontSize: 28, fontWeight: '900', color: colors.red },

  fbBanner:   {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: radius.card, padding: 14,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  fbText:     { flex: 1, fontSize: 13, color: colors.textSecondary },

  card:       {
    marginHorizontal: 16, marginBottom: 14,
    backgroundColor: '#fff',
    borderRadius: radius.card,
    overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  cardImage:  { width: '100%', height: 160 },
  cardBody:   { padding: 16 },
  catBadge:   { alignSelf: 'flex-start', borderRadius: 50, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 8 },
  catText:    { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  cardTitle:  { fontSize: 15, fontWeight: '800', color: colors.textPrimary, lineHeight: 22, marginBottom: 6 },
  cardExcerpt:{ fontSize: 13, color: colors.textSecondary, lineHeight: 19, marginBottom: 10 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardDate:   { fontSize: 11, color: colors.textMuted },
});
