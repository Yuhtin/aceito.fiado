"use server";

import { db } from "@/lib/db";

export interface LojistaCard {
  id: string;
  name: string;
  category: string;
  bairro: string;
  city: string;
  state: string;
  lat: number | null;
  lng: number | null;
  serviceTags: string[];
}

export async function listLojistas(filter?: {
  tag?: string;
  bairro?: string;
}): Promise<LojistaCard[]> {
  const rows = await db.supplierProfile.findMany({
    where: {
      ...(filter?.tag ? { serviceTags: { has: filter.tag } } : {}),
      ...(filter?.bairro
        ? { addressNeighborhood: { contains: filter.bairro, mode: "insensitive" } }
        : {}),
    },
    select: {
      id: true,
      businessName: true,
      category: true,
      addressNeighborhood: true,
      addressCity: true,
      addressState: true,
      latitude: true,
      longitude: true,
      serviceTags: true,
    },
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.businessName,
    category: r.category,
    bairro: r.addressNeighborhood,
    city: r.addressCity,
    state: r.addressState,
    lat: r.latitude,
    lng: r.longitude,
    serviceTags: r.serviceTags,
  }));
}
