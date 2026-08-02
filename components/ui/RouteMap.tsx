import Svg, { Polyline, Circle } from "react-native-svg";
import { View } from "react-native";
import { COLOR } from "@/constants/theme";

interface RouteMapProps {
  route: [number, number][];
  stroke?: string;
  showMarkers?: boolean;
}

export default function RouteMap({
  route,
  stroke = COLOR.asphalt,
  showMarkers = true,
}: RouteMapProps) {
  if (!route || route.length < 2) return null;
  const points = route.map(([x, y]) => `${x},${y}`).join(" ");

  return (
    <View style={{ flex: 1 }}>
      <Svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ flex: 1 }}>
        <Polyline
          points={points}
          fill="none"
          stroke={stroke}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.85}
        />
        {showMarkers && (
          <>
            <Circle
              cx={route[0][0]}
              cy={route[0][1]}
              r="3.2"
              fill={COLOR.lime}
              stroke={COLOR.asphalt}
              strokeWidth="1"
            />
            <Circle
              cx={route[route.length - 1][0]}
              cy={route[route.length - 1][1]}
              r="3.2"
              fill={COLOR.red}
              stroke={COLOR.white}
              strokeWidth="1"
            />
          </>
        )}
      </Svg>
    </View>
  );
}
