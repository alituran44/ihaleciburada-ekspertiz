import { NextRequest, NextResponse } from "next/server";
import { queryTKGMParcel, queryTKGMByCoordinates } from "@/lib/api/tkgm";
import { fetchMarketValuation } from "@/lib/api/valuation";
import { performMarketResearch } from "@/lib/api/marketResearch";
import { getProvinceCoordinates, findFastLocationFromCoords } from "@/lib/turkeyLocations";
import { 
  fetchLiveCurrencyRates, 
  fetchEarthquakeRisk, 
  fetchSolarAndClimate 
} from "@/lib/api/publicApis";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  let il = searchParams.get("il") || "";
  let ilce = searchParams.get("ilce") || "";
  let mahalle = searchParams.get("mahalle") || "";
  let ada = searchParams.get("ada") || "";
  let parsel = searchParams.get("parsel") || "";
  const kategori = (searchParams.get("kategori") as "arsa" | "konut") || "arsa";

  let tkgmResult: any = null;

  if (latParam && lngParam) {
    const lat = parseFloat(latParam);
    const lng = parseFloat(lngParam);
    if (!isNaN(lat) && !isNaN(lng)) {
      tkgmResult = await queryTKGMByCoordinates(lat, lng);
      if (tkgmResult) {
        il = tkgmResult.il || il;
        ilce = tkgmResult.ilce || ilce;
        mahalle = tkgmResult.mahalle || mahalle;
        ada = tkgmResult.ada || ada;
        parsel = tkgmResult.parsel || parsel;
      } else if (!il || !ilce) {
        const fast = findFastLocationFromCoords(lat, lng);
        il = fast.city;
        ilce = fast.district;
        mahalle = fast.neighborhood || "Merkez";
      }
    }
  }

  if (!il || !ilce) {
    return NextResponse.json(
      { error: "İl ve İlçe parametreleri veya geçerli koordinat zorunludur." },
      { status: 400 }
    );
  }

  try {
    // 1. Kadastro & Parsel Sorgusu
    const parcelData = tkgmResult || await queryTKGMParcel({
      il,
      ilce,
      mahalle,
      ada,
      parsel,
    });

    // Koordinatlar
    const provCoords = getProvinceCoordinates(il);
    const lat = parcelData?.coordinates?.lat || provCoords?.lat || 39.9334;
    const lng = parcelData?.coordinates?.lng || provCoords?.lng || 32.8597;

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
