// src/components/af/display-heading.tsx
import { cn } from "@/lib/utils";
import type { CSSProperties, ReactNode } from "react";

interface DisplayHeadingProps {
  children: ReactNode;
  as?: "h1" | "h2" | "h3" | "h4";
  size?: number | string;
  color?: string;
  className?: string;
  style?: CSSProperties;
}

export function DisplayHeading({
  children,
  as: Tag = "h2",
  size = 48,
  color = "var(--af-preto)",
  className,
  style,
}: DisplayHeadingProps) {
  return (
    <Tag
      className={cn("af-display", className)}
      style={{
        fontSize: typeof size === "number" ? `${size}px` : size,
        color,
        margin: 0,
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
