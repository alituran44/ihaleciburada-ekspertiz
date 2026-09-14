import { NextRequest, NextResponse } from "next/server";
import { performMarketResearch } from "@/lib/api/marketResearch";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const il = searchParams.get("il") || "";
  const ilce = searchParams.get("ilce") || "";
  const mahalle = searchParams.get("mahalle") || "";
  const kategori = (searchParams.get("kategori") as "arsa" | "konut") || "arsa";
  const latStr = searchParams.get("lat");
  const lngStr = searchParams.get("lng");
  const coordinates = (latStr && lngStr) 
    ? { lat: parseFloat(latStr), lng: parseFloat(lngStr) } 
    : undefined;

  if (!il) {
    return NextResponse.json(
      { error: "İl parametresi zorunludur." },
      { status: 400 }
    );
  }

  try {
    const research = await performMarketResearch({
      city: il,
      district: ilce,
      neighborhood: mahalle,
      category: kategori,
      coordinates,
    });

    return NextResponse.json({
      success: true,
      data: research,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Emsal araştırması sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}
