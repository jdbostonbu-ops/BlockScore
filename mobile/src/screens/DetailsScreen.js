import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getSavedZips, saveZip, removeZip } from "../store/savedStore";
import { getReportCard } from "../../services/api";

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

export default function DetailsScreen() {
  const router = useRouter();
  const { zip } = useLocalSearchParams();

  const [reportCard, setReportCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedZips, setSavedZips] = useState([]);

  const rating = reportCard
    ? getNeighborhoodRating(reportCard.overall_score)
    : null;

  async function loadDetails() {
    try {
      setLoading(true);
      const data = await getReportCard(zip || "10001");
      setReportCard(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadSaved() {
    const saved = await getSavedZips();
    setSavedZips(saved);
  }

  async function handleSaveZip(selectedZip) {
    if (savedZips.includes(selectedZip)) {
      const updated = await removeZip(selectedZip);
      setSavedZips(updated);
    } else {
      const updated = await saveZip(selectedZip);
      setSavedZips(updated);
    }
  }

  useEffect(() => {
    loadDetails();
    loadSaved();
  }, [zip]);

  if (loading || !reportCard) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6C4DFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.push("/")}>
        <Text style={styles.back}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.headerCard}>
        <Text style={styles.label}>Neighborhood Report</Text>
        <Text style={styles.title}>ZIP {reportCard.zip_code}</Text>
        <Text style={styles.subtitle}>{reportCard.borough}</Text>

        {rating && (
          <View
            style={[
              styles.ratingBadge,
              { backgroundColor: rating.color },
            ]}
          >
            <Text style={styles.ratingBadgeText}>
              {rating.label}
            </Text>
          </View>
        )}

        <View style={styles.scoreBadge}>
          <Text style={styles.grade}>{reportCard.overall_grade}</Text>
          <Text style={styles.score}>{reportCard.overall_score} / 100</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={() => handleSaveZip(reportCard.zip_code)}
      >
        <Text style={styles.saveButtonText}>
          {savedZips.includes(reportCard.zip_code) ? "Saved ✓" : "Save ZIP"}
        </Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quality of Life Breakdown</Text>

        <Row label="Noise" data={reportCard.categories.noise} />
        <Row label="Cleanliness" data={reportCard.categories.cleanliness} />
        <Row label="Utilities" data={reportCard.categories.utilities} />
        <Row label="Infrastructure" data={reportCard.categories.infrastructure} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Peak Noise Complaint Hours</Text>

        {reportCard.peak_noise_hours?.length ? (
          reportCard.peak_noise_hours.map((item, index) => (
            <Text style={styles.issue} key={index}>
              {item.created_hour}:00 — {item.total} complaints
            </Text>
          ))
        ) : (
          <Text style={styles.insight}>
            No peak-hour noise data found for this ZIP.
          </Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Local Insight</Text>
        <Text style={styles.insight}>
          This ZIP has an overall livability grade of {reportCard.overall_grade}.
          Use the category scores to compare noise, cleanliness, utility reliability,
          and infrastructure stress before choosing where to live.
        </Text>
      </View>
    </ScrollView>
  );
}

function Row({ label, data }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{data.score}</Text>
      <Text style={styles.rowGrade}>{data.grade}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F4F1FF",
  },
  center: {
    flex: 1,
    backgroundColor: "#F4F1FF",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    padding: 22,
    paddingBottom: 100,
  },
  back: {
    marginTop: 40,
    marginBottom: 18,
    color: "#6C4DFF",
    fontWeight: "900",
  },
  headerCard: {
    backgroundColor: "#24105A",
    borderRadius: 30,
    padding: 24,
    marginBottom: 18,
  },
  label: {
    color: "#BDB2FF",
    fontWeight: "900",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "900",
    marginTop: 8,
  },
  subtitle: {
    color: "#DCD7FF",
    fontSize: 18,
    marginTop: 4,
  },
  scoreBadge: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginTop: 22,
    alignItems: "center",
  },
  grade: {
    color: "#6C4DFF",
    fontSize: 42,
    fontWeight: "900",
  },
  score: {
    color: "#24105A",
    fontWeight: "800",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 22,
    marginBottom: 16,
  },
  cardTitle: {
    color: "#24105A",
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 14,
  },
  row: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEAFB",
  },
  rowLabel: {
    flex: 1,
    color: "#24105A",
    fontWeight: "800",
  },
  rowValue: {
    width: 60,
    color: "#6C4DFF",
    fontWeight: "900",
  },
  rowGrade: {
    width: 50,
    color: "#24105A",
    fontWeight: "900",
  },
  insight: {
    color: "#5F5873",
    lineHeight: 22,
  },
  issue: {
    color: "#24105A",
    fontWeight: "700",
    paddingVertical: 6,
  },
  ratingBadge: {
  alignSelf: "flex-start",
  paddingHorizontal: 14,
  paddingVertical: 8,
  borderRadius: 999,
  marginTop: 14,
  },

  ratingBadgeText: {
  color: "#FFFFFF",
  fontWeight: "900",
  fontSize: 13,
  },

});