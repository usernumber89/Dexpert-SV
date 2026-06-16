import Image from "next/image";

interface Props {
  variant?: "light" | "dark";
  height?: number;
}

export function DexpertLogo({
  variant = "light",
  height = 40,
}: Props) {
  const logoSrc =
    variant === "dark"
      ? "/logo.png"
      : "/dark.png";

  return (
    <Image
      src={logoSrc}
      alt="Dexpert"
      width={2000}
      height={342}
      priority
      style={{
        height: `${height}px`,
        width: "auto",
      }}
    />
  );
}