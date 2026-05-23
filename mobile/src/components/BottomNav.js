import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.nav}>
      <Tab
        icon="🏠"
        label="Home"
        active={pathname === "/"}
        onPress={() => router.push("/")}
      />

      <Tab
        icon="🔎"
        label="Explore"
        active={pathname === "/explore-blockscore"}
        onPress={() => router.push("/explore-blockscore")}
      />

     <Tab
        icon="🗺️"
        label="Map"
        active={pathname === "/map"}
        onPress={() => router.push("/map")}
      />

     <Tab
        icon="⚖️"
        label="Compare"
        active={pathname === "/compare"}
        onPress={() => router.push("/compare")}
      />

      <Tab
        icon="👤"
        label="Profile"
        active={pathname === "/profile"}
        onPress={() => router.push("/profile")}
      />
      </View>
  );
}

function Tab({ icon, label, active, onPress }) {
  return (
    <TouchableOpacity style={styles.tab} onPress={onPress}>
      <Text style={[styles.icon, active && styles.active]}>
        {icon}
      </Text>

      <Text style={[styles.label, active && styles.active]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  nav: {
    position: "fixed",
    bottom: 18,
    left: "50%",
    transform: [{ translateX: -180 }],
    width: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    shadowColor: "#24105A",
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 12,
  },

  tab: {
    alignItems: "center",
    gap: 2,
  },

  icon: {
    fontSize: 18,
  },

  label: {
    fontSize: 11,
    color: "#7B748E",
    fontWeight: "700",
  },

  active: {
    color: "#6C4DFF",
  },
});