import { useState } from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { X, ChevronLeft, Flame, Settings, Copy, Lock, LogOut } from "lucide-react-native";
import * as Clipboard from "expo-clipboard";
import { COLOR } from "@/constants/theme";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import type { Group } from "@/types";

const FONT_BODY = "Manrope_400Regular";
const FONT_BODY_BOLD = "Manrope_700Bold";
const FONT_BODY_EXTRABOLD = "Manrope_800ExtraBold";
const FONT_MONO_BOLD = "JetBrainsMono_700Bold";

interface GroupsOverlayProps {
  visible: boolean;
  onClose: () => void;
  groups: Group[];
  activeGroupId: string;
  onSwitchGroup: (id: string) => void;
  onOpenSubscribe: () => void;
  onGroupsChanged?: () => void;
}

export default function GroupsOverlay({
  visible,
  onClose,
  groups,
  activeGroupId,
  onSwitchGroup,
  onOpenSubscribe,
  onGroupsChanged,
}: GroupsOverlayProps) {
  const { user } = useAuth();
  const [view, setView] = useState<"list" | "detail">("list");
  const [selected, setSelected] = useState(groups[0]);
  const [copyLabel, setCopyLabel] = useState("복사");

  const handleClose = () => {
    setView("list");
    setCopyLabel("복사");
    onClose();
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(selected.code);
    setCopyLabel("복사됨!");
    setTimeout(() => setCopyLabel("복사"), 2000);
  };

  const handleLeaveOrDelete = () => {
    if (selected.isOwner) {
      Alert.alert(
        "그룹 삭제",
        `"${selected.name}" 그룹을 삭제하면 모든 인증 기록과 멤버가 사라져요. 정말 삭제할까요?`,
        [
          { text: "취소", style: "cancel" },
          {
            text: "삭제하기",
            style: "destructive",
            onPress: async () => {
              const { error } = await supabase
                .from("groups")
                .delete()
                .eq("id", selected.id);
              if (error) {
                Alert.alert("오류", "그룹 삭제에 실패했어요.");
                return;
              }
              onGroupsChanged?.();
              handleClose();
            },
          },
        ]
      );
    } else {
      Alert.alert(
        "그룹 나가기",
        `"${selected.name}" 그룹에서 나갈까요?`,
        [
          { text: "취소", style: "cancel" },
          {
            text: "나가기",
            style: "destructive",
            onPress: async () => {
              if (!user) return;
              const { error } = await supabase
                .from("group_members")
                .delete()
                .eq("group_id", selected.id)
                .eq("user_id", user.id);
              if (error) {
                Alert.alert("오류", "그룹 나가기에 실패했어요.");
                return;
              }
              onGroupsChanged?.();
              handleClose();
            },
          },
        ]
      );
    }
  };

  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={{ flex: 1, backgroundColor: COLOR.concrete }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingTop: insets.top + 4,
            paddingBottom: 12,
            gap: 12,
          }}
        >
          <TouchableOpacity onPress={() => (view === "detail" ? setView("list") : handleClose())} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            {view === "detail" ? (
              <ChevronLeft size={20} color={COLOR.asphalt} />
            ) : (
              <X size={20} color={COLOR.asphalt} />
            )}
          </TouchableOpacity>
          <Text style={{ fontFamily: FONT_BODY_EXTRABOLD, fontSize: 15, color: COLOR.asphalt }}>
            {view === "detail" ? selected.name : "내 그룹"}
          </Text>
        </View>

        {view === "list" && (
          <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 32, paddingHorizontal: 20 }}>
            <Text style={{ fontFamily: FONT_BODY, fontSize: 12, color: COLOR.slate }}>
              탭하면 피드가 전환돼요 · 톱니바퀴는 그룹 관리예요
            </Text>

            {groups.map((g) => (
              <TouchableOpacity
                key={g.id}
                onPress={() => onSwitchGroup(g.id)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderRadius: 16,
                  padding: 16,
                  backgroundColor: COLOR.white,
                  borderWidth: 1.5,
                  borderColor: g.id === activeGroupId ? COLOR.lime : COLOR.concreteDark,
                }}
              >
                <View>
                  <View>
                    <Text style={{ fontFamily: FONT_BODY_EXTRABOLD, fontSize: 15, color: COLOR.asphalt }}>
                      {g.name}
                    </Text>
                    {g.id === activeGroupId && (
                      <View style={{ backgroundColor: COLOR.asphalt, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                        <Text style={{ fontFamily: FONT_BODY_BOLD, fontSize: 9, color: COLOR.lime }}>
                          사용중
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ fontFamily: FONT_BODY, fontSize: 12, color: COLOR.slate }}>
                    {g.members.length}명 참여중
                  </Text>
                </View>

                <View>
                  <View
                    style={{ backgroundColor: COLOR.asphalt }}
                  >
                    <Flame size={13} color={COLOR.lime} />
                    <Text style={{ fontFamily: FONT_MONO_BOLD, color: COLOR.lime, fontSize: 12 }}>
                      {g.streak}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation?.();
                      setSelected(g);
                      setView("detail");
                    }}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: COLOR.concreteDark,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Settings size={14} color={COLOR.slate} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}

            {/* Add group (locked) */}
            <View
              style={{
                borderRadius: 16,
                padding: 16,
                backgroundColor: COLOR.white,
                borderWidth: 1.5,
                borderStyle: "dashed",
                borderColor: COLOR.slate,
              }}
            >
              <View>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: COLOR.concreteDark, alignItems: "center", justifyContent: "center" }}>
                  <Lock size={15} color={COLOR.slate} />
                </View>
                <View>
                  <Text style={{ fontFamily: FONT_BODY_BOLD, fontSize: 13, color: COLOR.asphalt }}>
                    그룹 추가하기
                  </Text>
                  <Text style={{ fontFamily: FONT_BODY, fontSize: 11, color: COLOR.slate }}>
                    무료 플랜은 그룹 1개까지예요
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={onOpenSubscribe}
                style={{
                  marginTop: 12,
                  paddingVertical: 10,
                  borderRadius: 12,
                  backgroundColor: COLOR.lime,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontFamily: FONT_BODY_EXTRABOLD, fontSize: 12, color: COLOR.asphalt }}>
                  월 1,500원으로 그룹 추가
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {view === "detail" && (
          <ScrollView contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: 20 }}>
            {/* Invite code */}
            <View style={{ borderRadius: 16, padding: 16, backgroundColor: COLOR.asphalt }}>
              <Text style={{ fontFamily: FONT_BODY_BOLD, fontSize: 11, color: COLOR.slate }}>
                초대코드
              </Text>
              <View>
                <Text style={{ fontFamily: FONT_MONO_BOLD, fontSize: 22, color: COLOR.lime, letterSpacing: 2 }}>
                  {selected.code}
                </Text>
                <TouchableOpacity
                  onPress={handleCopy}
                  style={{ backgroundColor: "#2A2B2E", flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}
                >
                  <Copy size={13} color={copyLabel === "복사됨!" ? COLOR.lime : COLOR.white} />
                  <Text style={{ fontFamily: FONT_BODY_BOLD, fontSize: 11, color: copyLabel === "복사됨!" ? COLOR.lime : COLOR.white }}>
                    {copyLabel}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Members */}
            <Text style={{ fontFamily: FONT_BODY_BOLD, fontSize: 11, color: COLOR.slate, marginTop: 20 }}>
              멤버 {selected.members.length}명
            </Text>
            <View style={{ gap: 8, marginTop: 8 }}>
              {selected.members.map((m, i) => (
                <View
                  key={i}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    backgroundColor: COLOR.white,
                  }}
                >
                  <View>
                    <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: m.color }} />
                    <Text style={{ fontFamily: FONT_BODY_BOLD, fontSize: 14, color: COLOR.asphalt }}>
                      {m.name}
                    </Text>
                  </View>
                  {m.isOwner && (
                    <View style={{ backgroundColor: COLOR.concreteDark, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
                      <Text style={{ fontFamily: FONT_BODY_BOLD, fontSize: 10, color: COLOR.slate }}>
                        크루장
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>

            {/* Actions */}
            <View style={{ gap: 8, marginTop: 24 }}>
              {selected.isOwner && (
                <TouchableOpacity
                  style={{
                    paddingVertical: 12,
                    borderRadius: 12,
                    alignItems: "center",
                    backgroundColor: COLOR.white,
                    borderWidth: 1.5,
                    borderColor: COLOR.concreteDark,
                  }}
                >
                  <Text style={{ fontFamily: FONT_BODY_BOLD, fontSize: 13, color: COLOR.asphalt }}>
                    그룹 이름 변경
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={handleLeaveOrDelete}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  paddingVertical: 12,
                  borderRadius: 12,
                }}
              >
                <LogOut size={15} color={COLOR.red} />
                <Text style={{ fontFamily: FONT_BODY_BOLD, fontSize: 13, color: COLOR.red }}>
                  {selected.isOwner ? "그룹 삭제하기" : "그룹 나가기"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}
