import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Settings, Users, ChevronLeft } from "lucide-react-native";
import { COLOR } from "@/constants/theme";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import type { Group } from "@/types";
import SettingsOverlay from "@/components/modals/SettingsOverlay";
import SubscribeOverlay from "@/components/modals/SubscribeOverlay";
import GroupsOverlay from "@/components/modals/GroupsOverlay";

const FONT_DISPLAY = "BebasNeue_400Regular";
const FONT_BODY = "Manrope_400Regular";
const FONT_BODY_BOLD = "Manrope_700Bold";
const FONT_BODY_EXTRABOLD = "Manrope_800ExtraBold";

interface BadgeItem {
  code: string;
  name: string;
}

interface UserData {
  nickname: string;
  avatarColor: string;
  currentStreak: number;
  longestStreak: number;
  badges: BadgeItem[];
}

export default function MyPageScreen() {
  const { user } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [groupsOpen, setGroupsOpen] = useState(false);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;

    const [userRow, streakRow, badgeRows] = await Promise.all([
      supabase
        .from("users")
        .select("nickname, avatar_color")
        .eq("id", user.id)
        .single(),
      supabase
        .from("streaks")
        .select("current_streak, longest_streak")
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("user_badges")
        .select("badges(code, name)")
        .eq("user_id", user.id),
    ]);

    const badges: BadgeItem[] = (badgeRows.data ?? [])
      .map((row) => row.badges as { code: string; name: string } | null)
      .filter((b): b is BadgeItem => !!b);

    setUserData({
      nickname: userRow.data?.nickname ?? "",
      avatarColor: userRow.data?.avatar_color ?? COLOR.lime,
      currentStreak: streakRow.data?.current_streak ?? 0,
      longestStreak: streakRow.data?.longest_streak ?? 0,
      badges,
    });
  }, [user]);

  const loadGroups = useCallback(async () => {
    if (!user) return;
    const { data: memberships } = await supabase
      .from("group_members")
      .select("group_id, role, groups(id, name, invite_code, owner_id)")
      .eq("user_id", user.id);
    if (!memberships?.length) { setMyGroups([]); return; }
    const groupIds = memberships.map((m) => (m.groups as { id: string } | null)?.id).filter((id): id is string => !!id);
    const { data: allMembers } = await supabase
      .from("group_members")
      .select("group_id, user_id, role, users(nickname, avatar_color)")
      .in("group_id", groupIds);
    const built: Group[] = memberships.map((membership) => {
      const g = membership.groups as { id: string; name: string; invite_code: string; owner_id: string } | null;
      if (!g) return null;
      const members = (allMembers ?? [])
        .filter((m) => m.group_id === g.id)
        .map((m) => {
          const u = m.users as { nickname: string; avatar_color: string } | null;
          return { id: m.user_id, name: u?.nickname ?? "?", color: u?.avatar_color ?? COLOR.slate, isOwner: g.owner_id === m.user_id };
        });
      return { id: g.id, name: g.name, code: g.invite_code, isOwner: g.owner_id === user.id, streak: 0, members };
    }).filter((g): g is Group => g !== null);
    setMyGroups(built);
  }, [user]);

  const handleOpenGroups = useCallback(async () => {
    await loadGroups();
    setGroupsOpen(true);
  }, [loadGroups]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (!userData) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.concrete, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color={COLOR.asphalt} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.concrete }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLOR.asphalt} />
        }
      >
        {/* Header */}
        <View
          style={{
            paddingTop: 16,
            paddingBottom: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            {/* Avatar */}
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: userData.avatarColor,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontFamily: FONT_DISPLAY, fontSize: 16, color: COLOR.asphalt }}>
                {userData.nickname ? userData.nickname[0] : "?"}
              </Text>
            </View>
            <View>
              <Text style={{ fontFamily: FONT_BODY, fontSize: 11, color: COLOR.slate }}>
                안녕하세요
              </Text>
              <Text style={{ fontFamily: FONT_BODY_EXTRABOLD, fontSize: 15, color: COLOR.asphalt }}>
                {userData.nickname}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => setSettingsOpen(true)}>
            <Settings size={20} color={COLOR.asphalt} />
          </TouchableOpacity>
        </View>

        {/* Streak card */}
        <View
          style={{
            backgroundColor: COLOR.asphalt,
            borderRadius: 20,
            padding: 24,
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Text style={{ fontFamily: FONT_BODY_BOLD, fontSize: 11, color: COLOR.slate, letterSpacing: 1 }}>
            연속 인증
          </Text>
          <Text
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 96,
              color: COLOR.lime,
              lineHeight: 92,
              marginTop: 4,
            }}
          >
            {userData.currentStreak}
          </Text>
          <Text style={{ fontFamily: FONT_BODY, fontSize: 13, color: COLOR.white, marginTop: 4 }}>
            일째 이어가는 중
          </Text>
          {userData.longestStreak > 0 && (
            <Text style={{ fontFamily: FONT_BODY, fontSize: 11, color: COLOR.slate, marginTop: 8 }}>
              최고 기록 {userData.longestStreak}일
            </Text>
          )}
        </View>

        {/* Badges */}
        <Text style={{ fontFamily: FONT_BODY_BOLD, fontSize: 11, color: COLOR.slate, marginBottom: 8 }}>
          획득 배지
        </Text>
        {userData.badges.length === 0 ? (
          <View
            style={{
              borderRadius: 16,
              padding: 20,
              backgroundColor: COLOR.white,
              borderWidth: 1.5,
              borderColor: COLOR.concreteDark,
              borderStyle: "dashed",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text style={{ fontFamily: FONT_BODY, fontSize: 12, color: COLOR.slate }}>
              아직 획득한 배지가 없어요
            </Text>
            <Text style={{ fontFamily: FONT_BODY, fontSize: 11, color: COLOR.slate, marginTop: 4 }}>
              인증을 계속하면 배지가 쌓여요
            </Text>
          </View>
        ) : (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 16,
            }}
          >
            {userData.badges.map((b) => (
              <View
                key={b.code}
                style={{
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  alignItems: "center",
                  backgroundColor: COLOR.white,
                  borderWidth: 1,
                  borderColor: COLOR.concreteDark,
                }}
              >
                <Text style={{ fontFamily: FONT_BODY_BOLD, fontSize: 12, color: COLOR.asphalt }}>
                  {b.name}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Group management */}
        <TouchableOpacity
          onPress={handleOpenGroups}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 16,
            backgroundColor: COLOR.white,
            borderWidth: 1.5,
            borderColor: COLOR.concreteDark,
            marginBottom: 16,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Users size={18} color={COLOR.asphalt} />
            <Text style={{ fontFamily: FONT_BODY_BOLD, fontSize: 14, color: COLOR.asphalt }}>
              내 그룹 관리
            </Text>
          </View>
          <ChevronLeft size={16} color={COLOR.slate} style={{ transform: [{ rotate: "180deg" }] }} />
        </TouchableOpacity>

        {/* Subscription upsell */}
        <View
          style={{
            borderRadius: 12,
            padding: 16,
            backgroundColor: COLOR.white,
            borderWidth: 1.5,
            borderColor: COLOR.concreteDark,
          }}
        >
          <Text style={{ fontFamily: FONT_BODY_EXTRABOLD, fontSize: 14, color: COLOR.asphalt }}>
            무료 플랜 이용중
          </Text>
          <View style={{ marginTop: 8, gap: 4 }}>
            {["그룹 최대 5명", "사진 하루 1회 · 720p", "그룹 내 랭킹만 확인 가능"].map((t) => (
              <Text key={t} style={{ fontFamily: FONT_BODY, fontSize: 12, color: COLOR.slate }}>
                · {t}
              </Text>
            ))}
          </View>
          <TouchableOpacity
            onPress={() => setSubscribeOpen(true)}
            style={{
              marginTop: 16,
              paddingVertical: 12,
              borderRadius: 12,
              backgroundColor: COLOR.lime,
              alignItems: "center",
            }}
          >
            <Text style={{ fontFamily: FONT_BODY_EXTRABOLD, fontSize: 13, color: COLOR.asphalt }}>
              월 1,500원으로 구독하기
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <GroupsOverlay
        visible={groupsOpen}
        onClose={() => setGroupsOpen(false)}
        groups={myGroups}
        activeGroupId={myGroups[0]?.id ?? ""}
        onSwitchGroup={() => setGroupsOpen(false)}
        onOpenSubscribe={() => { setGroupsOpen(false); setSubscribeOpen(true); }}
        onGroupsChanged={() => { setGroupsOpen(false); loadGroups(); }}
      />
      <SettingsOverlay
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        initialNickname={userData.nickname}
        initialAvatarColor={userData.avatarColor}
        onProfileUpdated={(nickname, avatarColor) => {
          setUserData((prev) => prev ? { ...prev, nickname, avatarColor } : prev);
        }}
      />
      <SubscribeOverlay visible={subscribeOpen} onClose={() => setSubscribeOpen(false)} />
    </SafeAreaView>
  );
}
