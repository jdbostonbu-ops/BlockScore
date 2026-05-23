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

import BottomNav from "../components/BottomNav";
import { api } from "../../services/api";

export default function MapScreen() {
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("noise");

  async function loadPins(selected = category) {
    try {
      setLoading(true);
      const response = await api.get(`/map/pins?category=${selected}`);
      setPins(response.data);
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
        <FilterButton
          active={category === "noise"}
          label="Noise"
          onPress={() => changeCategory("noise")}
        />

        <FilterButton
          active={category === "cleanliness"}
          label="Cleanliness"
          onPress={() => changeCategory("cleanliness")}
        />

        <FilterButton
          active={category === "utilities"}
          label="Utilities"
          onPress={() => changeCategory("utilities")}
        />

        <FilterButton
          active={category === "infrastructure"}
          label="Infrastructure"
          onPress={() => changeCategory("infrastructure")}
        />
      </View>

      <View style={styles.mapCard}>
        {loading ? (
          <View style={styles.loadingMap}>
            <ActivityIndicator size="large" color="#6C4DFF" />
            <Text style={styles.mapText}>
              Loading map points...
            </Text>
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
              {pins.slice(0, 14).map((pin, index) => (
                <View
                  key={index}
                  style={[
                    styles.coolPin,
                    {
                      top: getPinTop(index, category),
                      left: getPinLeft(index, category),
                    },
                  ]}
                >
                  <Text style={styles.pinText}>
                    {index + 1}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.fakeMap}>
            <Text style={styles.mapText}>
              NYC Complaint Density Map
            </Text>

            {pins.slice(0, 18).map((pin, index) => (
              <View
                key={index}
                style={[
                  styles.pin,
                  {
                    top: getPinTop(index, category),
                    left: getPinLeft(index, category),
                  },
                ]}
              />
            ))}
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Active {category} complaint zones
        </Text>

        <Text style={styles.count}>
          {pins.length} map points loaded
        </Text>

        {pins.slice(0, 5).map((item, index) => (
          <View style={styles.row} key={index}>
            <Text style={styles.rank}>
              {index + 1}
            </Text>

            <View style={{ flex: 1 }}>
              <Text style={styles.zip}>
                ZIP {item.incident_zip}
              </Text>

              <Text style={styles.borough}>
                {item.borough}
              </Text>
            </View>

            <Text style={styles.total}>
              {item.total}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>

    <BottomNav />
  </View>
);
}

function getPinTop(index, category) {
  if (category === "noise") return 30 + ((index * 73) % 260);
  if (category === "cleanliness") return 45 + ((index * 91) % 240);
  if (category === "utilities") return 60 + ((index * 47) % 250);
  return 35 + ((index * 119) % 255);
}

function getPinLeft(index, category) {
  if (category === "noise") return 30 + ((index * 127) % 330);
  if (category === "cleanliness") return 50 + ((index * 83) % 310);
  if (category === "utilities") return 70 + ((index * 111) % 280);
  return 40 + ((index * 59) % 330);
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
  backgroundColor: "#6C4DFF",
  borderWidth: 3,
  borderColor: "#FFFFFF",
  alignItems: "center",
  justifyContent: "center",
  shadowColor: "#000",
  shadowOpacity: 0.25,
  shadowRadius: 8,
},

pinText: {
  color: "#FFFFFF",
  fontWeight: "900",
  fontSize: 12,
},
});