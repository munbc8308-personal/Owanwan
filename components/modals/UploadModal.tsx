import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { X, Users, ImagePlus } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { COLOR, SPORT_LABEL } from "@/constants/theme";
import PostageStamp from "@/components/ui/PostageStamp";
import RouteMap from "@/components/ui/RouteMap";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

const FONT_DISPLAY = "BebasNeue_400Regular";
const FONT_BODY = "Manrope_400Regular";
const FONT_BODY_BOLD = "Manrope_700Bold";
const FONT_BODY_EXTRABOLD = "Manrope_800ExtraBold";
const FONT_MONO_BOLD = "JetBrainsMono_700Bold";

type SportKey = "running" | "gym" | "etc";

interface RunningForm { distance: string; pace: string; duration: string }
interface GymForm { part: string; weight: string; sets: string }
interface EtcForm { activity: string; duration: string }

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Text style={{ fontFamily: FONT_MONO_BOLD, fontSize: 15, color: "#FAFAF8" }}>
        {value || "—"}
      </Text>
      <Text style={{ fontFamily: FONT_BODY, fontSize: 10, color: COLOR.slate, marginTop: 2 }}>
        {label}
      </Text>
    </View>
  );
}

function FieldInput({
  label,
  value,
  onChange,
  placeholder,
  keyboardType = "default",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  keyboardType?: "default" | "decimal-pad";
}) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontFamily: FONT_BODY, fontSize: 10, color: COLOR.slate, marginBottom: 4 }}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#555"
        keyboardType={keyboardType}
        style={{
          backgroundColor: "#2A2B2E",
          borderRadius: 8,
          paddingHorizontal: 10,
          paddingVertical: 8,
          fontFamily: FONT_MONO_BOLD,
          fontSize: 13,
          color: COLOR.white,
          borderWidth: 1,
          borderColor: value ? COLOR.lime : "#3A3B3E",
        }}
      />
    </View>
  );
}

export interface UploadModalGroup {
  id: string;
  name: string;
}

interface UploadModalProps {
  visible: boolean;
  onClose: () => void;
  defaultGroupId: string;
  groups: UploadModalGroup[];
  onPosted?: () => void;
}

