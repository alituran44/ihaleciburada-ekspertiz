import { NextRequest, NextResponse } from "next/server";
import { queryTKGMParcel } from "@/lib/api/tkgm";
import { fetchMarketValuation } from "@/lib/api/valuation";
import { performMarketResearch } from "@/lib/api/marketResearch";
import { 
  fetchLiveCurrencyRates, 
  fetchEarthquakeRisk, 
  fetchSolarAndClimate 
} from "@/lib/api/publicApis";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const il = searchParams.get("il") || "";
  const ilce = searchParams.get("ilce") || "";
  const mahalle = searchParams.get("mahalle") || "";
  const ada = searchParams.get("ada") || "";
  const parsel = searchParams.get("parsel") || "";
  const kategori = (searchParams.get("kategori") as "arsa" | "konut") || "arsa";

  if (!il || !ilce) {
    return NextResponse.json(
      { error: "İl ve İlçe parametreleri zorunludur." },
      { status: 400 }
    );
  }

  try {
    // 1. Kadastro & Parsel Sorgusu
    const parcelData = await queryTKGMParcel({
      il,
      ilce,
      mahalle,
      ada,
      parsel,
    });

    // Koordinatlar
    const lat = parcelData?.coordinates?.lat || 40.1553;
    const lng = parcelData?.coordinates?.lng || 26.4142;

    // 2. Paralel Veri Çekme (Piyasa, Emsal, Döviz, Deprem, Güneşlenme)
    const [marketData, researchData, currencyData, earthquakeData, solarData] = await Promise.all([
      fetchMarketValuation({
        city: il,
        district: ilce,
        neighborhood: mahalle,
      }),
      performMarketResearch({
        city: il,
        district: ilce,
        neighborhood: mahalle,
        category: kategori,
        coordinates: { lat, lng },
      }),
      fetchLiveCurrencyRates(),
      fetchEarthquakeRisk(lat, lng),
      fetchSolarAndClimate(lat, lng),
    ]);

    return NextResponse.json({
      success: true,
      parcel: parcelData,
      market: marketData,
      research: researchData,
      currency: currencyData,
      earthquake: earthquakeData,
      solar: solarData,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Sorgulama sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}
