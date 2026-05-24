import {
  HandCoins,
  Home,
  Lock,
  ScrollText,
  Sparkles,
} from "lucide-react";

export const entrepreneurNav = [
  { href: "/app", label: "Cockpit", icon: Home },
  { href: "/app/fiado", label: "Comprar fiado", icon: HandCoins },
  { href: "/app/trava", label: "Trava de recebíveis", icon: Lock },
  { href: "/app/historico", label: "Histórico", icon: ScrollText },
  { href: "/app/saude", label: "Saúde financeira", icon: Sparkles },
];
