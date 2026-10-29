import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, StatusBar, Dimensions, ScrollView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing, fonts } from '../theme';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;
const isDesktop = width >= 1024;

export default function SplashScreen({ navigation }) {
  // Service categories data
  const serviceCategories = [
    { icon: '🏥', label: 'Health Programs', color: '#C96827' },
    { icon: '🏝️', label: 'Tourism', color: '#F3A15D' },
    { icon: '📰', label: 'City News', color: '#C96827' },
    { icon: '🏛️', label: 'City Services', color: '#F3A15D' },
  ];

  // Desktop/Tablet split-screen layout
  if (isDesktop || isTablet) {
    return (
      <View style={styles.desktopContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
        
        {/* LEFT PANEL - Warm Ivory Background */}
        <View style={styles.leftPanel}>
          <ScrollView 
            contentContainerStyle={styles.leftContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Logos grouped together */}
            <View style={styles.logosContainer}>
              <Image
                source={require('../../assets/images/bago-city-logo.png')}
                style={styles.cityLogo}
                resizeMode="contain"
              />
              <Image
                source={require('../../assets/images/mayora-logo.png')}
                style={styles.mayoraLogo}
                resizeMode="contain"
              />
            </View>

            {/* City Identity */}
            <View style={styles.cityIdentity}>
              <Text style={styles.cityName}>City of Bago</Text>
              <Text style={styles.cityLocation}>NEGROS OCCIDENTAL, PHILIPPINES</Text>
            </View>

            {/* Tagline */}
            <Text style={styles.leftTagline}>
              City Services to Bagonhons,{'\n'}
              Right at Your Fingertips
            </Text>

            {/* Statistics */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>24</Text>
                <Text style={styles.statLabel}>Barangays</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>3</Text>
                <Text style={styles.statLabel}>Health Programs</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>190K+</Text>
                <Text style={styles.statLabel}>Residents Served</Text>
              </View>
            </View>

            {/* Program Logos */}
            <View style={styles.programLogos}>
              <Image
                source={require('../../assets/images/hw-logo.png')}
                style={styles.programLogo}
                resizeMode="contain"
              />
              <Image
                source={require('../../assets/images/sbb-logo.png')}
                style={styles.programLogo}
                resizeMode="contain"
              />
              <Image
                source={require('../../assets/images/wol-logo.png')}
                style={styles.programLogo}
                resizeMode="contain"
              />
            </View>
          </ScrollView>
        </View>

        {/* RIGHT PANEL - White Background */}
        <View style={styles.rightPanel}>
          <ScrollView 
            contentContainerStyle={styles.rightContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Label */}
            <View style={styles.officialLabel}>
              <Text style={styles.officialLabelText}>OFFICIAL CITY APP</Text>
            </View>

            {/* Main Heading */}
            <View style={styles.rightHeading}>
              <Text style={styles.headingNormal}>Your City, </Text>
              <Text style={styles.headingOrange}>At Your Fingertips</Text>
            </View>

            {/* Supporting Copy */}
            <Text style={styles.rightDescription}>
              Access Bago City government programs, services, tourism, and news — all in one place.
            </Text>

            {/* Service Categories */}
            <View style={styles.categoriesGrid}>
              {serviceCategories.map((category, index) => (
                <View key={index} style={styles.categoryItem}>
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Text style={styles.categoryLabel}>{category.label}</Text>
                </View>
              ))}
            </View>

            {/* CTA Buttons */}
            <View style={styles.ctaContainer}>
              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={() => navigation.replace('Main')}
                activeOpacity={0.85}
              >
                <Text style={styles.btnPrimaryText}>Get Started</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnSecondary}
                onPress={() => navigation.replace('Main')}
                activeOpacity={0.7}
              >
                <Text style={styles.btnSecondaryText}>
                  Already have an account? <Text style={styles.signInLink}>Sign in</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    );
  }

  // Mobile layout
  return (
    <SafeAreaView style={styles.mobileContainer} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      
      <ScrollView 
        contentContainerStyle={styles.mobileContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logos side by side */}
        <View style={styles.mobileLogosRow}>
          <Image
            source={require('../../assets/images/bago-city-logo.png')}
            style={styles.mobileCityLogo}
            resizeMode="contain"
          />
          <Image
            source={require('../../assets/images/mayora-logo.png')}
            style={styles.mobileMayoraLogo}
            resizeMode="contain"
          />
        </View>

        {/* City Name and Location */}
        <View style={styles.mobileCityInfo}>
          <Text style={styles.mobileCityName}>City of Bago</Text>
          <Text style={styles.mobileCityLocation}>NEGROS OCCIDENTAL, PHILIPPINES</Text>
        </View>

        {/* Orange Divider */}
        <View style={styles.mobileDivider} />

        {/* Tagline */}
        <Text style={styles.mobileTagline}>
          City Services to Bagonhons, Right at Your Fingertips
        </Text>

        {/* Service Categories */}
        <View style={styles.mobileCategories}>
          {serviceCategories.map((category, index) => (
            <View key={index} style={styles.mobileCategoryItem}>
              <Text style={styles.mobileCategoryIcon}>{category.icon}</Text>
              <Text style={styles.mobileCategoryLabel}>{category.label}</Text>
            </View>
          ))}
        </View>

        {/* CTA Buttons */}
        <View style={styles.mobileActions}>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => navigation.replace('Main')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnPrimaryText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => navigation.replace('Main')}
            activeOpacity={0.7}
          >
            <Text style={styles.btnSecondaryText}>
              Already have an account? <Text style={styles.signInLink}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ============ DESKTOP/TABLET SPLIT-SCREEN ============
  desktopContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.bg,
  },

  // LEFT PANEL
  leftPanel: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  leftContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  logosContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  cityLogo: {
    width: 80,
    height: 80,
  },
  mayoraLogo: {
    width: 80,
    height: 80,
  },
  cityIdentity: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  cityName: {
    fontSize: 36,
    fontWeight: fonts.black,
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  cityLocation: {
    fontSize: 11,
    fontWeight: fonts.semibold,
    color: colors.textSecondary,
    letterSpacing: 1.2,
  },
  leftTagline: {
    fontSize: 17,
    lineHeight: 26,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    maxWidth: 380,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    marginBottom: spacing.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.bgWhite,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: fonts.black,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: fonts.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  programLogos: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
  programLogo: {
    width: 64,
    height: 64,
    opacity: 0.8,
  },

  // RIGHT PANEL
  rightPanel: {
    flex: 1,
    backgroundColor: colors.bgWhite,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  rightContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.xl,
    maxWidth: 520,
  },
  officialLabel: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.bgAccent,
    borderRadius: radius.sm,
    marginBottom: spacing.lg,
  },
  officialLabelText: {
    fontSize: 10,
    fontWeight: fonts.extrabold,
    color: colors.primary,
    letterSpacing: 1.5,
  },
  rightHeading: {
    marginBottom: spacing.md,
  },
  headingNormal: {
    fontSize: 38,
    fontWeight: fonts.black,
    color: colors.textPrimary,
    lineHeight: 46,
    letterSpacing: -0.5,
  },
  headingOrange: {
    fontSize: 38,
    fontWeight: fonts.black,
    color: colors.primary,
    lineHeight: 46,
    letterSpacing: -0.5,
  },
  rightDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    maxWidth: 440,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryIcon: {
    fontSize: 18,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: fonts.semibold,
    color: colors.textPrimary,
  },
  ctaContainer: {
    width: '100%',
    gap: spacing.md,
  },

  // ============ MOBILE LAYOUT ============
  mobileContainer: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  mobileContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  mobileLogosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  mobileCityLogo: {
    width: 72,
    height: 72,
  },
  mobileMayoraLogo: {
    width: 72,
    height: 72,
  },
  mobileCityInfo: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  mobileCityName: {
    fontSize: 30,
    fontWeight: fonts.black,
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  mobileCityLocation: {
    fontSize: 10,
    fontWeight: fonts.semibold,
    color: colors.textSecondary,
    letterSpacing: 1.2,
  },
  mobileDivider: {
    width: 60,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: spacing.lg,
  },
  mobileTagline: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  mobileCategories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  mobileCategoryItem: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.bgWhite,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 100,
  },
  mobileCategoryIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  mobileCategoryLabel: {
    fontSize: 11,
    fontWeight: fonts.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  mobileActions: {
    gap: spacing.md,
  },

  // ============ SHARED BUTTONS ============
  btnPrimary: {
    backgroundColor: colors.primary,
    borderRadius: radius.btn,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  btnPrimaryText: {
    fontSize: 16,
    fontWeight: fonts.bold,
    color: colors.textWhite,
    letterSpacing: 0.3,
  },
  btnSecondary: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  btnSecondaryText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: fonts.medium,
  },
  signInLink: {
    color: colors.primary,
    fontWeight: fonts.bold,
  },
});
