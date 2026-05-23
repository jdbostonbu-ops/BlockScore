import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";

import { getLiveComplaints } from "../../services/api";
import BottomNav from "../components/BottomNav";
import { api } from "../../services/api";

export default function MapScreen() {
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("noise");

  async function loadPins(selected = category) {
    try {
      setLoading(true);

      const response = await api.get("/live-complaints");

      let filteredPins = response.data;

      if (selected === "noise") {
        filteredPins = response.data.filter((item) =>
          item.complaint_type?.toLowerCase().includes("noise")
        );
      }

      setPins(filteredPins);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPins();
  }, []);

  function changeCategory(type) {
    setCategory(type);
    loadPins(type);
  }

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.logo}>🗺️ Neighborhood Map</Text>

        <Text style={styles.subtitle}>
          Explore complaint density and livability patterns across NYC.
        </Text>

        <View style={styles.filters}>
          <FilterButton active={category === "noise"} label="Noise" onPress={() => changeCategory("noise")} />
          <FilterButton active={category === "cleanliness"} label="Cleanliness" onPress={() => changeCategory("cleanliness")} />
          <FilterButton active={category === "utilities"} label="Utilities" onPress={() => changeCategory("utilities")} />
          <FilterButton active={category === "infrastructure"} label="Infrastructure" onPress={() => changeCategory("infrastructure")} />
        </View>

        <View style={styles.legend}>
          <Text style={styles.legendText}>● {category} complaint hotspots</Text>
          <Text style={styles.legendSubtext}>Pins show live NYC 311 complaints</Text>
        </View>

        <View style={styles.mapCard}>
          {loading ? (
            <View style={styles.loadingMap}>
              <ActivityIndicator size="large" color="#6C4DFF" />
              <Text style={styles.mapText}>Loading live complaints...</Text>
            </View>
          ) : Platform.OS === "web" ? (
            <View style={styles.webMapWrapper}>
              <iframe
                title="NYC OpenStreetMap"
                src="https://www.openstreetmap.org/export/embed.html?bbox=-74.2591%2C40.4774%2C-73.7004%2C40.9176&layer=mapnik"
                style={{
                  width: "100%",
                  height: "360px",
                  border: "0",
                  borderRadius: "24px",
                }}
              />

              <View style={styles.pinOverlay}>
                {pins
                  .filter((pin) => pin.latitude && pin.longitude)
                  .slice(0, 30)
                  .map((pin, index) => (
                    <View
                      key={pin.unique_key || index}
                      style={[
                        styles.coolPin,
                        {
                          backgroundColor:
                            category === "noise"
                              ? "#EF4444"
                              : category === "cleanliness"
                              ? "#22C55E"
                              : category === "utilities"
                              ? "#3B82F6"
                              : "#F97316",
                        },
                        {
                          ...getMapPosition(pin.latitude, pin.longitude),
                        },
                      ]}
                    >
                      <Text style={styles.pinText}>{index + 1}</Text>
                    </View>
                  ))}
              </View>
            </View>
          ) : (
            <View style={styles.fakeMap}>
              <Text style={styles.mapText}>Live NYC Complaint Map</Text>

              {pins
                .filter((pin) => pin.latitude && pin.longitude)
                .slice(0, 20)
                .map((pin, index) => (
                  <View
                    key={pin.unique_key || index}
                    style={[
                      styles.pin,
                      {
                        ...getMapPosition(pin.latitude, pin.longitude),
                      },
                    ]}
                  />
                ))}
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Live {category} complaints</Text>
          <Text style={styles.count}>{pins.length} live NYC complaints loaded</Text>

          {pins.slice(0, 5).map((item, index) => (
            <View style={styles.row} key={item.unique_key || index}>
              <Text style={styles.rank}>{index + 1}</Text>

              <View style={{ flex: 1 }}>
                <Text style={styles.zip}>ZIP {item.incident_zip || "N/A"}</Text>
                <Text style={styles.borough}>{item.borough || "Unknown"}</Text>

                <Text style={{ color: "#7B748E", fontSize: 12, marginTop: 2 }}>
                  {item.complaint_type}
                </Text>
              </View>

              <Text style={styles.total}>LIVE</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <BottomNav />
    </View>
  );
}

function getMapPosition(latitude, longitude) {
  const minLat = 40.4774;
  const maxLat = 40.9176;
  const minLng = -74.2591;
  const maxLng = -73.7004;

  const mapWidth = 484;
  const mapHeight = 360;

  const lat = Number(latitude);
  const lng = Number(longitude);

  if (!lat || !lng) {
    return { left: 20, top: 20 };
  }

  const left = ((lng - minLng) / (maxLng - minLng)) * mapWidth;
  const top = ((maxLat - lat) / (maxLat - minLat)) * mapHeight;

  return {
    left: Math.max(8, Math.min(mapWidth - 40, left)),
    top: Math.max(8, Math.min(mapHeight - 40, top)),
  };
}

function FilterButton({ label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.filterButton, active && styles.filterActive]}
      onPress={onPress}
    >
      <Text style={[styles.filterText, active && styles.filterTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
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
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18,
  },
  filterButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  filterActive: {
    backgroundColor: "#6C4DFF",
  },
  filterText: {
    color: "#24105A",
    fontWeight: "800",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  legend: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
  },
  legendText: {
    color: "#24105A",
    fontWeight: "900",
  },
  legendSubtext: {
    color: "#7B748E",
    marginTop: 4,
  },
  mapCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 18,
    marginBottom: 18,
    shadowColor: "#6C4DFF",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  webMapWrapper: {
    height: 360,
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
  },
  loadingMap: {
    height: 360,
    borderRadius: 24,
    backgroundColor: "#DDEBFF",
    justifyContent: "center",
    alignItems: "center",
  },
  fakeMap: {
    height: 360,
    borderRadius: 24,
    backgroundColor: "#DDEBFF",
    overflow: "hidden",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  mapText: {
    color: "#24105A",
    fontWeight: "900",
    fontSize: 18,
    marginTop: 12,
  },
  pin: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#EF4444",
    position: "absolute",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  pinOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
  },
  coolPin: {
    position: "absolute",
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  pinText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 12,
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
    marginBottom: 8,
  },
  count: {
    color: "#6B6380",
    marginBottom: 18,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEAFB",
  },
  rank: {
    width: 28,
    color: "#6C4DFF",
    fontWeight: "900",
  },
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