import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import BottomNav from "../components/BottomNav";
import { getReportCard } from "../../services/api";

export default function CompareScreen() {
  const [leftZip, setLeftZip] = useState("10001");
  const [rightZip, setRightZip] = useState("11201");
  const [leftData, setLeftData] = useState(null);
  const [rightData, setRightData] = useState(null);
  const [loading, setLoading] = useState(false);

  async function compare() {
    try {
      setLoading(true);
      const left = await getReportCard(leftZip);
      const right = await getReportCard(rightZip);
      setLeftData(left);
      setRightData(right);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

return (
  <View style={styles.page}>
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.logo}>⚖️ Compare</Text>

      <Text style={styles.subtitle}>
        Compare two NYC ZIP codes side-by-side.
      </Text>

      <View style={styles.searchCard}>
        <TextInput
          value={leftZip}
          onChangeText={setLeftZip}
          placeholder="First ZIP"
          keyboardType="numeric"
          style={styles.input}
        />

        <TextInput
          value={rightZip}
          onChangeText={setRightZip}
          placeholder="Second ZIP"
          keyboardType="numeric"
          style={styles.input}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={compare}
        >
          <Text style={styles.buttonText}>
            Compare
          </Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <ActivityIndicator
          size="large"
          color="#6C4DFF"
        />
      )}

      {leftData && rightData && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Neighborhood Matchup
          </Text>

          <CompareRow
            label="Overall"
            left={leftData.overall_score}
            right={rightData.overall_score}
          />

          <CompareRow
            label="Noise"
            left={leftData.categories.noise.score}
            right={rightData.categories.noise.score}
          />

          <CompareRow
            label="Cleanliness"
            left={leftData.categories.cleanliness.score}
            right={rightData.categories.cleanliness.score}
          />

          <CompareRow
            label="Utilities"
            left={leftData.categories.utilities.score}
            right={rightData.categories.utilities.score}
          />

          <CompareRow
            label="Infrastructure"
            left={leftData.categories.infrastructure.score}
            right={rightData.categories.infrastructure.score}
          />

          <View style={styles.zipRow}>
            <Text style={styles.zipLabel}>
              ZIP {leftData.zip_code}
            </Text>

            <Text style={styles.zipLabel}>
              ZIP {rightData.zip_code}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>

    <BottomNav />
  </View>
);
}

function CompareRow({ label, left, right }) {
  const winner = left === right ? "tie" : left > right ? "left" : "right";

  return (
    <View style={styles.compareRow}>
      <Text style={[styles.score, winner === "left" && styles.winner]}>{left}</Text>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.score, winner === "right" && styles.winner]}>{right}</Text>
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
  searchCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 20,
    marginBottom: 18,
    gap: 12,
  },
  input: {
    backgroundColor: "#F4F1FF",
    borderRadius: 16,
    padding: 14,
    fontSize: 16,
    color: "#24105A",
  },
  button: {
    backgroundColor: "#6C4DFF",
    borderRadius: 16,
    padding: 15,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 22,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#24105A",
    marginBottom: 14,
  },
  compareRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEAFB",
  },
  score: {
    width: 70,
    fontSize: 22,
    fontWeight: "900",
    color: "#7B748E",
    textAlign: "center",
  },
  winner: {
    color: "#22C55E",
  },
  label: {
    flex: 1,
    textAlign: "center",
    color: "#24105A",
    fontWeight: "800",
  },
  zipRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },
  zipLabel: {
    color: "#6C4DFF",
    fontWeight: "900",
  },
});