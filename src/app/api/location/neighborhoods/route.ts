import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

let cachedNeighborhoodsMap: Record<string, Record<string, string[]>> | null = null;

function normalizeTurkish(str: string): string {
  return (str || "")
    .toLowerCase()
    .trim()
    .replace(/i̇/g, "i")
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/[^a-z0-9]/g, "");
}

function loadNeighborhoodsMap(): Record<string, Record<string, string[]>> {
  if (cachedNeighborhoodsMap) return cachedNeighborhoodsMap;

  try {
    const filePath = path.join(process.cwd(), "public", "data", "turkey_neighborhoods.json");
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf8");
      cachedNeighborhoodsMap = JSON.parse(raw);
      return cachedNeighborhoodsMap!;
    }
  } catch (err) {
    console.warn("Could not load turkey_neighborhoods.json:", err);
  }

  return {};
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const province = searchParams.get("province") || searchParams.get("city") || searchParams.get("il") || "";
    const district = searchParams.get("district") || searchParams.get("ilce") || "";

    const map = loadNeighborhoodsMap();
    const normP = normalizeTurkish(province);
    const normD = normalizeTurkish(district);

    // İlgili ili bul
    const matchedProvKey = Object.keys(map).find(
      (p) => normalizeTurkish(p) === normP || normP.includes(normalizeTurkish(p)) || normalizeTurkish(p).includes(normP)
    );

    if (!matchedProvKey) {
      return NextResponse.json({
        success: true,
        province,
        district,
        count: 0,
        neighborhoods: [],
      });
    }

    const distMap = map[matchedProvKey] || {};

    // Eğer ilçe belirtilmemişse ilçelerin listesini dönebilir
    if (!district) {
      return NextResponse.json({
        success: true,
        province: matchedProvKey,
        districts: Object.keys(distMap),
        neighborhoods: [],
      });
    }

    // İlgili ilçeyi bul (Merkez ve kısmi eşleşme kuralları dahil)
    let matchedDistKey = Object.keys(distMap).find(
      (d) => normalizeTurkish(d) === normD
    );

    if (!matchedDistKey && (normD === "merkez" || normD.includes("merkez"))) {
      matchedDistKey = Object.keys(distMap).find(
        (d) => normalizeTurkish(d) === normP || normalizeTurkish(d).includes("merkez")
      );
    }

    if (!matchedDistKey) {
      matchedDistKey = Object.keys(distMap).find(
        (d) => normalizeTurkish(d).includes(normD) || normD.includes(normalizeTurkish(d))
      );
    }

    const list = matchedDistKey ? (distMap[matchedDistKey] || []) : [];

    return NextResponse.json(
      {
        success: true,
        province: matchedProvKey,
        district: matchedDistKey || district,
        count: list.length,
        neighborhoods: list,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
        },
      }
    );
  } catch (err: any) {
    console.error("Neighborhoods API error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to get neighborhoods" },
      { status: 500 }
    );
  }
}
