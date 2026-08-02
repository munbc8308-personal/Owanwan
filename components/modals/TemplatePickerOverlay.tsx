import { useState } from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X, ChevronLeft } from "lucide-react-native";
import { COLOR, SPORT_LABEL } from "@/constants/theme";
import type { ChallengeTemplate } from "@/types";

const FONT_DISPLAY = "BebasNeue_400Regular";
const FONT_BODY = "Manrope_400Regular";
const FONT_BODY_BOLD = "Manrope_700Bold";
const FONT_BODY_EXTRABOLD = "Manrope_800ExtraBold";
const FONT_MONO_BOLD = "JetBrainsMono_700Bold";

interface TemplatePickerOverlayProps {
  templates: ChallengeTemplate[];
  groupName: string;
  onClose: () => void;
  onStart: (template: ChallengeTemplate) => Promise<void>;
}

export default function TemplatePickerOverlay({ templates, groupName, onClose, onStart }: TemplatePickerOverlayProps) {
  const [selected, setSelected] = useState<ChallengeTemplate | null>(null);
  const [starting, setStarting] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <Modal visible animationType="slide" presentationStyle="fullScreen">
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
          <TouchableOpacity onPress={() => (selected ? setSelected(null) : onClose())} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            {selected ? (
              <ChevronLeft size={20} color={COLOR.asphalt} />
            ) : (
              <X size={20} color={COLOR.asphalt} />
            )}
          </TouchableOpacity>
          <Text style={{ fontFamily: FONT_BODY_EXTRABOLD, fontSize: 15, color: COLOR.asphalt }}>
            {selected ? "템플릿 미리보기" : "템플릿 고르기"}
          </Text>
        </View>

        {!selected ? (
          <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 32, paddingHorizontal: 20 }}>
            <Text style={{ fontFamily: FONT_BODY, fontSize: 12, color: COLOR.slate }}>
              정해진 규칙 그대로, 바로 우리 그룹에 시작할 수 있어요.
            </Text>
            {templates.map((t) => (
              <TouchableOpacity
                key={t.id}
                onPress={() => setSelected(t)}
                style={{
                  borderRadius: 12,
                  padding: 16,
                  backgroundColor: COLOR.white,
                  borderWidth: 1.5,
                  borderColor: COLOR.concreteDark,
                }}
              >
                <View>
                  <View style={{ backgroundColor: COLOR.concreteDark, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                    <Text style={{ fontFamily: FONT_BODY_BOLD, fontSize: 9, color: COLOR.slate }}>
                      {SPORT_LABEL[t.sport]}
                    </Text>
                  </View>
                  <Text style={{ fontFamily: FONT_BODY_EXTRABOLD, fontSize: 14, color: COLOR.asphalt }}>
                    {t.title}
                  </Text>
                </View>
                <Text style={{ fontFamily: FONT_BODY, fontSize: 12, color: COLOR.slate, marginTop: 4 }}>
                  {t.desc}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <>
            <ScrollView contentContainerStyle={{ paddingBottom: 16, paddingHorizontal: 20 }}>
              <Text style={{ fontFamily: FONT_DISPLAY, fontSize: 28, color: COLOR.asphalt }}>
                {selected.title}
              </Text>
              <Text style={{ fontFamily: FONT_BODY, fontSize: 13, color: COLOR.slate, lineHeight: 20, marginTop: 8 }}>
                {selected.desc}
              </Text>
              <View style={{ alignSelf: "flex-start", marginTop: 12, backgroundColor: COLOR.asphalt, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 }}>
                <Text style={{ fontFamily: FONT_MONO_BOLD, fontSize: 11, color: COLOR.lime }}>
                  {selected.period}
                </Text>
              </View>

              <Text style={{ fontFamily: FONT_BODY_BOLD, fontSize: 11, color: COLOR.slate, marginTop: 24 }}>
                규칙
              </Text>
              <View style={{ gap: 8, marginTop: 8 }}>
                {selected.rules.map((r, i) => (
                  <View key={i} style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
                    <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: COLOR.slate, marginTop: 8 }} />
                    <Text style={{ fontFamily: FONT_BODY, fontSize: 13, color: COLOR.asphalt, lineHeight: 20, flex: 1 }}>
                      {r}
                    </Text>
                  </View>
                ))}
              </View>

              <Text style={{ fontFamily: FONT_BODY, fontSize: 11, color: COLOR.slate, marginTop: 16 }}>
                {groupName}에 바로 적용돼요 · 규칙은 정해진 대로만 사용할 수 있어요
              </Text>
            </ScrollView>

            <View style={{ paddingHorizontal: 20, paddingBottom: 24, paddingTop: 8 }}>
              <TouchableOpacity
                disabled={starting}
                onPress={async () => {
                  setStarting(true);
                  await onStart(selected);
                  setStarting(false);
                }}
                style={{
                  paddingVertical: 16,
                  borderRadius: 16,
                  backgroundColor: COLOR.lime,
                  alignItems: "center",
                  opacity: starting ? 0.6 : 1,
                }}
              >
                {starting
                  ? <ActivityIndicator color={COLOR.asphalt} />
                  : <Text style={{ fontFamily: FONT_BODY_EXTRABOLD, fontSize: 15, color: COLOR.asphalt }}>
                      이 템플릿으로 시작하기
                    </Text>
                }
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}
