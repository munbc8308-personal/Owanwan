import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { ChevronLeft, Users, User, Check, Eye, EyeOff } from "lucide-react-native";
import { COLOR, AVATAR_COLORS } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

const FONT_DISPLAY = "BebasNeue_400Regular";
const FONT_BODY_BOLD = "Manrope_700Bold";
const FONT_BODY_EXTRABOLD = "Manrope_800ExtraBold";
const FONT_BODY = "Manrope_400Regular";
const FONT_MONO_BOLD = "JetBrainsMono_700Bold";

const TOTAL_STEPS = 6;

type Mode = "create" | "join" | null;
type Sport = "running" | "gym" | "etc";
const SPORT_MAP: Record<string, Sport> = { 러닝: "running", 헬스: "gym", 기타: "etc" };

function generateInviteCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [step, setStep] = useState(0);
  const [nickname, setNickname] = useState("");
  const [avatarColor, setAvatarColor] = useState<string>(AVATAR_COLORS[0]);
  const [sport, setSport] = useState("러닝");
  const [mode, setMode] = useState<Mode>(null);
  const [groupName, setGroupName] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const codeInputRefs = useRef<(TextInput | null)[]>([]);

  const back = () => {
    setError("");
    setStep((s) => {
      // step 3 (group step) goes back to step 2 (create/join choice)
      if (s === 3) { setMode(null); return 2; }
      return Math.max(0, s - 1);
    });
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isNextDisabled =
    (step === 0 && !nickname) ||
    (step === 3 && mode === "create" && !groupName) ||
    (step === 3 && mode === "join" && code.some((c) => !c)) ||
    (step === 4 && (!isEmailValid || password.length < 6));

  const handleNext = async () => {
    setError("");

    // Step 4: sign up + save profile + group immediately (before auth redirect fires)
    if (step === 4) {
      setLoading(true);
      try {
        const { data: { user, session }, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        if (!user || !session) throw new Error("인증 오류");

        // Explicitly set session so subsequent PostgREST calls use the JWT
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });

        await supabase.from("users").update({
          nickname,
          avatar_color: avatarColor,
          default_sport: SPORT_MAP[sport],
        }).eq("id", user.id);

        if (mode === "create") {
          const inviteCode = generateInviteCode();
          // Generate group ID client-side to avoid SELECT after INSERT
          // (SELECT would fail RLS because user isn't a member yet)
          const groupId = generateUUID();
          const { error: gErr } = await supabase
            .from("groups")
            .insert({ id: groupId, name: groupName, owner_id: user.id, invite_code: inviteCode });
          if (gErr) throw gErr;
          await supabase.from("group_members").insert({ group_id: groupId, user_id: user.id, role: "owner" });
        } else {
          const inviteCode = code.join("");
          const { data: foundGroupId, error: gErr } = await supabase.rpc("group_id_by_invite", { code: inviteCode });
          if (gErr || !foundGroupId) { setError("초대코드를 찾을 수 없어요."); setLoading(false); return; }
          await supabase.from("group_members").insert({ group_id: foundGroupId, user_id: user.id, role: "member" });
        }

        setStep(5);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "오류가 발생했어요");
      } finally {
        setLoading(false);
      }
      return;
    }

    // Step 5: navigate to feed (data already saved in step 4)
    if (step === 5) {
      router.replace("/(tabs)/feed");
      return;
    }

    setStep((s) => s + 1);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.asphalt }}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 24 }}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {/* Progress bar + back */}
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 16, marginBottom: 24, gap: 12 }}>
            {step > 0 && step < 5 && (
              <TouchableOpacity onPress={back} style={{ marginRight: 4 }}>
                <ChevronLeft size={20} color={COLOR.white} />
              </TouchableOpacity>
            )}
            <View style={{ flexDirection: "row", gap: 6 }}>
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: 16,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: i <= step ? COLOR.lime : "#3A3B3E",
                  }}
                />
              ))}
            </View>
          </View>

          {/* Step 0: Profile */}
          {step === 0 && (
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONT_MONO_BOLD, fontSize: 12, color: COLOR.lime, letterSpacing: 2 }}>
                OWANWAN
              </Text>
              <Text style={{ fontFamily: FONT_DISPLAY, fontSize: 44, color: COLOR.white, lineHeight: 42, marginTop: 8 }}>
                {"프로필을\n만들어주세요"}
              </Text>
              <Text style={{ fontFamily: FONT_BODY, fontSize: 14, color: COLOR.slate, lineHeight: 22, marginTop: 16 }}>
                그룹원들에게 보여질 이름과 색상이에요. 언제든 바꿀 수 있어요.
              </Text>
              <View style={{ alignItems: "center", marginTop: 32 }}>
                <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: avatarColor, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontFamily: FONT_DISPLAY, fontSize: 30, color: COLOR.asphalt }}>
                    {nickname ? nickname[0] : "?"}
                  </Text>
                </View>
              </View>
              <TextInput
                value={nickname}
                onChangeText={setNickname}
                placeholder="닉네임 입력"
                placeholderTextColor={COLOR.slate}
                maxLength={8}
                style={{
                  width: "100%",
                  marginTop: 24,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  textAlign: "center",
                  backgroundColor: "#2A2B2E",
                  borderWidth: 1.5,
                  borderColor: nickname ? COLOR.lime : "#3A3B3E",
                  borderRadius: 16,
                  fontFamily: FONT_BODY_BOLD,
                  fontSize: 15,
                  color: COLOR.white,
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
                      borderColor: avatarColor === c ? COLOR.white : "transparent",
                    }}
                  />
                ))}
              </View>

              <TouchableOpacity
                onPress={() => router.push("/(onboarding)/signin")}
                style={{ alignItems: "center", marginTop: 32 }}
              >
                <Text style={{ fontFamily: FONT_BODY, fontSize: 13, color: COLOR.slate }}>
                  이미 계정이 있어요{" "}
                  <Text style={{ color: COLOR.lime }}>로그인</Text>
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Step 1: Sport */}
          {step === 1 && (
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONT_MONO_BOLD, fontSize: 12, color: COLOR.lime, letterSpacing: 2 }}>
                OWANWAN
              </Text>
              <Text style={{ fontFamily: FONT_DISPLAY, fontSize: 48, color: COLOR.white, lineHeight: 46, marginTop: 8 }}>
                {"매일,\n있는 그대로"}
              </Text>
              <Text style={{ fontFamily: FONT_BODY, fontSize: 14, color: COLOR.slate, lineHeight: 22, marginTop: 16 }}>
                친구와 함께 매일 한 번, 꾸민 것 없이 인증하는 가장 솔직한 운동 기록.
              </Text>
              <View style={{ marginTop: 40 }}>
                <Text style={{ fontFamily: FONT_BODY_BOLD, fontSize: 12, color: COLOR.slate }}>무슨 운동 하세요?</Text>
                <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
                  {["러닝", "헬스", "기타"].map((s) => (
                    <TouchableOpacity
                      key={s}
                      onPress={() => setSport(s)}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 9999,
                        backgroundColor: sport === s ? COLOR.lime : "transparent",
                        borderWidth: 1.5,
                        borderColor: sport === s ? COLOR.lime : COLOR.slate,
                      }}
                    >
                      <Text style={{ fontFamily: FONT_BODY_BOLD, fontSize: 14, color: sport === s ? COLOR.asphalt : COLOR.white }}>
                        {s}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Step 2: Create or Join */}
          {step === 2 && (
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONT_DISPLAY, fontSize: 32, color: COLOR.white }}>어떻게 시작할까요?</Text>
              <Text style={{ fontFamily: FONT_BODY, fontSize: 13, color: COLOR.slate, marginTop: 8 }}>
                같이 인증할 친구가 있다면 초대코드로, 없다면 새로 만들어보세요.
              </Text>
              <View style={{ gap: 12, marginTop: 32 }}>
                <TouchableOpacity
                  onPress={() => { setMode("create"); setStep(3); }}
                  style={{ flexDirection: "row", alignItems: "center", gap: 16, padding: 16, borderRadius: 16, backgroundColor: "#2A2B2E", borderWidth: 1.5, borderColor: "#3A3B3E" }}
                >
                  <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: COLOR.lime, alignItems: "center", justifyContent: "center" }}>
                    <Users size={18} color={COLOR.asphalt} />
                  </View>
                  <View>
                    <Text style={{ fontFamily: FONT_BODY_EXTRABOLD, fontSize: 14, color: COLOR.white }}>새 그룹 만들기</Text>
                    <Text style={{ fontFamily: FONT_BODY, fontSize: 12, color: COLOR.slate }}>내가 크루장이 되어 친구를 초대해요</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => { setMode("join"); setStep(3); }}
                  style={{ flexDirection: "row", alignItems: "center", gap: 16, padding: 16, borderRadius: 16, backgroundColor: "#2A2B2E", borderWidth: 1.5, borderColor: "#3A3B3E" }}
                >
                  <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#3A3B3E", alignItems: "center", justifyContent: "center" }}>
                    <User size={18} color={COLOR.white} />
                  </View>
                  <View>
                    <Text style={{ fontFamily: FONT_BODY_EXTRABOLD, fontSize: 14, color: COLOR.white }}>초대코드로 참여하기</Text>
                    <Text style={{ fontFamily: FONT_BODY, fontSize: 12, color: COLOR.slate }}>친구가 알려준 6자리 코드를 입력해요</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Step 3a: Group name */}
          {step === 3 && mode === "create" && (
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONT_DISPLAY, fontSize: 32, color: COLOR.white }}>그룹 이름을 정해주세요</Text>
              <Text style={{ fontFamily: FONT_BODY, fontSize: 13, color: COLOR.slate, marginTop: 8 }}>
                나중에 언제든 바꿀 수 있어요. 무료 플랜은 최대 5명까지 함께할 수 있어요.
              </Text>
              <TextInput
                value={groupName}
                onChangeText={setGroupName}
                placeholder="예: 퇴근런 크루"
                placeholderTextColor={COLOR.slate}
                style={{
                  marginTop: 32,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  borderRadius: 16,
                  backgroundColor: "#2A2B2E",
                  borderWidth: 1.5,
                  borderColor: groupName ? COLOR.lime : "#3A3B3E",
                  fontFamily: FONT_BODY,
                  fontSize: 15,
                  color: COLOR.white,
                }}
              />
            </View>
          )}

          {/* Step 3b: Invite code */}
          {step === 3 && mode === "join" && (
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONT_DISPLAY, fontSize: 32, color: COLOR.white }}>초대코드를 입력하세요</Text>
              <Text style={{ fontFamily: FONT_BODY, fontSize: 13, color: COLOR.slate, marginTop: 8 }}>
                친구의 크루 화면에서 코드를 확인할 수 있어요.
              </Text>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 32 }}>
                {code.map((c, i) => (
                  <TextInput
                    key={i}
                    ref={(el) => { codeInputRefs.current[i] = el; }}
                    value={c}
                    maxLength={1}
                    onChangeText={(v) => {
                      const next = [...code];
                      next[i] = v.toUpperCase().slice(-1);
                      setCode(next);
                      if (v && i < 5) codeInputRefs.current[i + 1]?.focus();
                    }}
                    onKeyPress={({ nativeEvent }) => {
                      if (nativeEvent.key === "Backspace" && !c && i > 0) {
                        codeInputRefs.current[i - 1]?.focus();
                      }
                    }}
                    autoCapitalize="characters"
                    style={{
                      width: 44,
                      height: 56,
                      borderRadius: 12,
                      textAlign: "center",
                      backgroundColor: "#2A2B2E",
                      borderWidth: 1.5,
                      borderColor: c ? COLOR.lime : "#3A3B3E",
                      fontFamily: FONT_MONO_BOLD,
                      fontSize: 20,
                      color: COLOR.white,
                    }}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Step 4: Email + Password */}
          {step === 4 && (
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONT_DISPLAY, fontSize: 36, color: COLOR.white, lineHeight: 34 }}>
                {"계정을\n만들어주세요"}
              </Text>
              <Text style={{ fontFamily: FONT_BODY, fontSize: 13, color: COLOR.slate, marginTop: 12 }}>
                인증 기록이 안전하게 보관돼요.
              </Text>

              <TextInput
                value={email}
                onChangeText={(v) => { setEmail(v); setError(""); }}
                placeholder="이메일"
                placeholderTextColor={COLOR.slate}
                keyboardType="email-address"
                autoCapitalize="none"
                style={{
                  marginTop: 32,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  borderRadius: 16,
                  backgroundColor: "#2A2B2E",
                  borderWidth: 1.5,
                  borderColor: isEmailValid ? COLOR.lime : (email ? COLOR.red : "#3A3B3E"),
                  fontFamily: FONT_BODY,
                  fontSize: 15,
                  color: COLOR.white,
                }}
              />

              <View style={{ marginTop: 12, position: "relative" }}>
                <TextInput
                  value={password}
                  onChangeText={(v) => { setPassword(v); setError(""); }}
                  placeholder="비밀번호 (6자 이상)"
                  placeholderTextColor={COLOR.slate}
                  secureTextEntry={!showPassword}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                    paddingRight: 52,
                    borderRadius: 16,
                    backgroundColor: "#2A2B2E",
                    borderWidth: 1.5,
                    borderColor: password.length >= 6 ? COLOR.lime : "#3A3B3E",
                    fontFamily: FONT_BODY,
                    fontSize: 15,
                    color: COLOR.white,
                  }}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((v) => !v)}
                  style={{ position: "absolute", right: 16, top: 16 }}
                >
                  {showPassword
                    ? <Eye size={20} color={COLOR.slate} />
                    : <EyeOff size={20} color={COLOR.slate} />
                  }
                </TouchableOpacity>
              </View>

              {error ? (
                <Text style={{ fontFamily: FONT_BODY, fontSize: 12, color: COLOR.red, marginTop: 12 }}>
                  {error}
                </Text>
              ) : null}
            </View>
          )}

          {/* Step 5: Done */}
          {step === 5 && (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: COLOR.lime, alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <Check size={28} color={COLOR.asphalt} />
              </View>
              <Text style={{ fontFamily: FONT_DISPLAY, fontSize: 30, color: COLOR.white, textAlign: "center" }}>
                {mode === "create" ? `${groupName || "새 크루"} 준비 완료` : "크루에 합류했어요"}
              </Text>
              <Text style={{ fontFamily: FONT_BODY, fontSize: 13, color: COLOR.slate, marginTop: 8, textAlign: "center" }}>
                {mode === "create" ? "친구를 초대해서 함께 인증을 시작해보세요." : `${nickname}님, 오늘부터 함께 인증해요.`}
              </Text>
              {error ? (
                <Text style={{ fontFamily: FONT_BODY, fontSize: 12, color: COLOR.red, marginTop: 16, textAlign: "center" }}>
                  {error}
                </Text>
              ) : null}
            </View>
          )}
        </ScrollView>

        {/* Next / Submit button */}
        {step !== 2 && (
          <View style={{ paddingHorizontal: 24, paddingBottom: 32, paddingTop: 8 }}>
            <TouchableOpacity
              onPress={handleNext}
              disabled={isNextDisabled || loading}
              style={{
                backgroundColor: COLOR.lime,
                paddingVertical: 16,
                borderRadius: 16,
                alignItems: "center",
                opacity: isNextDisabled ? 0.4 : 1,
              }}
            >
              {loading
                ? <ActivityIndicator color={COLOR.asphalt} />
                : (
                  <Text style={{ fontFamily: FONT_BODY_EXTRABOLD, fontSize: 15, color: COLOR.asphalt }}>
                    {step === 5 ? "시작하기" : "다음"}
                  </Text>
                )
              }
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
