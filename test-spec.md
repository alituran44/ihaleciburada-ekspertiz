import { calculateFeasibility } from "./src/lib/calculator.js";

// Basic assertions test script
console.log("Running Calculator Unit Tests...");

const sample = {
  title: "Test Parsel",
  city: "Çanakkale",
  district: "Merkez",
  neighborhood: "Kepez",
  ada: "248",
  parsel: "12",
  areaM2: 1000,
  roadAccess: "var",
  roadFrontageM: 20,
  isCornerParcel: true,
  topography: "duz",
  zoningType: "konut",
  kaks: 1.50,
  taks: 0.35,
  gabariM: 15.5,
  maxFloors: 5,
  relinquishmentRatio: 10,
  askedPriceTL: 10000000,
  isTender: false,
  estimatedLandM2PriceTL: 12000,
  estimatedUnitSaleM2PriceTL: 40000,
  contractorSharePercent: 50,
  consultantName: "Test",
  consultantPhone: "0555",
  consultantAgency: "Test Agency",
};

// Test 1: Area calculations with 10% relinquishment
const netAreaExpected = 1000 * 0.9; // 900 m2
const emsalAreaExpected = 900 * 1.5; // 1350 m2

// We can compile or run ts via ts-node or run a lightweight test
console.log("Expected Net Area:", netAreaExpected);
console.log("Expected Emsal Area:", emsalAreaExpected);
