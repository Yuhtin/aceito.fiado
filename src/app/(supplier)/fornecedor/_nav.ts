import { Home, Inbox, Package, QrCode, ScrollText } from "lucide-react";

export const supplierNav = [
  { href: "/fornecedor/cobrar", label: "Cobrar fiado", icon: QrCode },
  { href: "/fornecedor", label: "Painel", icon: Home },
  { href: "/fornecedor/pedidos", label: "Pedidos recebidos", icon: Inbox },
  { href: "/fornecedor/produtos", label: "Meus produtos", icon: Package },
  { href: "/fornecedor/operacoes", label: "Operações pagas", icon: ScrollText },
];
