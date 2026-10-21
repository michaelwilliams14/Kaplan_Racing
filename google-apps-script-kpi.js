/**
 * SALES GRAND PRIX - READ-ONLY KPI SYNC
 * 
 * Purpose:
 * Pulls sales figures, KPI counts, and accessory units directly from Google Sheets.
 * All car setups, custom pins, colors, and tuning upgrades remain strictly in the app!
 * 
 * Setup:
 * 1. Open your Google Sheet.
 * 2. Ensure row 1 has columns: Name | 3-Step Systems | Maintainers | Strengtheners | Google Reviews | Accessories
 * 3. Extensions > Apps Script > Paste this code into Code.gs.
 * 4. Deploy > New deployment > Select type: "Web app".
 * 5. Execute as: "Me", Who has access: "Anyone".
 * 6. Copy the generated Web App URL and paste it into the Grand Prix Manager Settings or App Config!
 */

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("KPIs") || ss.getSheets()[0];
  var data = sheet.getDataRange().getValues();
  
  if (data.length < 2) {
    return ContentService.createTextOutput(JSON.stringify({ kpiData: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  var consultants = [];
  
  // Row 0 is headers
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var name = String(row[0] || "").trim();
    if (!name) continue;
    
    // Columns:
    // Col 0: Consultant Name
    // Col 1: Full 3-Step Systems (or primary KPI)
    // Col 2: Maintainers
    // Col 3: Strengtheners
    // Col 4: Google Reviews
    // Col 5: Accessories / Add-ons
    consultants.push({
      name: name,
      threeStep: Number(row[1]) || 0,
      maintainer: Number(row[2]) || 0,
      strengthener: Number(row[3]) || 0,
      reviews: Number(row[4]) || 0,
      accessories: Number(row[5]) || 0
    });
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    lastSync: new Date().toISOString(),
    consultants: consultants
  })).setMimeType(ContentService.MimeType.JSON);
}
