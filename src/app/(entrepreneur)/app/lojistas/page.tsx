import { requireEntrepreneur } from "@/lib/auth";
import { listLojistas } from "./_actions";
import { LojistasView } from "./lojistas-map";

export default async function LojistasPage() {
  await requireEntrepreneur();
  const lojistas = await listLojistas();
  return <LojistasView initial={lojistas} />;
}
