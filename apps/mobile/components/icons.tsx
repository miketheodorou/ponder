import Svg, { Circle, Path } from "react-native-svg";

interface IconProps {
  size?: number;
  color: string;
  /** Stroke width in source viewBox units. Defaults to 1.2 to match the design. */
  strokeWidth?: number;
}

export function PlusIcon({ size = 18, color, strokeWidth = 1.2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Path
        d="M9 2v14M2 9h14"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function ChevronUp({ size = 14, color, strokeWidth = 1.2 }: IconProps) {
  return (
    <Svg width={size} height={size * 0.6} viewBox="0 0 14 8" fill="none">
      <Path
        d="M1 7l6-6 6 6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ChevronDown({ size = 14, color, strokeWidth = 1.2 }: IconProps) {
  return (
    <Svg width={size} height={size * 0.6} viewBox="0 0 14 8" fill="none">
      <Path
        d="M1 1l6 6 6-6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ChevronLeft({ size = 16, color, strokeWidth = 1.2 }: IconProps) {
  return (
    <Svg width={size * 0.6} height={size} viewBox="0 0 8 14" fill="none">
      <Path
        d="M7 1L1 7l6 6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ChevronRight({ size = 12, color, strokeWidth = 1.2 }: IconProps) {
  return (
    <Svg width={size * 0.6} height={size} viewBox="0 0 8 14" fill="none">
      <Path
        d="M1 1l6 6-6 6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function CloseIcon({ size = 16, color, strokeWidth = 1.2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M2 2l12 12M14 2L2 14"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function SearchIcon({ size = 14, color, strokeWidth = 1.2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Circle cx={6} cy={6} r={4.5} stroke={color} strokeWidth={strokeWidth} />
      <Path
        d="M9.5 9.5L13 13"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}
