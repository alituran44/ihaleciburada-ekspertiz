import { NextResponse } from "next/server";
import { CrowdsourcePriceData } from "@/components/valuation/types";

// In-memory store for crowdsourced real auction/market transactions
const inMemoryCrowdsource: CrowdsourcePriceData[] = [
  {
    ada: "117",
    parsel: "9",
    city: "Çanakkale",
    district: "Merkez",
    neighborhood: "Kepez",
    reportedPrice: 9400000,
    userNote: "Komşu daire emsal satışı",
    date: "2026-09-15",
  },
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ada, parsel, city, district, neighborhood, reportedPrice, userNote } = body;

    const numericPrice = Number(reportedPrice);
    if (!numericPrice || isNaN(numericPrice) || numericPrice <= 0) {
      return NextResponse.json(
        { error: "Geçerli bir satış/ihale fiyatı girilmelidir." },
        { status: 400 }
      );
    }

    const newRecord: CrowdsourcePriceData = {
      ada: ada ? String(ada).trim() : "0",
      parsel: parsel ? String(parsel).trim() : "0",
      city: city || "Çanakkale",
      district: district || "Merkez",
      neighborhood: neighborhood || "Kepez",
      reportedPrice: numericPrice,
      userNote: userNote ? String(userNote).trim() : undefined,
      date: new Date().toISOString().split("T")[0],
    };

    inMemoryCrowdsource.unshift(newRecord);
    if (inMemoryCrowdsource.length > 500) {
      inMemoryCrowdsource.pop();
    }

    console.log("[İhaleciBurada Gerçek Fiyat Bildirimi]:", newRecord);

    return NextResponse.json({
      success: true,
      message: "Gerçekleşen fiyat bildirimi başarıyla kaydedildi. Veri tabanımıza katkınız için teşekkürler.",
      record: newRecord,
    });
  } catch (err: any) {
    console.error("Crowdsource save error:", err);
    return NextResponse.json(
      { error: "Sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ada = searchParams.get("ada");
  const parsel = searchParams.get("parsel");

  if (ada && parsel) {
    const matched = inMemoryCrowdsource.filter(
      (item) => item.ada === ada && item.parsel === parsel
    );
    return NextResponse.json({ records: matched });
  }

  return NextResponse.json({
    total: inMemoryCrowdsource.length,
    records: inMemoryCrowdsource,
  });
}