export default function UploadModal({
  visible,
  onClose,
  defaultGroupId,
  groups,
  onPosted,
}: UploadModalProps) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [sport, setSport] = useState<SportKey>("running");
  const [groupId, setGroupId] = useState(defaultGroupId);

  // Sync groupId when defaultGroupId loads (groups fetch is async)
  useEffect(() => {
    if (defaultGroupId && !groupId) setGroupId(defaultGroupId);
  }, [defaultGroupId]);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [stamped, setStamped] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [alreadyPostedToday, setAlreadyPostedToday] = useState(false);

  // Per-sport stats state
  const [running, setRunning] = useState<RunningForm>({ distance: "", pace: "", duration: "" });
  const [gym, setGym] = useState<GymForm>({ part: "", weight: "", sets: "" });
  const [etc, setEtc] = useState<EtcForm>({ activity: "", duration: "" });

  // Check daily duplicate when modal opens or group changes
  useEffect(() => {
    if (!visible || !user || !groupId) return;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    supabase
      .from("posts")
      .select("id")
      .eq("user_id", user.id)
      .eq("group_id", groupId)
      .gte("created_at", todayStart.toISOString())
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setAlreadyPostedToday(!!data));
  }, [visible, user, groupId]);

  const targetGroup = groups.find((g) => g.id === groupId) ?? groups[0];

  const stampLabel = (() => {
    const now = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false });
    if (sport === "running") return `${now} · ${running.distance || "?km"} · ${running.pace || "?'??\""}`;
    if (sport === "gym") return `${now} · ${gym.part || "?"} ${gym.weight || "?kg"}×${gym.sets || "?set"}`;
    return `${now} · ${etc.activity || "?"} ${etc.duration || "?분"}`;
  })();

  const handlePickPhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("권한 필요", "사진 접근 권한이 필요해요.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  }, []);

  const handleTakePhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("권한 필요", "카메라 접근 권한이 필요해요.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  }, []);

  const buildStats = () => {
    if (sport === "running") return running;
    if (sport === "gym") return gym;
    return etc;
  };

  const handleSubmit = useCallback(async () => {
    if (!user) return;
    if (!targetGroup) {
      Alert.alert("오류", "그룹 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.");
      return;
    }
    setUploading(true);

    try {
      let photoUrl: string | null = null;

      if (photoUri) {
        // Resize to 720px max dimension
        const resized = await ImageManipulator.manipulateAsync(
          photoUri,
          [{ resize: { width: 720 } }],
          { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
        );

        const response = await fetch(resized.uri);
        const arrayBuffer = await response.arrayBuffer();

        const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const filename = `${user.id}/${date}/${generateUUID()}.jpg`;

        const { error: uploadError } = await supabase.storage
          .from("posts")
          .upload(filename, arrayBuffer, { contentType: "image/jpeg" });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("posts")
          .getPublicUrl(filename);
        photoUrl = urlData?.publicUrl ?? null;
      }

      const { error: postError } = await supabase.from("posts").insert({
        user_id: user.id,
        group_id: targetGroup.id,
        sport,
        photo_url: photoUrl,
        stats: buildStats() as unknown as Record<string, string>,
      });

      if (postError) {
        if (postError.code === "23505") {
          Alert.alert("이미 인증했어요", "오늘은 이미 이 그룹에 인증했어요.");
          setAlreadyPostedToday(true);
          return;
        }
        throw postError;
      }

      await supabase.rpc("update_streak_on_post");
      await supabase.rpc("check_and_award_badges");

      setStamped(true);
      onPosted?.();
      setTimeout(() => handleClose(), 2000);
    } catch (err) {
      Alert.alert("오류", "인증 업로드에 실패했어요. 다시 시도해주세요.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  }, [user, targetGroup, sport, photoUri, running, gym, etc]);

  const handleClose = () => {
    setStamped(false);
    setSport("running");
    setPhotoUri(null);
    setAlreadyPostedToday(false);
    setRunning({ distance: "", pace: "", duration: "" });
    setGym({ part: "", weight: "", sets: "" });
    setEtc({ activity: "", duration: "" });
    onClose();
  };

  const canSubmit = (() => {
    if (alreadyPostedToday) return false;
    if (!photoUri) return false;
    if (sport === "running") return !!(running.distance && running.pace);
    if (sport === "gym") return !!(gym.part && gym.weight && gym.sets);
    return !!(etc.activity && etc.duration);
  })();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={{ flex: 1, backgroundColor: COLOR.asphalt }}>
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
          <TouchableOpacity onPress={handleClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <X size={22} color={COLOR.white} />
          </TouchableOpacity>
          <Text style={{ fontFamily: FONT_BODY_BOLD, color: COLOR.white, fontSize: 13 }}>
            오늘의 인증
          </Text>
          <View style={{ width: 22 }} />
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Group selector */}
          {groups.length > 1 && (
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
              {groups.map((g) => (
                <TouchableOpacity
                  key={g.id}
                  onPress={() => setGroupId(g.id)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: groupId === g.id ? "#2A2B2E" : "transparent",
                    borderWidth: 1.5,
                    borderColor: groupId === g.id ? COLOR.lime : "#3A3B3E",
                  }}
                >
                  <Users size={12} color={groupId === g.id ? COLOR.lime : COLOR.slate} />
                  <Text
                    style={{
                      fontFamily: FONT_BODY_BOLD,
                      fontSize: 12,
                      color: groupId === g.id ? COLOR.lime : COLOR.slate,
                    }}
                  >
                    {g.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Sport selector */}
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 20 }}>
            {(["running", "gym", "etc"] as SportKey[]).map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => setSport(s)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: sport === s ? COLOR.lime : "transparent",
                  borderWidth: 1.5,
                  borderColor: sport === s ? COLOR.lime : "#3A3B3E",
                }}
              >
                <Text
                  style={{
                    fontFamily: FONT_BODY_BOLD,
                    fontSize: 12,
                    color: sport === s ? COLOR.asphalt : COLOR.slate,
                  }}
                >
                  {SPORT_LABEL[s]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Photo picker */}
          <TouchableOpacity
            onPress={handlePickPhoto}
            style={{
              aspectRatio: 1,
              borderRadius: 16,
              overflow: "hidden",
              backgroundColor: "#2A2B2E",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            {photoUri ? (
              <>
                <Image
                  source={{ uri: photoUri }}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
                {stamped && (
                  <View style={{ position: "absolute", top: 24, left: 24 }}>
                    <PostageStamp animated>{stampLabel}</PostageStamp>
                  </View>
                )}
              </>
            ) : (
              <View style={{ alignItems: "center", gap: 12 }}>
                <ImagePlus size={36} color={COLOR.slate} />
                <Text style={{ fontFamily: FONT_BODY, fontSize: 13, color: COLOR.slate }}>
                  사진을 선택하거나 찍어주세요
                </Text>
                <TouchableOpacity
                  onPress={handleTakePhoto}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    borderWidth: 1.5,
                    borderColor: "#3A3B3E",
                  }}
                >
                  <Text style={{ fontFamily: FONT_BODY_BOLD, fontSize: 12, color: COLOR.white }}>
                    카메라로 찍기
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>

          {/* Stats inputs */}
          {sport === "running" && (
            <View
              style={{
                borderRadius: 16,
                overflow: "hidden",
                backgroundColor: "#2A2B2E",
                marginBottom: 12,
              }}
            >
              {/* Route placeholder */}
              <View style={{ height: 80 }}>
                <RouteMap route={[[10,70],[22,55],[30,62],[45,40],[55,46],[68,28],[80,34],[92,18]]} stroke={COLOR.lime} />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  gap: 8,
                  padding: 12,
                  borderTopWidth: 1,
                  borderTopColor: "#3A3B3E",
                }}
              >
                <FieldInput
                  label="거리"
                  value={running.distance}
                  onChange={(v) => setRunning((p) => ({ ...p, distance: v }))}
                  placeholder="5.2km"
                />
                <FieldInput
                  label="페이스"
                  value={running.pace}
                  onChange={(v) => setRunning((p) => ({ ...p, pace: v }))}
                  placeholder={"5'42\""}
                />
                <FieldInput
                  label="시간"
                  value={running.duration}
                  onChange={(v) => setRunning((p) => ({ ...p, duration: v }))}
                  placeholder="34:12"
                />
              </View>
            </View>
          )}

          {sport === "gym" && (
            <View
              style={{
                borderRadius: 16,
                padding: 12,
                flexDirection: "row",
                gap: 8,
                backgroundColor: "#2A2B2E",
                marginBottom: 12,
              }}
            >
              <FieldInput
                label="부위"
                value={gym.part}
                onChange={(v) => setGym((p) => ({ ...p, part: v }))}
                placeholder="가슴"
              />
              <FieldInput
                label="무게"
                value={gym.weight}
                onChange={(v) => setGym((p) => ({ ...p, weight: v }))}
                placeholder="60kg"
              />
              <FieldInput
                label="세트"
                value={gym.sets}
                onChange={(v) => setGym((p) => ({ ...p, sets: v }))}
                placeholder="5set"
              />
            </View>
          )}

          {sport === "etc" && (
            <View
              style={{
                borderRadius: 16,
                padding: 12,
                flexDirection: "row",
                gap: 8,
                backgroundColor: "#2A2B2E",
                marginBottom: 12,
              }}
            >
              <FieldInput
                label="활동"
                value={etc.activity}
                onChange={(v) => setEtc((p) => ({ ...p, activity: v }))}
                placeholder="요가"
              />
              <FieldInput
                label="시간"
                value={etc.duration}
                onChange={(v) => setEtc((p) => ({ ...p, duration: v }))}
                placeholder="45분"
              />
            </View>
          )}

          {/* CTA */}
          {alreadyPostedToday ? (
            <View style={{ marginTop: 8, paddingVertical: 16, borderRadius: 16, backgroundColor: "#2A2B2E", alignItems: "center", gap: 4 }}>
              <Text style={{ fontFamily: FONT_BODY_EXTRABOLD, fontSize: 14, color: COLOR.lime }}>
                오늘 인증 완료
              </Text>
              <Text style={{ fontFamily: FONT_BODY, fontSize: 12, color: COLOR.slate }}>
                {targetGroup?.name ?? "그룹"}에 이미 인증했어요
              </Text>
            </View>
          ) : !stamped ? (
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!canSubmit || uploading}
              style={{
                marginTop: 8,
                paddingVertical: 16,
                borderRadius: 16,
                backgroundColor: COLOR.lime,
                alignItems: "center",
                opacity: canSubmit && !uploading ? 1 : 0.4,
              }}
            >
              {uploading ? (
                <ActivityIndicator color={COLOR.asphalt} />
              ) : (
                <Text style={{ fontFamily: FONT_BODY_EXTRABOLD, fontSize: 15, color: COLOR.asphalt }}>
                  인증하기
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            <View style={{ marginTop: 24, alignItems: "center" }}>
              <Text style={{ fontFamily: FONT_DISPLAY, fontSize: 22, color: COLOR.lime }}>
                오늘의 인증 완료
              </Text>
              <Text style={{ fontFamily: FONT_BODY, fontSize: 12, color: COLOR.slate, marginTop: 4 }}>
                {targetGroup?.name ?? "그룹"}에 인증했어요
              </Text>
              <TouchableOpacity
                onPress={handleClose}
                style={{
                  marginTop: 20,
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 24,
                  backgroundColor: "#2A2B2E",
                }}
              >
                <Text style={{ fontFamily: FONT_BODY_BOLD, fontSize: 13, color: COLOR.white }}>
                  피드로 돌아가기
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
