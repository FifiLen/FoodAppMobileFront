// (app)/welcome-offer.tsx

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, Percent, Tag, Copy, ChevronRight } from "lucide-react-native";
import * as Clipboard from "expo-clipboard"; // For copying the code

import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from "@/components/home-page/constants";
// You'll reuse these or similar components
import { FeaturedRestaurantsSection } from "@/components/home-page/FeaturedRestaurantsSection";
import { ProductsSection } from "@/components/home-page/ProductSection"; // Or a simplified version

const WelcomeOfferScreen = () => {
  const router = useRouter();
  const PROMO_CODE = "WELCOME30";

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(PROMO_CODE);
    alert("Kod promocyjny skopiowany!"); // Or use a more subtle toast notification
  };

  const handleBrowseRestaurants = () => {
    // Navigate to your main screen for listing all restaurants
    // Example: router.push('/restaurants');
    alert("TODO: Nawigacja do listy wszystkich restauracji");
  };

  const handleBrowseDishes = () => {
    // Navigate to a screen showing popular dishes or all products
    // Example: router.push('/products');
    alert("TODO: Nawigacja do listy wszystkich dań");
  };

  return (
    <View style={styles.screenContainer}>
      <Stack.Screen
        options={{
          title: "Oferta Powitalna",
          headerStyle: { backgroundColor: COLORS.background },
          headerTitleStyle: { color: COLORS.textPrimary, fontSize: FONT_SIZE.lg, fontWeight: "600" },
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: SPACING.md, padding: SPACING.xs }}>
              <ArrowLeft size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}
      >
        {/* Offer Highlight Section */}
        <LinearGradient
          colors={[COLORS.primary, "#ff8c6e"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.offerBanner}
        >
          <View style={styles.offerBannerContent}>
            <Percent size={48} color={COLORS.white} style={styles.offerIcon} />
            <Text style={styles.offerTitle}>-30% na Twoje Pierwsze Zamówienie!</Text>
            <Text style={styles.offerSubtitle}>
              Cieszymy się, że tu jesteś! Skorzystaj ze specjalnej zniżki.
            </Text>
          </View>
        </LinearGradient>

        {/* Promo Code Section */}
        <View style={styles.promoCodeSection}>
          <Text style={styles.sectionTitle}>Twój Kod Promocyjny</Text>
          <View style={styles.promoCodeBox}>
            <Tag size={22} color={COLORS.primary} style={styles.promoCodeIcon} />
            <Text style={styles.promoCodeText}>{PROMO_CODE}</Text>
            <TouchableOpacity onPress={copyToClipboard} style={styles.copyButton}>
              <Copy size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.promoCodeInstruction}>
            Użyj tego kodu przy składaniu pierwszego zamówienia.
          </Text>
        </View>

        {/* Quick Start Section */}
        <View style={styles.quickStartSection}>
            <TouchableOpacity style={styles.quickStartButtonPrimary} onPress={handleBrowseRestaurants}>
                <Text style={styles.quickStartButtonTextPrimary}>Przeglądaj Restauracje</Text>
                <ChevronRight size={20} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickStartButtonSecondary} onPress={handleBrowseDishes}>
                <Text style={styles.quickStartButtonTextSecondary}>Zobacz Popularne Dania</Text>
                <ChevronRight size={20} color={COLORS.primary} />
            </TouchableOpacity>
        </View>


        {/* Recommended Restaurants Section */}
        <View style={styles.recommendationSection}>
          <Text style={styles.sectionTitle}>Wypróbuj te Restauracje</Text>
          {/*
            You can reuse your FeaturedRestaurantsSection here.
            Pass appropriate props, e.g., to limit the number of items.
            For now, a placeholder:
          */}
          <FeaturedRestaurantsSection
            title="" // Title is handled by sectionTitle above
            maxItems={3} // Show fewer items
            horizontal={true}
            showViewAllButton={false} // No need for "view all" here
            onViewAllPress={() => {}}
            itemStyle={{ width: 280 }} // Adjust item width if needed for this screen
          />
        </View>

        <View style={{height: SPACING.xl}} />

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContentContainer: {
    paddingBottom: SPACING.xxl,
  },
  offerBanner: {
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  offerBannerContent: {
    alignItems: "center",
  },
  offerIcon: {
    marginBottom: SPACING.md,
  },
  offerTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: "bold",
    color: COLORS.white,
    textAlign: "center",
    marginBottom: SPACING.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  offerSubtitle: {
    fontSize: FONT_SIZE.md,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    maxWidth: "90%",
  },
  promoCodeSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textAlign: "left",
    width: "100%",
    paddingHorizontal: SPACING.lg, // Added for consistency if section is not centered
  },
  promoCodeBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    ...SHADOWS.medium,
    marginBottom: SPACING.sm,
    width: "100%",
    maxWidth: 350,
  },
  promoCodeIcon: {
    marginRight: SPACING.md,
  },
  promoCodeText: {
    flex: 1,
    fontSize: FONT_SIZE.xl,
    fontWeight: "bold",
    color: COLORS.primary,
    letterSpacing: 1,
  },
  copyButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginLeft: SPACING.sm,
  },
  promoCodeInstruction: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  quickStartSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  quickStartButtonPrimary: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg -2,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...SHADOWS.medium,
    marginBottom: SPACING.md,
  },
  quickStartButtonTextPrimary: {
    color: COLORS.white,
    fontSize: FONT_SIZE.lg,
    fontWeight: "bold",
  },
  quickStartButtonSecondary: {
    backgroundColor: COLORS.cardBackground,
    paddingVertical: SPACING.lg -2,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  quickStartButtonTextSecondary: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.lg,
    fontWeight: "bold",
  },
  recommendationSection: {
    marginBottom: SPACING.xl,
    // paddingHorizontal: SPACING.lg, // Removed to allow full-width scroll for sections
  },
});

export default WelcomeOfferScreen;
