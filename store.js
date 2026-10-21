// Store Engine: Google Sheets for KPI figures + App Storage for Garages & Upgrades
const DEFAULT_RULES = [
  { id: 'kpi_3step', key: 'threeStep', name: 'Full 3-Step System', points: 150, category: 'kpi' },
  { id: 'kpi_maintainer', key: 'maintainer', name: 'Maintainer Unit', points: 80, category: 'kpi' },
  { id: 'kpi_strengthener', key: 'strengthener', name: 'Strengthener Unit', points: 80, category: 'kpi' },
  { id: 'kpi_review', key: 'reviews', name: '5-Star Google Review', points: 40, category: 'kpi' },
  { id: 'acc_general', key: 'accessories', name: 'Accessories & Add-ons', points: 30, category: 'acc' }
];

const DEFAULT_STATE = {
  managerPin: "2026",
  campaign: "Monthly Sales Grand Prix",
  sheetsUrl: "", // Google Sheets Web App URL
  rules: DEFAULT_RULES,
  racers: [
    { id: 'r1', name: 'Heather', pin: '1111', car: '🏎️', carName: 'Redline F1', color: '#ef4444', spentCredits: 0, upgrades: { topSpeed: 1, accel: 1, handling: 0, nos: 0 } },
    { id: 'r2', name: 'Matt', pin: '2222', car: '🚗', carName: 'Turbo GT', color: '#3b82f6', spentCredits: 0, upgrades: { topSpeed: 1, accel: 0, handling: 1, nos: 0 } },
    { id: 'r3', name: 'Daryl', pin: '3333', car: '🚙', carName: 'Offroad Trophy', color: '#10b981', spentCredits: 0, upgrades: { topSpeed: 0, accel: 1, handling: 0, nos: 0 } },
    { id: 'r4', name: 'Bonnie', pin: '4444', car: '🚓', carName: 'Interceptor', color: '#f59e0b', spentCredits: 0, upgrades: { topSpeed: 0, accel: 0, handling: 1, nos: 0 } },
    { id: 'r5', name: 'Darris', pin: '5555', car: '🏎', carName: 'LeMans Pro', color: '#8b5cf6', spentCredits: 0, upgrades: { topSpeed: 1, accel: 0, handling: 0, nos: 0 } }
  ],
  kpiSnapshot: {} // name -> { threeStep, maintainer, strengthener, reviews, accessories }
};

class GrandPrixStore {
  constructor() {
    this.cachedData = null;
    this.listeners = [];
  }

  init(callback) {
    if (callback) this.listeners.push(callback);
    const raw = localStorage.getItem('grandprix_kpi_state');
    if (raw) {
      try { this.cachedData = JSON.parse(raw); } catch(e) { this.cachedData = DEFAULT_STATE; }
    } else {
      this.cachedData = DEFAULT_STATE;
      this.saveLocal();
    }

    // If sheetsUrl is configured, poll automatically
    if (this.cachedData.sheetsUrl) {
      this.syncFromGoogleSheet();
      setInterval(() => this.syncFromGoogleSheet(), 30000); // 30s auto-refresh
    }

    this.notify();
  }

  saveLocal() {
    localStorage.setItem('grandprix_kpi_state', JSON.stringify(this.cachedData));
    this.notify();
  }

  notify() {
    this.listeners.forEach(cb => {
      try { cb(this.cachedData); } catch(e) { console.error(e); }
    });
  }

  getState() {
    return this.cachedData || DEFAULT_STATE;
  }

  // Calculate earned credits and total points dynamically from Sheet KPIs minus spent credits
  getRacerCalculations(racer) {
    const kpis = (this.cachedData.kpiSnapshot && this.cachedData.kpiSnapshot[racer.name.toLowerCase()]) || {
      threeStep: 0, maintainer: 0, strengthener: 0, reviews: 0, accessories: 0
    };

    let totalPoints = 0;
    let kpiCount = 0;
    let accCount = 0;

    this.cachedData.rules.forEach(rule => {
      const units = Number(kpis[rule.key]) || 0;
      totalPoints += units * rule.points;
      if (rule.category === 'kpi') kpiCount += units;
      else accCount += units;
    });

    const spent = Number(racer.spentCredits) || 0;
    const availableCredits = Math.max(0, totalPoints - spent);

    return {
      kpiCount,
      accCount,
      totalPoints,
      availableCredits,
      kpis
    };
  }

  async syncFromGoogleSheet() {
    if (!this.cachedData.sheetsUrl) return false;
    try {
      const res = await fetch(this.cachedData.sheetsUrl);
      const json = await res.json();
      if (json && json.consultants) {
        if (!this.cachedData.kpiSnapshot) this.cachedData.kpiSnapshot = {};
        json.consultants.forEach(c => {
          this.cachedData.kpiSnapshot[c.name.toLowerCase()] = c;
        });
        this.saveLocal();
        return true;
      }
    } catch(err) {
      console.warn("Could not sync from Google Sheet URL:", err);
    }
    return false;
  }
}

window.store = new GrandPrixStore();
