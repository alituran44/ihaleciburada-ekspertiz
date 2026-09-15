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
    input.category === "konut" ? "konut" : "arsa";

  const [formData, setFormData] = useState<ValuationFormData>({
    ...INITIAL_VALUATION_DATA,
    service: initialService,
    city: input.city || "Ankara",
    district: input.district || "Etimesgut",
    neighborhood: input.neighborhood || "Devlet Mah.",
    ada: input.ada || "48507",
    parsel: input.parsel || "1",
    grossAreaM2: input.areaM2 || 110,
    arsaAreaM2: input.areaM2 || 850,
    araziAreaM2: input.areaM2 || 1170,
    searchQuery: input.neighborhood
      ? `${input.neighborhood} ${input.district} ${input.city}`
      : "Referans Ankara Sitesi E Blok Devlet Mah Etimesgut Ankara",
    step: 1,
  });

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

  const currentArea = 
    formData.service === "arsa" ? formData.arsaAreaM2 :
    formData.service === "arazi" ? formData.araziAreaM2 : formData.grossAreaM2;

  const currentUnitPrice = 
    formData.service === "konut" ? 71818 :
    formData.service === "arazi" ? 419 :
    formData.service === "arsa" ? 18500 : 45000;

  const currentMarketValue = 
    formData.service === "konut" ? 7900000 :
    formData.service === "arazi" ? 490000 : Math.round(currentArea * currentUnitPrice);

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
