# Sales Grand Prix - Pure KPI Sheet Integration Edition

In this architecture:
1. **Google Sheets is strictly read-only for KPI figures**:
   - The sheet only contains: Consultant Name, Full 3-Step Systems, Maintainers, Strengtheners, Reviews, and Accessories.
   - It is NOT used for cars, pins, colors, or upgrades.
2. **Consultant Garages & Upgrades are 100% in the app**:
   - Each consultant logs in with their private 4-digit PIN.
   - They pick their car model and custom color inside the app.
   - The app looks at their sales units from the Google Sheet, calculates their total earned credits, subtracts what they've spent, and lets them upgrade Engine, Transmission, Tires, and Nitrous directly.
3. **Manager Command**:
   - Displays real-time standings and car levels.
   - Triggers the live 60fps Grand Prix Race with 5-light F1 countdown.
