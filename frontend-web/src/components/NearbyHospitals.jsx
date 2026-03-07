import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
} from "react-native";
import { MapPin, Navigation, Phone, AlertCircle, Hospital } from "lucide-react";
import { translations } from "../translations";

const C = {
  em600: "#059669",
  em700: "#047857",
  em50: "#ecfdf5",
  em100: "#d1fae5",
  s50: "#f8fafc",
  s100: "#f1f5f9",
  s200: "#e2e8f0",
  s400: "#94a3b8",
  s500: "#64748b",
  s900: "#0f172a",
  red50: "#fef2f2",
  red600: "#dc2626",
  white: "#ffffff",
};

function calcDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function NearbyHospitals({ lang }) {
  const t = translations[lang];
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          fetchHospitals(coords.latitude, coords.longitude);
        },
        () => {
          setError("Location permission denied. Please enable GPS.");
          setLoading(false);
        },
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
    }
  }, []);

  const fetchHospitals = async (lat, lng) => {
    try {
      const query = `[out:json];node["amenity"="hospital"](around:5000,${lat},${lng});out;`;
      const res = await fetch(
        `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
      );
      const data = await res.json();
      const formatted = data.elements
        .map((h) => ({
          id: h.id,
          name: h.tags.name || "Unnamed Hospital",
          lat: h.lat,
          lng: h.lon,
          address: h.tags["addr:street"] || "Address not available",
          phone: h.tags.phone || h.tags["contact:phone"] || "108",
          distance: calcDistance(lat, lng, h.lat, h.lon).toFixed(1),
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 12);

      setHospitals(formatted);
    } catch (_) {
      setError("Failed to fetch nearby hospitals.");
    } finally {
      setLoading(false);
    }
  };

  const openPhone = (phone) => Linking.openURL(`tel:${phone}`);
  const openMaps = (lat, lng) =>
    Linking.openURL(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    );

  return (
    <ScrollView style={nh.page} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={nh.header}>
        <Text style={nh.title}>{t.nearbyTitle}</Text>
        <Text style={nh.sub}>{t.nearbyDesc}</Text>
      </View>

      {loading ? (
        <View style={nh.loadingBox}>
          {/* Ping animation */}
          <View style={nh.pingWrap}>
            <View style={[nh.pingRing, nh.pingRing1]} />
            <View style={[nh.pingRing, nh.pingRing2]} />
            <View style={nh.pingCenter}>
              <MapPin size={36} color={C.em600} />
            </View>
          </View>
          <Text style={nh.loadingText}>Scanning area...</Text>
        </View>
      ) : error ? (
        <View style={nh.errorBox}>
          <AlertCircle size={48} color={C.red600} />
          <Text style={nh.errorTitle}>Location Error</Text>
          <Text style={nh.errorSub}>{error}</Text>
        </View>
      ) : hospitals.length === 0 ? (
        <View style={nh.emptyBox}>
          <Hospital size={48} color={C.s400} />
          <Text style={nh.emptyTitle}>No hospitals found nearby</Text>
          <Text style={nh.emptySub}>Try expanding the search radius</Text>
        </View>
      ) : (
        <View style={nh.list}>
          {hospitals.map((h) => (
            <HospitalCard
              key={h.id}
              hospital={h}
              onCall={() => openPhone(h.phone)}
              onNavigate={() => openMaps(h.lat, h.lng)}
            />
          ))}
        </View>
      )}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

function HospitalCard({ hospital: h, onCall, onNavigate }) {
  return (
    <View style={hc.card}>
      <View style={hc.top}>
        <View style={hc.info}>
          <View style={hc.iconWrap}>
            <Hospital size={22} color={C.em600} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={hc.name}>{h.name}</Text>
            <Text style={hc.address} numberOfLines={1}>
              {h.address}
            </Text>
          </View>
        </View>
        <View style={hc.distanceBadge}>
          <Text style={hc.distanceText}>{h.distance} km</Text>
        </View>
      </View>

      <View style={hc.actions}>
        <TouchableOpacity
          onPress={onCall}
          style={hc.callBtn}
          activeOpacity={0.75}
        >
          <Phone size={16} color={C.s900} />
          <Text style={hc.callBtnText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onNavigate}
          style={hc.navBtn}
          activeOpacity={0.75}
        >
          <Navigation size={16} color={C.white} />
          <Text style={hc.navBtnText}>Navigate</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const nh = StyleSheet.create({
  page: { flex: 1 },
  header: { marginBottom: 20 },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: C.s900,
    fontFamily: "Inter, sans-serif",
  },
  sub: {
    fontSize: 14,
    color: C.s500,
    fontWeight: "500",
    marginTop: 4,
    fontFamily: "Inter, sans-serif",
  },

  loadingBox: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.s100,
    borderRadius: 40,
    paddingVertical: 60,
    alignItems: "center",
    gap: 20,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 12,
  },
  pingWrap: {
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  pingRing: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 2,
    borderColor: C.em100,
  },
  pingRing1: { width: 80, height: 80 },
  pingRing2: { width: 56, height: 56 },
  pingCenter: {
    backgroundColor: C.em50,
    width: 72,
    height: 72,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  loadingText: {
    fontSize: 11,
    fontWeight: "900",
    color: C.s400,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontFamily: "Inter, sans-serif",
  },

  errorBox: {
    backgroundColor: C.red50,
    borderWidth: 1,
    borderColor: "#fee2e2",
    borderRadius: 40,
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: "center",
    gap: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#7f1d1d",
    fontFamily: "Inter, sans-serif",
  },
  errorSub: {
    fontSize: 14,
    color: C.red600,
    textAlign: "center",
    fontWeight: "500",
    fontFamily: "Inter, sans-serif",
  },

  emptyBox: {
    backgroundColor: C.white,
    borderRadius: 40,
    paddingVertical: 60,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: C.s100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: C.s900,
    fontFamily: "Inter, sans-serif",
  },
  emptySub: { fontSize: 14, color: C.s400, fontFamily: "Inter, sans-serif" },

  list: { gap: 14 },
});

const hc = StyleSheet.create({
  card: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.s200,
    borderRadius: 28,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
  },
  top: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  info: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    flex: 1,
    marginRight: 10,
  },
  iconWrap: { backgroundColor: C.em50, padding: 14, borderRadius: 18 },
  name: {
    fontSize: 17,
    fontWeight: "900",
    color: C.s900,
    lineHeight: 22,
    fontFamily: "Inter, sans-serif",
  },
  address: {
    fontSize: 13,
    color: C.s500,
    marginTop: 4,
    fontWeight: "500",
    fontFamily: "Inter, sans-serif",
  },
  distanceBadge: {
    backgroundColor: C.em50,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.em100,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: "900",
    color: C.em600,
    fontFamily: "Inter, sans-serif",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: C.s100,
    paddingTop: 16,
  },
  callBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: C.s50,
    paddingVertical: 14,
    borderRadius: 18,
  },
  callBtnText: {
    fontSize: 14,
    fontWeight: "900",
    color: C.s900,
    fontFamily: "Inter, sans-serif",
  },
  navBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: C.em600,
    paddingVertical: 14,
    borderRadius: 18,
    shadowColor: C.em600,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  navBtnText: {
    fontSize: 14,
    fontWeight: "900",
    color: C.white,
    fontFamily: "Inter, sans-serif",
  },
});
