import { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X, ChevronLeft } from "lucide-react-native";
import { COLOR, AVATAR_COLORS } from "@/constants/theme";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const FONT_BODY = "Manrope_400Regular";
const FONT_BODY_BOLD = "Manrope_700Bold";
const FONT_BODY_EXTRABOLD = "Manrope_800ExtraBold";
const FONT_DISPLAY = "BebasNeue_400Regular";

interface SettingsOverlayProps {
  visible: boolean;
  onClose: () => void;
  initialNickname?: string;
  initialAvatarColor?: string;
  onProfileUpdated?: (nickname: string, avatarColor: string) => void;
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        backgroundColor: on ? COLOR.lime : COLOR.concreteDark,
        justifyContent: "center",
        padding: 2,
      }}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: on ? COLOR.asphalt : COLOR.white,
          marginLeft: on ? 20 : 0,
        }}
      />
    </TouchableOpacity>
  );
}

export default function SettingsOverlay({
  visible,
  onClose,
  initialNickname = "",
  initialAvatarColor = AVATAR_COLORS[0],
  onProfileUpdated,
}: SettingsOverlayProps) {
  const { user, signOut } = useAuth();

  const [view, setView] = useState<"main" | "editProfile">("main");
  const [nickname, setNickname] = useState(initialNickname);
  const [avatarColor, setAvatarColor] = useState(initialAvatarColor);
  const [toggles, setToggles] = useState({ daily: true, group: true, challenge: false });
  const [saving, setSaving] = useState(false);
  const insets = useSafeAreaInsets();

  // Sync when props change (modal opens with fresh data)
  const handleOpen = () => {
    setNickname(initialNickname);
    setAvatarColor(initialAvatarColor);
    setView("main");
  };

  const handleClose = () => {
    setView("main");
    onClose();
  };

  const handleSaveProfile = async () => {
    if (!user || !nickname.trim()) return;
    setSaving(true);
    const { error } = await supabase
      .from("users")
      .update({ nickname: nickname.trim(), avatar_color: avatarColor })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      Alert.alert("오류", "저장에 실패했어요.");
      return;
    }
    onProfileUpdated?.(nickname.trim(), avatarColor);
    setView("main");
  };

  const handleSignOut = async () => {
    await signOut();
    handleClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onShow={handleOpen}
    >
      <View style={{ flex: 1, backgroundColor: COLOR.concrete }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingTop: insets.top + 4,
            paddingBottom: 12,
          }}
        >
          <TouchableOpacity onPress={() => (view === "editProfile" ? setView("main") : handleClose())} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            {view === "editProfile" ? (
              <ChevronLeft size={20} color={COLOR.asphalt} />
            ) : (
              <X size={20} color={COLOR.asphalt} />
            )}
          </TouchableOpacity>
          <Text style={{ fontFamily: FONT_BODY_EXTRABOLD, fontSize: 15, color: COLOR.asphalt }}>
            {view === "editProfile" ? "프로필 편집" : "설정"}
          </Text>
          <View style={{ width: 20 }} />
        </View>

        {view === "main" && (
          <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}>
            {/* Profile button */}
            <TouchableOpacity
              onPress={() => setView("editProfile")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 16,
                borderRadius: 16,
                padding: 16,
                backgroundColor: COLOR.white,
                borderWidth: 1.5,
                borderColor: COLOR.concreteDark,
              }}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: avatarColor,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontFamily: FONT_DISPLAY, fontSize: 22, color: COLOR.asphalt }}>
                  {nickname ? nickname[0] : "?"}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONT_BODY_EXTRABOLD, fontSize: 15, color: COLOR.asphalt }}>
                  {nickname || "닉네임 없음"}
                </Text>
                <Text style={{ fontFamily: FONT_BODY, fontSize: 12, color: COLOR.slate }}>
                  프로필 수정
                </Text>
              </View>
              <ChevronLeft size={16} color={COLOR.slate} style={{ transform: [{ rotate: "180deg" }] }} />
            </TouchableOpacity>

            {/* Notifications */}
            <Text style={{ fontFamily: FONT_BODY_BOLD, fontSize: 11, color: COLOR.slate, marginTop: 24 }}>
              알림
            </Text>
            <View
              style={{
                marginTop: 8,
                borderRadius: 16,
                overflow: "hidden",
                backgroundColor: COLOR.white,
                borderWidth: 1.5,
                borderColor: COLOR.concreteDark,
              }}
            >
              {[
                { key: "daily" as const, label: "매일 인증 리마인더" },
                { key: "group" as const, label: "그룹원 인증 알림" },
                { key: "challenge" as const, label: "챌린지 소식" },
              ].map((t, i, arr) => (
                <View
                  key={t.key}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderBottomWidth: i < arr.length - 1 ? 1 : 0,
                    borderBottomColor: COLOR.concreteDark,
                  }}
                >
                  <Text style={{ fontFamily: FONT_BODY, fontSize: 13, color: COLOR.asphalt }}>
                    {t.label}
                  </Text>
                  <Toggle
                    on={toggles[t.key]}
                    onToggle={() => setToggles((s) => ({ ...s, [t.key]: !s[t.key] }))}
                  />
                </View>
              ))}
            </View>

            {/* Account */}
            <Text style={{ fontFamily: FONT_BODY_BOLD, fontSize: 11, color: COLOR.slate, marginTop: 24 }}>
              계정
            </Text>
            <View
              style={{
                marginTop: 8,
                borderRadius: 16,
                overflow: "hidden",
                backgroundColor: COLOR.white,
                borderWidth: 1.5,
                borderColor: COLOR.concreteDark,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderBottomWidth: 1,
                  borderBottomColor: COLOR.concreteDark,
                }}
              >
                <Text style={{ fontFamily: FONT_BODY, fontSize: 13, color: COLOR.asphalt }}>
                  구독 관리
                </Text>
                <View
                  style={{
                    backgroundColor: COLOR.concreteDark,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 4,
                  }}
                >
                  <Text style={{ fontFamily: FONT_BODY_BOLD, fontSize: 10, color: COLOR.slate }}>
                    무료 플랜
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={handleSignOut}
                style={{ paddingHorizontal: 16, paddingVertical: 14 }}
              >
                <Text style={{ fontFamily: FONT_BODY, fontSize: 13, color: COLOR.asphalt }}>
                  로그아웃
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={{ paddingVertical: 8, alignItems: "center", marginTop: 16 }}>
              <Text style={{ fontFamily: FONT_BODY, fontSize: 12, color: COLOR.red }}>
                회원 탈퇴
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {view === "editProfile" && (
          <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}>
            <View style={{ alignItems: "center", marginTop: 8 }}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: avatarColor,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontFamily: FONT_DISPLAY, fontSize: 30, color: COLOR.asphalt }}>
                  {nickname ? nickname[0] : "?"}
                </Text>
              </View>
            </View>

            <TextInput
              value={nickname}
              onChangeText={setNickname}
              maxLength={8}
              style={{
                marginTop: 24,
                paddingHorizontal: 16,
                paddingVertical: 16,
                borderRadius: 16,
                textAlign: "center",
                backgroundColor: COLOR.white,
                borderWidth: 1.5,
                borderColor: COLOR.concreteDark,
                fontFamily: FONT_BODY_BOLD,
                fontSize: 15,
                color: COLOR.asphalt,
              }}
            />

            <View style={{ flexDirection: "row", justifyContent: "center", gap: 12, marginTop: 20 }}>
              {AVATAR_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setAvatarColor(c)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: c,
                    borderWidth: 2.5,
                    borderColor: avatarColor === c ? COLOR.asphalt : "transparent",
                  }}
                />
              ))}
            </View>

            <TouchableOpacity
              onPress={handleSaveProfile}
              disabled={saving || !nickname.trim()}
              style={{
                marginTop: 32,
                paddingVertical: 16,
                borderRadius: 16,
                backgroundColor: COLOR.lime,
                alignItems: "center",
                opacity: !nickname.trim() ? 0.4 : 1,
              }}
            >
              {saving ? (
                <ActivityIndicator color={COLOR.asphalt} />
              ) : (
                <Text style={{ fontFamily: FONT_BODY_EXTRABOLD, fontSize: 15, color: COLOR.asphalt }}>
                  저장하기
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}
