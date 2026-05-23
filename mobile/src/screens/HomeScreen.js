import BlockScoreLogo from "../../assets/blockscore-logo.svg";
import { useRouter } from "expo-router";
import BottomNav from "../components/BottomNav";
import { addSearchHistory } from "../store/searchHistoryStore";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import { getReportCard, getTopComplaints } from "../../services/api";

function getComplaintBarPercent(total, complaints) {
  if (!complaints || complaints.length === 0) return "8%";

  const highest = Math.max(...complaints.map((item) => Number(item.total) || 0));
  if (!highest) return "8%";

  const percent = Math.round(((Number(total) || 0) / highest) * 100);
  return `${Math.max(8, percent)}%`;
}

function getComplaintBarColor(index) {
  if (index === 0) return "#EF4444";
  if (index <= 2) return "#F59E0B";
  if (index <= 5) return "#3B82F6";
  return "#22C55E";
}

function getNeighborhoodRating(score) {
  const numericScore = Number(score) || 0;

  if (numericScore >= 85) {
    return { label: "Excellent Area", color: "#22C55E" };
  }

  if (numericScore >= 70) {
    return { label: "Moderate Area", color: "#F59E0B" };
  }

  return { label: "Needs Review", color: "#EF4444" };
}

export default function HomeScreen() {
  const router = useRouter();
  const [zipCode, setZipCode] = useState("10001");
  const [reportCard, setReportCard] = useState(null);
  const [topComplaints, setTopComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const rating = reportCard
    ? getNeighborhoodRating(reportCard.overall_score)
    : null;

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const report = await getReportCard(zipCode);
      const complaints = await getTopComplaints();

      setReportCard(report);
      setTopComplaints(complaints);

      await addSearchHistory(zipCode);
    } catch (err) {
      console.log(err);
      setError("Could not load data. Make sure FastAPI is running on port 8000.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <BlockScoreLogo
            width={320}
            height={70}
          />
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Find the best places to live in NYC</Text>
          <Text style={styles.heroText}>
            Neighborhood report cards powered by real 311 complaint data.
          </Text>

          <View style={styles.searchBox}>
            <TextInput
              value={zipCode}
              onChangeText={setZipCode}
              placeholder="Search ZIP code"
              keyboardType="numeric"
              style={styles.input}
            />

            <TouchableOpacity style={styles.searchButton} onPress={loadData}>
              <Text style={styles.searchText}>Search</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading && <ActivityIndicator size="large" color="#6C4DFF" />}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {reportCard && rating && (
          <TouchableOpacity
            style={styles.scoreCard}
            onPress={() => router.push(`/details?zip=${reportCard.zip_code}`)}
          >
            <View style={styles.scoreInfo}>
              <Text style={styles.sectionLabel}>NYC Borough Report Card</Text>
              <Text style={styles.zip}>ZIP {reportCard.zip_code}</Text>
              <Text style={styles.borough}>{reportCard.borough}</Text>

              <View
                style={[
                  styles.ratingBadge,
                  { backgroundColor: rating.color },
                ]}
              >
                <Text style={styles.ratingBadgeText}>{rating.label}</Text>
              </View>
            </View>

            <View style={styles.gradeCircle}>
              <Text style={styles.grade}>{reportCard.overall_grade}</Text>
              <Text style={styles.score}>{reportCard.overall_score}</Text>
            </View>
          </TouchableOpacity>
        )}

        {reportCard && (
          <View style={styles.grid}>
            <Metric title="Noise" icon="🔇" data={reportCard.categories.noise} />
            <Metric title="Cleanliness" icon="🧼" data={reportCard.categories.cleanliness} />
            <Metric title="Utilities" icon="⚡" data={reportCard.categories.utilities} />
            <Metric title="Infrastructure" icon="🚧" data={reportCard.categories.infrastructure} />
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Top Complaint Types</Text>

          {topComplaints.length === 0 ? (
            <Text style={styles.muted}>No complaint data loaded yet.</Text>
          ) : (
            topComplaints.map((item, index) => (
              <View style={styles.complaintItem} key={index}>
                <View style={styles.complaintTopRow}>
                  <Text style={styles.rank}>{index + 1}</Text>
                  <Text style={styles.rowText}>{item.complaint_type}</Text>
                  <Text style={styles.total}>{item.total}</Text>
                </View>

                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: getComplaintBarPercent(item.total, topComplaints),
                        backgroundColor: getComplaintBarColor(index),
                      },
                    ]}
                  />
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <BottomNav />
    </View>
  );
}

function Metric({ title, icon, data }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricIcon}>{icon}</Text>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={styles.metricScore}>{data.score}</Text>
      <Text style={styles.metricGrade}>Grade {data.grade}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F4F1FF",
  },

  content: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    padding: 22,
    paddingBottom: 120,
  },

  header: {
    marginTop: 40,
    marginBottom: 24,
  },

  logo: {
    fontSize: 34,
    fontWeight: "900",
    color: "#24105A",
  },

  tagline: {
    color: "#6B6380",
    marginTop: 4,
    fontSize: 15,
  },

  hero: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#6C4DFF",
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 4,
  },

  heroTitle: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "900",
    color: "#24105A",
    marginBottom: 10,
  },

  heroText: {
    fontSize: 16,
    color: "#5F5873",
    marginBottom: 20,
  },

  searchBox: {
    flexDirection: "row",
    backgroundColor: "#F4F1FF",
    borderRadius: 18,
    padding: 6,
  },

  input: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    color: "#24105A",
  },

  searchButton: {
    backgroundColor: "#6C4DFF",
    borderRadius: 15,
    paddingHorizontal: 22,
    justifyContent: "center",
  },

  searchText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  error: {
    backgroundColor: "#FFE8E8",
    color: "#B42318",
    padding: 14,
    borderRadius: 14,
    marginBottom: 18,
  },

  scoreCard: {
    backgroundColor: "#24105A",
    borderRadius: 28,
    padding: 24,
    marginBottom: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    overflow: "hidden",
  },

  scoreInfo: {
    flex: 1,
    paddingRight: 14,
  },

  sectionLabel: {
    color: "#BDB2FF",
    fontWeight: "800",
    marginBottom: 6,
  },

  zip: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
  },

  borough: {
    color: "#DCD7FF",
    fontSize: 16,
    marginTop: 4,
  },

  ratingBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginTop: 12,
  },

  ratingBadgeText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 13,
  },

  gradeCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  grade: {
    color: "#6C4DFF",
    fontSize: 34,
    fontWeight: "900",
  },

  score: {
    color: "#24105A",
    fontWeight: "800",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },

  metric: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    width: "48%",
    shadowColor: "#6C4DFF",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },

  metricIcon: {
    fontSize: 24,
    marginBottom: 8,
  },

  metricTitle: {
    color: "#24105A",
    fontWeight: "800",
    marginBottom: 8,
  },

  metricScore: {
    fontSize: 30,
    fontWeight: "900",
    color: "#6C4DFF",
  },

  metricGrade: {
    color: "#6B6380",
    marginTop: 2,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 22,
    shadowColor: "#6C4DFF",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },

  cardTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#24105A",
    marginBottom: 14,
  },

  muted: {
    color: "#7B748E",
  },

  complaintItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEAFB",
  },

  complaintTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  rank: {
    width: 28,
    fontWeight: "900",
    color: "#6C4DFF",
  },

  rowText: {
    flex: 1,
    color: "#24105A",
    fontWeight: "700",
  },

  total: {
    fontWeight: "900",
    color: "#24105A",
  },

  progressTrack: {
    height: 10,
    backgroundColor: "#ECE7FF",
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 12,
  },

  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
});