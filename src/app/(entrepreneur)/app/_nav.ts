import {
  HandCoins,
  Home,
  MapPin,
  ScrollText,
  Sparkles,
} from "lucide-react";

export const entrepreneurNav = [
  { href: "/app", label: "Cockpit", icon: Home },
  { href: "/app/fiado", label: "Comprar fiado", icon: HandCoins },
  { href: "/app/historico", label: "Histórico", icon: ScrollText },
  { href: "/app/saude", label: "Saúde financeira", icon: Sparkles },
  { href: "/app/lojistas", label: "Lojistas", icon: MapPin },
];
