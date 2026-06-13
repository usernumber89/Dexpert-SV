// components/DexpertLogo.tsx
// Uso:
//   <DexpertLogo />
//   <DexpertLogo variant="dark" height={32} />
//   <DexpertLogo icon={Zap} variant="light" height={48} />
import { Briefcase, BriefcaseBusiness, Rocket } from "lucide-react";
import {BriefcaseIcon }  from "@phosphor-icons/react";

interface Props {
  variant?: "light" | "dark";
  height?: number;
  icon?: React.ElementType; // cualquier icono de Lucide (Zap, Briefcase, TrendingUp, etc.)
}

export function DexpertLogo({
  variant = "light",
  height = 40,
  icon: IconComponent = BriefcaseIcon,
}: Props) {
  const iconColor = variant === "dark" ? "#ffffff" : "#0D3A6E";
  const textColor = variant === "dark" ? "#7dbfef" : "#5B8DB8";

  // Escala proporcional basada en la altura original de 40px
  const iconSize = Math.round(height * 0.6); // 24px cuando height=40
  const fontSize = height * (22 / 40); // 22px cuando height=40
  const gap = height * (8 / 40); // 8px de separación entre icono y texto

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: height,
        width: "fit-content",
      }}
      aria-label="Dexpert"
      role="img"
    >
      <IconComponent size={iconSize} color={iconColor} />
      <span
        style={{
          marginLeft: gap,
          fontFamily: "Inter, 'Helvetica Neue', Arial, sans-serif",
          fontSize: fontSize,
          fontWeight: 600,
          letterSpacing: "-0.3px",
          color: textColor,
          lineHeight: 1,
        }}
      >
        Dexpert
      </span>
    </div>
  );
}

