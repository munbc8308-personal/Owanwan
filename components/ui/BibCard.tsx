import { View, Text } from "react-native";
import { Check } from "lucide-react-native";
import { COLOR, SPORT_LABEL } from "@/constants/theme";
import { stampText } from "@/constants/stamp";
import type { FeedEntry } from "@/types";
import PostageStamp from "./PostageStamp";
import RouteMap from "./RouteMap";

const FONT_BODY_BOLD = "Manrope_700Bold";
const FONT_BODY = "Manrope_400Regular";

interface BibCardProps {
  member: FeedEntry;
}

export default function BibCard({ member }: BibCardProps) {
  if (!member.done) {
    return (
      <View
        style={{
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 20,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderWidth: 1.5,
          borderStyle: "dashed",
          borderColor: COLOR.slate,
          marginHorizontal: 4,
        }}
      >
        {/* Bib notches */}
        <View
          style={{
            position: "absolute",
            left: -7,
            top: "50%",
            marginTop: -7,
            width: 14,
            height: 14,
            borderRadius: 7,
            backgroundColor: COLOR.concrete,
          }}
        />
        <View
          style={{
            position: "absolute",
            right: -7,
            top: "50%",
            marginTop: -7,
            width: 14,
            height: 14,
            borderRadius: 7,
            backgroundColor: COLOR.concrete,
          }}
        />
        <Text
          style={{ fontFamily: FONT_BODY_BOLD, fontSize: 14, color: COLOR.asphalt }}
        >
          {member.name}
        </Text>
        <Text style={{ fontFamily: FONT_BODY, fontSize: 12, color: COLOR.slate }}>
          아직 인증 전
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 1.5,
        borderColor: COLOR.concreteDark,
        backgroundColor: COLOR.white,
        marginHorizontal: 4,
      }}
    >
      {/* Bib notches */}
      <View
        style={{
          position: "absolute",
          left: -7,
          top: "50%",
          marginTop: -7,
          width: 14,
          height: 14,
          borderRadius: 7,
          backgroundColor: COLOR.concrete,
          zIndex: 10,
        }}
      />
      <View
        style={{
          position: "absolute",
          right: -7,
          top: "50%",
          marginTop: -7,
          width: 14,
          height: 14,
          borderRadius: 7,
          backgroundColor: COLOR.concrete,
          zIndex: 10,
        }}
      />

      {/* Card header with color + route */}
      <View style={{ height: 128, backgroundColor: member.color ?? COLOR.concreteDark }}>
        {member.sport === "running" && member.route && (
          <View style={{ position: "absolute", inset: 0 }}>
            <RouteMap route={member.route} stroke={COLOR.asphalt} />
          </View>
        )}
        <View style={{ position: "absolute", top: 12, left: 12 }}>
          <PostageStamp>{stampText(member)}</PostageStamp>
        </View>
        {member.sport && (
          <View
            style={{
              position: "absolute",
              bottom: 8,
              right: 8,
              backgroundColor: COLOR.asphalt,
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 4,
            }}
          >
            <Text
              style={{
                fontFamily: FONT_BODY_BOLD,
                fontSize: 9,
                color: COLOR.lime,
              }}
            >
              {SPORT_LABEL[member.sport]}
            </Text>
          </View>
        )}
      </View>

      {/* Name row */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <Text
          style={{
            fontFamily: FONT_BODY_BOLD,
            fontSize: 14,
            color: COLOR.asphalt,
          }}
        >
          {member.name}
        </Text>
        <Check size={16} color={COLOR.asphalt} />
      </View>
    </View>
  );
}
