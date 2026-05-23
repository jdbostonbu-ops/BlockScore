import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import BottomNav from "../components/BottomNav";
import { api } from "../../services/api";

const complaintIcon = new L.DivIcon({
  className: "custom-complaint-marker",
  html: `<div style="
    width: 22px;
    height: 22px;
    background: #EF4444;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 4px 10px rgba(0,0,0,.25);
  "></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

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
          <FilterButton active={category === "noise"} label="Noise" onPress={() => changeCategory("noise")} />
          <FilterButton active={category === "cleanliness"} label="Cleanliness" onPress={() => changeCategory("cleanliness")} />
          <FilterButton active={category === "utilities"} label="Utilities" onPress={() => changeCategory("utilities")} />
          <FilterButton active={category === "infrastructure"} label="Infrastructure" onPress={() => changeCategory("infrastructure")} />
        </View>

        <View style={styles.mapCard}>
          {loading ? (
            <View style={styles.loadingMap}>
              <ActivityIndicator size="large" color="#6C4DFF" />
              <Text style={styles.mapText}>Loading map points...</Text>
            </View>
          ) : (
            <View style={styles.leafletWrapper}>
              <MapContainer
                center={[40.7128, -74.006]}
                zoom={11}
                scrollWheelZoom={true}
                style={{
                  height: 360,
                  width: "100%",
                  borderRadius: 24,
                  overflow: "hidden",
                }}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {pins.slice(0, 30).map((pin, index) => (
                  <Marker
                    key={index}
                    icon={complaintIcon}
                    position={[
                      40.7128 + ((index % 7) * 0.018) - 0.06,
                      -74.006 + ((index % 6) * 0.018) - 0.05,
                    ]}
                  >
                    <Popup>
                      <strong>ZIP {pin.incident_zip}</strong>
                      <br />
                      {pin.borough}
                      <br />
                      {pin.total} {category} complaints
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Active {category} complaint zones</Text>
          <Text style={styles.count}>{pins.length} map points loaded</Text>

          {pins.slice(0, 5).map((item, index) => (
            <View style={styles.row} key={index}>
              <Text style={styles.rank}>{index + 1}</Text>

              <View style={{ flex: 1 }}>
                <Text style={styles.zip}>ZIP {item.incident_zip}</Text>
                <Text style={styles.borough}>{item.borough}</Text>
              </View>

              <Text style={styles.total}>{item.total}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <BottomNav />
    </View>
  );
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
  leafletWrapper: {
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
  mapText: {
    color: "#24105A",
    fontWeight: "900",
    fontSize: 18,
    marginTop: 12,
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