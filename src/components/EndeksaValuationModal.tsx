"use client";

import React, { useState } from "react";
import { ParcelInput } from "@/types";
import { ValuationFormData, ValuationServiceType, INITIAL_VALUATION_DATA } from "./valuation/types";
import { ValuationHeader } from "./valuation/ValuationHeader";
import { LocationStep } from "./valuation/LocationStep";
import { PropertyDetailsStep } from "./valuation/PropertyDetailsStep";
import { FeaturesAmenitiesStep } from "./valuation/FeaturesAmenitiesStep";
import { CalculationLoadingModal } from "./valuation/CalculationLoadingModal";
import { ValuationResultsDashboard } from "./valuation/ValuationResultsDashboard";
import { ElectronicReportModal } from "./ElectronicReportModal";

interface EndeksaValuationModalProps {
  input: ParcelInput;
  onChange: (updated: ParcelInput) => void;
  onClose: () => void;
  onNavigateToMap: () => void;
}

export const EndeksaValuationModal: React.FC<EndeksaValuationModalProps> = ({
  input,
  onChange,
  onClose,
  onNavigateToMap,
}) => {
  // Map ParcelInput to ValuationFormData
  const initialService: ValuationServiceType = 
    input.category === "konut" ? "konut" : input.category === "arazi" ? "arazi" : input.category === "ticari" ? "ticari" : "arsa";

  const [formData, setFormData] = useState<ValuationFormData>({
    ...INITIAL_VALUATION_DATA,
    service: initialService,
    city: input.city || "Çanakkale",
    district: input.district || "Merkez",
    neighborhood: input.neighborhood || "Kepez",
    ada: input.ada || "117",
    parsel: input.parsel || "9",
    grossAreaM2: input.areaM2 || 135,
    arsaAreaM2: input.areaM2 || 850,
    araziAreaM2: input.areaM2 || 1250,
    coordinates: input.coordinates || { lat: 40.1172, lng: 26.4022 },
    searchQuery: input.neighborhood
      ? `${input.neighborhood}, ${input.district}, ${input.city}`
      : "Kepez, Merkez, Çanakkale",
    step: 1,
  });

  // Dışarıdan (StartValuationModal veya Home aramasından) gelen input değişikliklerini anında uygula
  React.useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      city: input.city || prev.city,
      district: input.district || prev.district,
      neighborhood: input.neighborhood || prev.neighborhood,
      ada: input.ada || prev.ada,
      parsel: input.parsel || prev.parsel,
      coordinates: input.coordinates || prev.coordinates,
      grossAreaM2: input.areaM2 || prev.grossAreaM2,
      arsaAreaM2: input.areaM2 || prev.arsaAreaM2,
      araziAreaM2: input.areaM2 || prev.araziAreaM2,
      service: input.category === "konut" ? "konut" : input.category === "arazi" ? "arazi" : input.category === "ticari" ? "ticari" : "arsa",
      searchQuery: input.neighborhood
        ? `${input.neighborhood}, ${input.district}, ${input.city}`
        : prev.searchQuery,
    }));
  }, [
    input.city,
    input.district,
    input.neighborhood,
    input.ada,
    input.parsel,
    input.areaM2,
    input.category,
    input.coordinates?.lat,
    input.coordinates?.lng,
  ]);

  const [isCalculating, setIsCalculating] = useState(false);
  const [isDashboardActive, setIsDashboardActive] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const updateFormData = (updated: Partial<ValuationFormData>) => {
    setFormData((prev) => {
      const next = { ...prev, ...updated };
      // Sync back to ParcelInput
      onChange({
        ...input,
        city: next.city,
        district: next.district,
        neighborhood: next.neighborhood,
        ada: next.ada,
        parsel: next.parsel,
        areaM2: next.service === "arsa" ? next.arsaAreaM2 : next.service === "arazi" ? next.araziAreaM2 : next.grossAreaM2,
        category: next.service === "konut" ? "konut" : "arsa",
      });
      return next;
    });
  };

  const handleServiceChange = (newService: ValuationServiceType) => {
    updateFormData({ service: newService, step: 1 });
    setIsDashboardActive(false);
  };

  const handleStartCalculation = () => {
    setIsCalculating(true);
  };

  const handleCalculationComplete = () => {
    setIsCalculating(false);
    setIsDashboardActive(true);
  };

  const handleReset = () => {
    setIsDashboardActive(false);
    updateFormData({ step: 1 });
  };

  const isKonut = formData.service === "konut";
  const isArsa = formData.service === "arsa";
  const isArazi = formData.service === "arazi";

  const currentArea = 
    isArsa ? (formData.arsaAreaM2 || 850) :
    isArazi ? (formData.araziAreaM2 || 1250) : (formData.grossAreaM2 || 125);

  const baseKonutM2 = 
    formData.city?.toLowerCase().includes("istanbul") ? 85000 :
    formData.city?.toLowerCase().includes("izmir") || formData.city?.toLowerCase().includes("antalya") ? 78000 :
    formData.city?.toLowerCase().includes("çanakkale") ? 72500 : 70000;
  
  const ageFactor = (formData.buildingAge || 0) <= 3 ? 1.08 : (formData.buildingAge || 0) <= 8 ? 1.02 : (formData.buildingAge || 0) <= 15 ? 0.96 : 0.88;
  const floorFactor = formData.floorNumber === 0.5 || (formData.floorNumber >= 1 && formData.floorNumber <= 5) ? 1.03 : 0.97;
  const villaFactor = formData.housingTypeKind === "mustakil" ? 1.30 : 1.0;

  const konutCalculatedValue = Math.round(currentArea * baseKonutM2 * ageFactor * floorFactor * villaFactor);

  const currentMarketValue = isKonut 
    ? Math.max(7800000, konutCalculatedValue)
    : isArazi 
      ? Math.round(currentArea * 450) 
      : Math.round(currentArea * (formData.arsaKaks ? formData.arsaKaks * 12500 : 18500));

  return (
    <div className="min-h-[calc(100vh-64px)] w-full bg-[#F8FAFC] py-6 sm:py-8 px-3 sm:px-6 flex flex-col items-center">
      {/* 1. ÜST HEADER & STEPPER */}
      <ValuationHeader
        activeService={formData.service}
        onServiceChange={handleServiceChange}
        currentStep={formData.step}
        onStepClick={(step) => updateFormData({ step })}
        onClose={onClose}
        isDashboardActive={isDashboardActive}
      />

      {/* 2. ADIMLAR / SONUÇ GÖRÜNÜMÜ */}
      {isDashboardActive ? (
        <ValuationResultsDashboard
          data={formData}
          onReset={handleReset}
          onOpenReportModal={() => setShowReportModal(true)}
        />
      ) : (
        <>
          {formData.step === 1 && (
            <LocationStep
              data={formData}
              onChange={updateFormData}
              onNext={() => updateFormData({ step: 2 })}
            />
          )}

          {formData.step === 2 && (
            <PropertyDetailsStep
              data={formData}
              onChange={updateFormData}
              onPrev={() => updateFormData({ step: 1 })}
              onNext={() => updateFormData({ step: 3 })}
            />
          )}

          {formData.step === 3 && (
            <FeaturesAmenitiesStep
              data={formData}
              onChange={updateFormData}
              onPrev={() => updateFormData({ step: 2 })}
              onSubmit={handleStartCalculation}
            />
          )}
        </>
      )}

      {/* 3. HESAPLAMA YÜKLENİYOR MODALI */}
      <CalculationLoadingModal
        isOpen={isCalculating}
        onComplete={handleCalculationComplete}
        service={formData.service}
      />

      {/* 4. 13 SAYFALIK RESMİ ELEKTRONİK RAPOR MODALI */}
      <ElectronicReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        formData={formData}
        propertyTitle={`${formData.city} / ${formData.district} / ${formData.neighborhood || "Merkez"}`}
        category={formData.service === "konut" ? "konut" : formData.service === "arazi" ? "arazi" : "arsa"}
        locationText={`${formData.neighborhood || "Merkez"}, ${formData.district}, ${formData.city}`}
        parcelText={`${formData.city}, ${formData.district}, ${formData.neighborhood || "Merkez"}, ${formData.ada} Ada, ${formData.parsel} Parsel`}
        marketValueTL={currentMarketValue}
        areaM2={currentArea}
      />
    </div>
  );
};
