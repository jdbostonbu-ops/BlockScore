import { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { getSearchHistory, clearSearchHistory } from "../store/searchHistoryStore";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import BottomNav from "../components/BottomNav";
import { getSavedZips, removeZip } from "../store/savedStore";

export default function ProfileScreen() {
  const [savedZips, setSavedZips] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);

  useFocusEffect(
  useCallback(() => {
    loadSaved();
  }, [])
  );

  async function loadSaved() {
    const saved = await getSavedZips();
    setSavedZips(saved);
    const history = await getSearchHistory();
    setSearchHistory(history);
  }

  async function handleClearHistory() {
  const updated = await clearSearchHistory();
  setSearchHistory(updated);
  }

  async function handleRemoveZip(zip) {
    const updated = await removeZip(zip);
    setSavedZips(updated);
  }

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.logo}>👤 Profile</Text>
        <Text style={styles.subtitle}>
          Your saved neighborhoods and account settings.
        </Text>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>B</Text>
          </View>

          <View>
            <Text style={styles.name}>BlockScore User</Text>
            <Text style={styles.email}>guest@blockscore.app</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Saved Neighborhoods</Text>

          <View style={styles.savedSection}>
            <Text style={styles.savedTitle}>⭐ Saved ZIP Codes</Text>

            {savedZips.length === 0 ? (
              <Text style={styles.emptyText}>No saved ZIP codes yet.</Text>
            ) : (
              savedZips.map((zip) => (
                <View key={zip} style={styles.savedZipRow}>
                  <View style={styles.savedZip}>
                    <Text style={styles.savedZipText}>ZIP {zip}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveZip(zip)}
                  >
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>

          <Setting icon="⚖️" label="Recent comparisons" value="Coming soon" />
          <View style={styles.historySection}>
          <Text style={styles.historyTitle}>🔎 Search History</Text>

         {searchHistory.length === 0 ? (
          <Text style={styles.emptyText}>No searches yet.</Text>
        ) : (
          <>
            {searchHistory.map((zip) => (
              <View key={zip} style={styles.historyItem}>
                <Text style={styles.historyText}>ZIP {zip}</Text>
              </View>
            ))}

            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearHistory}
            >
              <Text style={styles.clearButtonText}>Clear History</Text>
            </TouchableOpacity>
          </>
        )}
        </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Preferences</Text>
          <Setting icon="🔇" label="Noise tolerance" value="Medium" />
          <Setting icon="🧼" label="Cleanliness priority" value="High" />
          <Setting icon="⚡" label="Utilities priority" value="High" />
        </View>

        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginText}>Sign in / Create Account</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNav />
    </View>
  );
}

function Setting({ icon, label, value }) {
  return (
    <View style={styles.setting}>
      <Text style={styles.settingIcon}>{icon}</Text>
      <Text style={styles.settingLabel}>{label}</Text>
      <Text style={styles.settingValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F4F1FF" },
  content: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    padding: 22,
    paddingBottom: 120,
  },
  logo: {
    marginTop: 40,
    fontSize: 34,
    fontWeight: "900",
    color: "#24105A",
  },
  subtitle: {
    color: "#6B6380",
    marginTop: 6,
    marginBottom: 22,
    fontSize: 15,
  },
  profileCard: {
    backgroundColor: "#24105A",
    borderRadius: 30,
    padding: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 18,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#6C4DFF",
    fontSize: 28,
    fontWeight: "900",
  },
  name: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
  },
  email: {
    color: "#DCD7FF",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 22,
    marginBottom: 18,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#24105A",
    marginBottom: 14,
  },
  setting: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEAFB",
  },
  settingIcon: {
    width: 34,
    fontSize: 20,
  },
  settingLabel: {
    flex: 1,
    color: "#24105A",
    fontWeight: "800",
  },
  settingValue: {
    color: "#7B748E",
    fontWeight: "700",
  },
  loginButton: {
    backgroundColor: "#6C4DFF",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  loginText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
  savedSection: {
    marginBottom: 20,
  },
  savedTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2D136C",
    marginBottom: 12,
  },
  savedZipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  savedZip: {
    flex: 1,
    backgroundColor: "#F4F1FF",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  savedZipText: {
    color: "#2D136C",
    fontWeight: "700",
  },
  removeButton: {
    backgroundColor: "#FFE8E8",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  removeButtonText: {
    color: "#EF4444",
    fontWeight: "900",
  },
  emptyText: {
    color: "#7B7298",
  },
  clearButton: {
  backgroundColor: "#F4F1FF",
  paddingVertical: 12,
  borderRadius: 14,
  alignItems: "center",
  marginTop: 8,
},

clearButtonText: {
  color: "#6C4DFF",
  fontWeight: "900",
},
});