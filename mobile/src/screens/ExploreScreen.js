import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import BottomNav from "../components/BottomNav";
import { api } from "../../services/api";

export default function ExploreScreen() {
  const router = useRouter();
  const [quietest, setQuietest] = useState([]);
  const [cleanest, setCleanest] = useState([]);

  async function loadRankings() {
    const quiet = await api.get("/rankings/quietest");
    const clean = await api.get("/rankings/cleanest");
    setQuietest(quiet.data);
    setCleanest(clean.data);
  }

  useEffect(() => {
    loadRankings();
  }, []);

 return (
  <View style={styles.page}>
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.logo}>🔎 Explore</Text>
      <Text style={styles.subtitle}>
        Discover NYC neighborhoods by livability signals.
      </Text>

      <Section title="Quietest ZIP Codes" data={quietest} router={router} field="noise_total" />
      <Section title="Cleanest ZIP Codes" data={cleanest} router={router} field="cleanliness_total" />
    </ScrollView>

    <BottomNav />
  </View>
);
}

function Section({ title, data, router, field }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>

      {data.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.row}
          onPress={() => router.push(`/details?zip=${item.incident_zip}`)}
        >
          <Text style={styles.rank}>{index + 1}</Text>
          <View style={styles.info}>
            <Text style={styles.zip}>ZIP {item.incident_zip}</Text>
            <Text style={styles.borough}>{item.borough}</Text>
          </View>
          <Text style={styles.total}>{item[field]}</Text>
        </TouchableOpacity>
      ))}
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
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 22,
    marginBottom: 18,
    shadowColor: "#6C4DFF",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#24105A",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEAFB",
  },
  rank: {
    width: 34,
    color: "#6C4DFF",
    fontWeight: "900",
  },
  info: { flex: 1 },
  zip: {
    color: "#24105A",
    fontWeight: "900",
  },
  borough: {
    color: "#7B748E",
    marginTop: 2,
  },
  total: {
    color: "#24105A",
    fontWeight: "900",
  },
});