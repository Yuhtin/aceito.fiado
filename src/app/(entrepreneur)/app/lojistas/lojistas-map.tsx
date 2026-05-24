"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type { LojistaCard } from "./_actions";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false },
);
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false },
);
const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false },
);

const CATEGORY_LABELS: Record<string, string> = {
  TEXTIL: "Têxtil",
  COSMETICOS: "Cosméticos",
  ALIMENTOS: "Alimentos",
  BEBIDAS: "Bebidas",
  PAPELARIA: "Papelaria",
  ACESSORIOS: "Acessórios",
  CALCADOS: "Calçados",
  BAZAR: "Bazar",
  OUTROS: "Outros",
};

interface Props {
  initial: LojistaCard[];
}

export function LojistasView({ initial }: Props) {
  const [bairroFilter, setBairroFilter] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Fix Leaflet default icon on mount (broken in webpack/Next.js builds)
  useEffect(() => {
    import("leaflet").then((L) => {
      // @ts-expect-error _getIconUrl
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    });
  }, []);

  // Collect unique tags from all lojistas
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    initial.forEach((l) => l.serviceTags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [initial]);

  // Client-side filtering
  const filtered = useMemo(() => {
    return initial.filter((l) => {
      const matchesBairro =
        bairroFilter.trim() === "" ||
        l.bairro.toLowerCase().includes(bairroFilter.toLowerCase());
      const matchesTag = activeTag === null || l.serviceTags.includes(activeTag);
      return matchesBairro && matchesTag;
    });
  }, [initial, bairroFilter, activeTag]);

  const withCoords = filtered.filter(
    (l) => l.lat !== null && l.lng !== null,
  );

  function handleMarkerClick(id: string) {
    setHighlightId(id);
    const el = cardRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  return (
    <div
      style={{ background: "var(--af-creme)", minHeight: "100vh" }}
      className="flex flex-col"
    >
      {/* Header */}
      <div
        style={{ background: "var(--af-preto)", color: "var(--af-creme)" }}
        className="px-6 py-8"
      >
        <p
          className="af-eb text-xs mb-2 tracking-widest"
          style={{ color: "var(--af-dourado)" }}
        >
          REDE AFROEMPREENDEDORA
        </p>
        <h1 className="af-display text-3xl md:text-4xl uppercase leading-tight">
          Lojistas que aceitam fiado
        </h1>
        <p
          className="af-body text-sm mt-2"
          style={{ color: "var(--af-cinza)" }}
        >
          {filtered.length} lojista{filtered.length !== 1 ? "s" : ""} na rede
        </p>
      </div>

      {/* Filters */}
      <div
        className="px-6 py-4 flex flex-wrap gap-3 items-center border-b"
        style={{
          background: "var(--af-branco)",
          borderColor: "var(--af-borda)",
        }}
      >
        <input
          type="text"
          placeholder="Filtrar por bairro…"
          value={bairroFilter}
          onChange={(e) => setBairroFilter(e.target.value)}
          className="af-body text-sm border rounded px-3 py-1.5 outline-none focus:ring-1 min-w-[180px]"
          style={{
            borderColor: "var(--af-borda)",
            background: "var(--af-creme)",
            color: "var(--af-preto)",
            // @ts-expect-error css var
            "--tw-ring-color": "var(--af-dourado)",
          }}
        />

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className="af-mono text-xs px-3 py-1 rounded-full border transition-colors"
                style={
                  activeTag === tag
                    ? {
                        background: "var(--af-dourado)",
                        color: "var(--af-preto)",
                        borderColor: "var(--af-dourado)",
                      }
                    : {
                        background: "transparent",
                        color: "var(--af-preto)",
                        borderColor: "var(--af-borda)",
                      }
                }
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content: list + map */}
      <div className="flex flex-col md:flex-row flex-1" style={{ minHeight: 0 }}>
        {/* Card list — 40% */}
        <div
          className="md:w-2/5 overflow-y-auto"
          style={{
            maxHeight: "calc(100vh - 200px)",
            borderRight: "1px solid var(--af-borda)",
          }}
        >
          {filtered.length === 0 ? (
            <div className="p-8 text-center">
              <p
                className="af-body text-sm"
                style={{ color: "var(--af-cinza)" }}
              >
                Nenhum lojista encontrado com esses filtros.
              </p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--af-borda)" }}>
              {filtered.map((lojista) => (
                <div
                  key={lojista.id}
                  ref={(el) => {
                    cardRefs.current[lojista.id] = el;
                  }}
                  onClick={() => setHighlightId(lojista.id)}
                  className="p-4 cursor-pointer transition-colors"
                  style={{
                    background:
                      highlightId === lojista.id
                        ? "var(--af-creme)"
                        : "var(--af-branco)",
                    borderLeft:
                      highlightId === lojista.id
                        ? "3px solid var(--af-dourado)"
                        : "3px solid transparent",
                  }}
                >
                  <h3
                    className="af-display text-base uppercase leading-tight mb-1"
                    style={{ color: "var(--af-preto)" }}
                  >
                    {lojista.name}
                  </h3>
                  <p
                    className="af-mono text-xs mb-2"
                    style={{ color: "var(--af-cinza)" }}
                  >
                    {lojista.bairro} · {lojista.city}, {lojista.state}
                  </p>
                  <p
                    className="af-mono text-xs mb-2"
                    style={{ color: "var(--af-cinza)" }}
                  >
                    {CATEGORY_LABELS[lojista.category] ?? lojista.category}
                  </p>
                  {lojista.serviceTags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {lojista.serviceTags.map((tag) => (
                        <span
                          key={tag}
                          className="af-mono text-xs px-2 py-0.5 rounded-full"
                          style={{
                            background: "var(--af-dourado)",
                            color: "var(--af-preto)",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Map — 60% */}
        <div className="md:w-3/5 relative" style={{ minHeight: "400px" }}>
          <MapContainer
            center={[-23.55, -46.63]}
            zoom={11}
            style={{ height: "100%", width: "100%", minHeight: "400px" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {withCoords.map((lojista) => (
              <Marker
                key={lojista.id}
                position={[lojista.lat as number, lojista.lng as number]}
                eventHandlers={{
                  click: () => handleMarkerClick(lojista.id),
                }}
              >
                <Popup>
                  <div style={{ minWidth: "160px" }}>
                    <strong
                      style={{
                        fontFamily: "var(--font-anton), serif",
                        textTransform: "uppercase",
                        display: "block",
                        marginBottom: "4px",
                      }}
                    >
                      {lojista.name}
                    </strong>
                    <span
                      style={{
                        fontFamily: "var(--font-geist-mono), monospace",
                        fontSize: "11px",
                        color: "#666",
                        display: "block",
                      }}
                    >
                      {CATEGORY_LABELS[lojista.category] ?? lojista.category}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-geist-mono), monospace",
                        fontSize: "11px",
                        color: "#666",
                        display: "block",
                      }}
                    >
                      {lojista.bairro} · {lojista.city}
                    </span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
