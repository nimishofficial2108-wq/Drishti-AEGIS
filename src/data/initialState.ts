import { AegisState } from '../types/aegis';

export const INITIAL_AEGIS_STATE: AegisState = {
  meta: {
    title: "DRISHTI AEGIS | Enterprise Risk Foresight & Capital Intelligence",
    source: "Consulting Consortium case brief Appendices 1-6",
    dataVersion: "Case FY26 Baseline + Proposed Investment Thesis",
    liveConnected: false,
    version: "Executive Enterprise Edition"
  },
  case: {
    revenue: 8420,
    fillRate: 86,
    inventoryDays: 46,
    ebitdaMargin: 10.8,
    networkInventory: 1230,
    ownedInventory: 865,
    networkDayRs: 26.7,
    ownedDayRs: 18.8,
    boardFill: 95,
    boardInventory: 35,
    budget: 150,
    maxCostAvoidShare: 0.4,
    irrHurdle: 0.18,
    maxPayback: 30,
    pilotCNoVerifiedValueBeforeMonth: 10,
    regions: [
      { name: "North", fill: 82, days: 51, excess: 68, shortage: 21 },
      { name: "West", fill: 81, days: 52, excess: 81, shortage: 26 },
      { name: "Central", fill: 94, days: 31, excess: 3, shortage: 2 },
      { name: "South", fill: 91, days: 37, excess: 14, shortage: 6 },
      { name: "East", fill: 87, days: 43, excess: 19, shortage: 18 }
    ]
  },
  gates: [
    {
      month: 9,
      name: "Gate 1",
      fill: 89,
      inventory: 43,
      ebitda: 22,
      wc: null,
      tranche: 58,
      failure: "Second ₹58 Cr deferred for two quarters; programme revised."
    },
    {
      month: 22,
      name: "Gate 2",
      fill: 92,
      inventory: 38,
      ebitda: 70,
      wc: 170,
      tranche: 58,
      failure: "Third ₹58 Cr lapses; reforecast with funded scope only."
    }
  ],
  alloc: [
    {
      name: "S&OP + decision rights",
      total: 9,
      phase: [9, 0, 0],
      proof: "Owner, forecast bias controls, incentive redesign signed by Month 6",
      scores: [5, 4, 3, 5, 5]
    },
    {
      name: "Incremental national master data",
      total: 14,
      phase: [8, 4, 2],
      proof: "Master SKU-location IDs; signed proof of ₹12 Cr overlap",
      scores: [5, 4, 4, 4, 5]
    },
    {
      name: "North/West replenishment",
      total: 52,
      phase: [8, 32, 12],
      proof: "Stage validation after Month 10; monitor warehouse AND distributor stock",
      scores: [5, 5, 4, 2, 4]
    },
    {
      name: "Supply-chain control tower",
      total: 32,
      phase: [0, 14, 18],
      proof: "Clean stock feed, action rights and exception closure",
      scores: [4, 4, 3, 2, 4]
    },
    {
      name: "Commerce fast-response",
      total: 11,
      phase: [4, 3, 4],
      proof: "Quick-commerce POS/order feeds, at-risk SKUs, penalty logs",
      scores: [4, 5, 2, 4, 3]
    },
    {
      name: "Snacks scheduling / SMED",
      total: 10,
      phase: [2, 3, 5],
      proof: "Changeover diary, sellable backlog vs capacity expansion",
      scores: [3, 4, 2, 4, 3]
    },
    {
      name: "GT physical stock assurance",
      total: 9,
      phase: [2, 0, 7],
      proof: "Independent stock counts, distributor reconciliations",
      scores: [4, 4, 3, 4, 4]
    },
    {
      name: "3-year running & adoption",
      total: 13,
      phase: [1, 2, 10],
      proof: "Licence, connectivity, field-adoption invoices",
      scores: [4, 3, 3, 4, 5]
    }
  ],
  scoreWeights: [0.35, 0.25, 0.15, 0.15, 0.10],
  observations: [
    {
      month: 0,
      fillRate: 86,
      inventoryDays: 46,
      ebitdaRunRate: 0,
      networkWcRelease: 0,
      ownedCashRelease: 0,
      audited: true,
      financeCertified: true,
      physicalCountVerified: true,
      benefitDedupVerified: false,
      source: "Case FY26 baseline; genesis block",
      blockNumber: 1042,
      txHash: "0x8f2a4b91e03c78d5910fae3b62c1d98471b058a9c34d28e19c05e1974ef9b012",
      prevBlockHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
      merkleRoot: "0x3e1f0b9874c2d61aa890ce516e9102bf891234cda01928bcdeef1029384756ab",
      validatorNode: "Node #01 (Board Audit Committee)",
      signature: "0x3045022100e47a98b2f1c8901de398a0c5b70912ec910384756bf0192837465abcde1029",
      timestamp: "2026-03-31T18:30:00.000Z"
    }
  ],
  risks: [
    {
      id: "R1",
      name: "Gate 1 EBITDA delivery",
      likelihood: 4,
      impact: 5,
      undetectability: 3,
      lead: "Finance / Sales",
      trigger: "M6 EBITDA trajectory below ₹22 Cr",
      response: "Recoverable demand proof; targeted quick wins; Finance review",
      mitigation: 0.25,
      effects: {
        eb9: 6.0,
        fill9: 0.7,
        delay: 2
      }
    },
    {
      id: "R2",
      name: "Stock-data mismatch",
      likelihood: 4,
      impact: 5,
      undetectability: 4,
      lead: "Sales / Finance",
      trigger: "Physical vs reported stock divergence; FY26 audit −12% avg",
      response: "Physical count + stock reconciliation; no phantom release",
      mitigation: 0.25,
      effects: {
        days: 1.8,
        wcLoss: 0.14,
        eb9: 1.0
      }
    },
    {
      id: "R3",
      name: "Shared data scope overrun",
      likelihood: 4,
      impact: 4,
      undetectability: 3,
      lead: "CIO / Procurement",
      trigger: "₹12 Cr overlap uncontracted at M3",
      response: "Freeze scope change; prove overlap; reallocate inside ₹150 Cr",
      mitigation: 0.25,
      effects: {
        cost: 12,
        delay: 2
      }
    },
    {
      id: "R4",
      name: "Replenishment pilot fails to scale",
      likelihood: 4,
      impact: 5,
      undetectability: 3,
      lead: "Supply Chain / COO",
      trigger: "Manual cleansing or adoption support persists",
      response: "Control-region holdout; staged activation and revalidation",
      mitigation: 0.25,
      effects: {
        fill: 1.4,
        days: 1.8,
        eb: 7.0,
        delay: 3
      }
    },
    {
      id: "R5",
      name: "Gate 2 EBITDA shortfall",
      likelihood: 4,
      impact: 5,
      undetectability: 4,
      lead: "CFO / COO",
      trigger: "Verified EBITDA below ₹70 Cr trajectory",
      response: "Rebuild benefit ledger; stop discretionary commitments",
      mitigation: 0.25,
      effects: {
        eb: 11.0,
        delay: 2
      }
    },
    {
      id: "R6",
      name: "Inventory transferred, not released",
      likelihood: 4,
      impact: 5,
      undetectability: 4,
      lead: "CFO / Warehouses",
      trigger: "Distributor stock falls but network stock flat",
      response: "Reconcile FG by node; exclude distributor-only transfer",
      mitigation: 0.25,
      effects: {
        days: 2.4,
        wcLoss: 0.33,
        ownedLoss: 0.27
      }
    },
    {
      id: "R7",
      name: "Quick-commerce delisting risk",
      likelihood: 3,
      impact: 4,
      undetectability: 2,
      lead: "Commercial / Digital",
      trigger: "Service <90%; 11 SKUs at delisting risk",
      response: "Protect at-risk profitable SKUs; retailer penalty dashboard",
      mitigation: 0.25,
      effects: {
        fill: 1.0,
        eb: 3.5,
        eb9: 1.0
      }
    },
    {
      id: "R8",
      name: "Scheduling / SMED delay",
      likelihood: 3,
      impact: 3,
      undetectability: 3,
      lead: "Plant C / COO",
      trigger: "Changeover efficiency off M7 plan",
      response: "SKU-family sequencing; finite capacity schedule; backlog test",
      mitigation: 0.25,
      effects: {
        eb: 9.8,
        eb9: 1.5,
        delay: 2
      }
    }
  ],
  timeline: [
    {
      range: "M0–M2",
      title: "Lock the truth",
      proof: "Independent FY26 baseline and regional physical stock; sign CFO attribution ledger; establish executive owner",
      leads: "CFO / Supply Chain",
      flag: "No unverified WC or pilot-C EBITDA"
    },
    {
      range: "M3–M4",
      title: "Repair signals and decisions",
      proof: "POS / order feeds, GT forecast-bias baseline, joint S&OP, contracts confirming ₹12 Cr overlap",
      leads: "Sales / CIO / Procurement",
      flag: "Re-scope if overlap unverified"
    },
    {
      range: "M5–M6",
      title: "Prove fast value",
      proof: "Quarter-end incentive pilot, targeted commerce SLAs, changeover event logs and plant sequencing trial",
      leads: "COO / Sales / Finance",
      flag: "Escalate if M9 EBITDA forecast under hurdle"
    },
    {
      range: "M7–M9",
      title: "Certify Gate 1",
      proof: "Independent 89% / 43d / ₹22 Cr audit; customer-order service contribution, stock reconciliation",
      leads: "Finance / Independent Audit",
      flag: "If ANY fails, next tranche delayed 2 quarters"
    },
    {
      range: "M10–M15",
      title: "Controlled N/W expansion",
      proof: "Regional replenishment limited release, matched comparison, manual-cleansing burden, net stock by node",
      leads: "Supply Chain / CIO",
      flag: "No extrapolation from pilot without control"
    },
    {
      range: "M16–M21",
      title: "Demonstrate national economics",
      proof: "Control tower actionable alerts, GT stock assurance, distinct capacity-vs-service benefit ledger",
      leads: "COO / CFO",
      flag: "Independent yield below target requires rebaseline"
    },
    {
      range: "M22",
      title: "Certify Gate 2",
      proof: "Audited 92% / 38d / ₹70 Cr / ₹170 Cr network release plus allowed cost share",
      leads: "Audit Committee",
      flag: "If ANY fails, third tranche lapses"
    },
    {
      range: "M23–M36",
      title: "Institutionalize and verify returns",
      proof: "M30 cash payback, recurring service/inventory, owned cash release and 5Y forecast refresh",
      leads: "CEO / CFO",
      flag: "Stop benefit recognition upon inventory rebound"
    }
  ],
  model: {
    netEbitdaMonthly: [
      0.0, 0.0, 0.0, 0.0, 0.25, 0.5, 0.8333333333333334, 1.25, 1.5833333333333333,
      1.8833333333333335, 2.0833333333333335, 2.4166666666666665, 2.8333333333333335,
      3.1666666666666665, 3.5, 3.75, 4.083333333333333, 4.5, 4.833333333333333,
      5.083333333333333, 5.416666666666667, 5.666666666666667, 5.986666666666667,
      5.986666666666667, 5.986666666666667, 5.986666666666667, 5.986666666666667,
      5.986666666666667, 5.986666666666667, 5.986666666666667, 5.986666666666667,
      5.986666666666667, 5.986666666666667, 5.986666666666667, 5.986666666666667,
      5.986666666666667, 5.986666666666667, 5.986666666666667, 5.986666666666667,
      5.986666666666667, 5.986666666666667, 5.986666666666667, 5.986666666666667,
      5.986666666666667, 5.986666666666667, 5.986666666666667, 5.986666666666667,
      5.986666666666667, 5.986666666666667, 5.986666666666667, 5.986666666666667,
      5.986666666666667, 5.986666666666667, 5.986666666666667, 5.986666666666667,
      5.986666666666667, 5.986666666666667, 5.986666666666667, 5.986666666666667,
      5.986666666666667, 5.986666666666667
    ],
    monthlyProgrammeRunning: [
      0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1,
      0.16666666666666666, 0.16666666666666666, 0.16666666666666666, 0.16666666666666666,
      0.16666666666666666, 0.16666666666666666, 0.16666666666666666, 0.16666666666666666,
      0.16666666666666666, 0.16666666666666666, 0.16666666666666666, 0.16666666666666666,
      0.6666666666666666, 0.6666666666666666, 0.6666666666666666, 0.6666666666666666,
      0.6666666666666666, 0.6666666666666666, 0.6666666666666666, 0.6666666666666666,
      0.6666666666666666, 0.6666666666666666, 0.6666666666666666, 0.6666666666666666,
      0.6666666666666666, 0.6666666666666666, 0.6666666666666666, 0.6666666666666666,
      0.6666666666666666, 0.6666666666666666, 0.6666666666666666, 0.6666666666666666,
      0.6666666666666666, 0.6666666666666666, 0.6666666666666666, 0.6666666666666666,
      0.6666666666666666, 0.6666666666666666, 0.6666666666666666, 0.6666666666666666,
      0.6666666666666666, 0.6666666666666666, 0.6666666666666666, 0.6666666666666666,
      0.6666666666666666, 0.6666666666666666, 0.6666666666666666, 0.6666666666666666,
      0.6666666666666666, 0.6666666666666666, 0.6666666666666666
    ],
    daysReduction: [
      0.0, 0.0, 0.0, 0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0,
      3.35, 3.7375, 4.125, 4.5125, 4.9, 5.2875, 5.675, 6.0625,
      6.45, 6.8375, 7.225, 7.6125, 8.0, 8.2, 8.43, 8.66,
      8.89, 9.12, 9.35, 9.58, 9.82, 10.05, 10.28, 10.51,
      10.74, 10.97, 11.2, 11.2, 11.2, 11.2, 11.2, 11.2,
      11.2, 11.2, 11.2, 11.2, 11.2, 11.2, 11.2, 11.2,
      11.2, 11.2, 11.2, 11.2, 11.2, 11.2, 11.2, 11.2,
      11.2, 11.2, 11.2
    ],
    cashRecognizedAtM22: 0.25,
    cashRecognizedAtM36: 0.35
  },
  distribution: {
    fill22: [4, 6, 8],
    days22: [5, 8, 11],
    recovery: [0.35, 0.45, 0.6],
    unitContribution: [8.6, 10.2, 11.8],
    separateYield: [0, 9.8, 18],
    avoided: [10, 27.2, 36],
    running: [5, 8, 12],
    fillM9Fraction: [0.38, 0.5, 0.7],
    daysM9Fraction: [0.25, 0.375, 0.55],
    ebitdaM9Fraction: [0.22, 0.315, 0.4]
  },
  assumptions: {
    midpointCalibrationRecovery: 0.5,
    simulationDraws: 30000,
    simulationSeed: 20261016,
    effortBenefitM9: "Team projection: FY26 fill +3pp; net EBITDA run-rate 22.6 at M9; not evidenced",
    noPilotCValueBeforeM10: true
  },
  whatIf: {
    '9': {
      fillRate: 86,
      inventoryDays: 46,
      ebitdaRunRate: 0,
      networkWcRelease: 0
    },
    '22': {
      fillRate: 86,
      inventoryDays: 46,
      ebitdaRunRate: 0,
      networkWcRelease: 0
    }
  },
  controls: {
    correlation: 0.35,
    draws: 20000,
    seed: 20261016,
    valueRealization: 1.0,
    auditMode: false,
    touched: {
      '9': {},
      '22': {}
    }
  },
  ml: {
    blend: 0,
    rows: [],
    origin: "SYNTHETIC DEMO",
    lambda: 0.75,
    model: null
  }
};
