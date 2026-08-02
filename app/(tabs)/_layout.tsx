import { Tabs } from "expo-router";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { Camera, Users, Trophy, Flame, User } from "lucide-react-native";
import { COLOR } from "@/constants/theme";
import { useState, useEffect, useCallback } from "react";
import UploadModal, { type UploadModalGroup } from "@/components/modals/UploadModal";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const FONT_BODY_BOLD = "Manrope_700Bold";

const TAB_ITEMS = [
  { key: "feed", label: "피드", icon: Users },
  { key: "challenge", label: "챌린지", icon: Trophy },
  { key: "ranking", label: "랭킹", icon: Flame },
  { key: "mypage", label: "MY", icon: User },
];

export default function TabLayout() {
  const { user } = useAuth();
  const [uploadVisible, setUploadVisible] = useState(false);
  const [groups, setGroups] = useState<UploadModalGroup[]>([]);

  const loadGroups = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("group_members")
      .select("group_id, groups(id, name)")
      .eq("user_id", user.id);
    const g: UploadModalGroup[] = (data ?? [])
      .map((m) => m.groups as { id: string; name: string } | null)
      .filter((g): g is { id: string; name: string } => !!g)
      .map((g) => ({ id: g.id, name: g.name }));
    setGroups(g);
  }, [user]);

  useEffect(() => { loadGroups(); }, [loadGroups]);

  // Refresh groups every time the upload modal opens
  useEffect(() => {
    if (uploadVisible) loadGroups();
  }, [uploadVisible]);

  return (
    <>
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={(props) => (
          <CustomTabBar {...props} onUpload={() => setUploadVisible(true)} />
        )}
      >
        <Tabs.Screen name="feed" />
        <Tabs.Screen name="challenge" />
        <Tabs.Screen name="ranking" />
        <Tabs.Screen name="mypage" />
      </Tabs>
      <UploadModal
        visible={uploadVisible}
        onClose={() => setUploadVisible(false)}
        defaultGroupId={groups[0]?.id ?? ""}
        groups={groups}
      />
    </>
  );
}

function CustomTabBar({
  state,
  navigation,
  onUpload,
}: {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: { navigate: (name: string) => void };
  onUpload: () => void;
}) {
  const LEFT_TABS = TAB_ITEMS.slice(0, 2);
  const RIGHT_TABS = TAB_ITEMS.slice(2);

  const renderTab = (item: typeof TAB_ITEMS[number]) => {
    const Icon = item.icon;
    const active = state.routes[state.index]?.name === item.key;
    return (
      <TouchableOpacity
        key={item.key}
        onPress={() => navigation.navigate(item.key)}
        style={{ flex: 1, alignItems: "center", gap: 4, opacity: active ? 1 : 0.4 }}
      >
        <Icon size={20} color={COLOR.asphalt} />
        <Text style={{ fontFamily: FONT_BODY_BOLD, fontSize: 10, color: COLOR.asphalt }}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={{
        backgroundColor: COLOR.white,
        borderTopWidth: 1,
        borderTopColor: COLOR.concreteDark,
        paddingBottom: Platform.OS === "ios" ? 24 : 12,
        paddingTop: 20,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "flex-start",
      }}
    >
      {/* Left tabs */}
      <View style={{ flex: 1, flexDirection: "row" }}>
        {LEFT_TABS.map(renderTab)}
      </View>

      {/* FAB — exact center column */}
      <View style={{ width: 64, alignItems: "center" }}>
        <TouchableOpacity
          onPress={onUpload}
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: COLOR.lime,
            borderWidth: 3,
            borderColor: COLOR.concrete,
            alignItems: "center",
            justifyContent: "center",
            elevation: 8,
            marginTop: -28,
          }}
        >
          <Camera size={26} color={COLOR.asphalt} />
        </TouchableOpacity>
      </View>

      {/* Right tabs */}
      <View style={{ flex: 1, flexDirection: "row" }}>
        {RIGHT_TABS.map(renderTab)}
      </View>
    </View>
  );
}
