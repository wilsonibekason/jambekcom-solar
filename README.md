# Solar Insight Hub

Jambekcom Solutions — Solar Energy Generation Estimator PWA

1. ROLE

You are a senior full-stack engineer, product designer, data visualization engineer, and PWA architect.

Build a production-quality Solar Energy Generation Estimator for Jambekcom Solutions.

The application is a React-based Progressive Web App (PWA) that converts an existing Google Sheets solar-generation estimator into a modern, dynamic, highly responsive web dashboard.

The uploaded spreadsheet is the primary source of truth for the application's current calculation logic.

Do NOT redesign the calculation methodology arbitrarily.

First understand the spreadsheet, reproduce its logic accurately, then build a significantly better user experience around it.

2. PROJECT CONTEXT

Jambekcom Solutions is working with solar energy systems and needs a tool that can estimate expected solar energy generation based on:

Solar panel rated power

Number of panels

Series configuration

Parallel strings

System performance / derating

Geographic location

Latitude

Longitude

Weather forecast

Sunshine duration

Precipitation probability

Precipitation

Weather conditions

Solar radiation

The application should answer a simple question:

"Given this solar installation and the upcoming weather conditions at this location, approximately how much energy should this system generate each day?"

The result should be much easier to understand than the spreadsheet.

3. SOURCE MATERIAL

You have been provided with:

The existing Excel export of the Google Sheet:
Solar_Energy_Generation_Estimator_Google.xlsx

The Jambekcom Solutions logo/brand image.

The original Google Drive / Google Sheets references supplied with this task.

Treat the spreadsheet as the calculation specification.

Do not remove functionality simply because the spreadsheet implementation is primitive.

Instead:

Preserve the underlying mathematics.

Improve the interface.

Make the calculations dynamic.

Replace spreadsheet formulas with clean TypeScript calculation functions.

Replace Google Apps Script weather refreshing with a proper application data layer.

Make the result usable on desktop, tablet and especially mobile.

4. CURRENT SPREADSHEET STRUCTURE

The spreadsheet contains four sheets:

Sheet 1 — Solar Estimator

Current system inputs:

Panel rated power

Default:

650 W

Description:

Rated power of one PV panel.

Panels in series

Default:

4 panels

Parallel strings

Default:

2 strings

System performance / derating

Default:

0.8

This represents the overall usable-performance factor after accounting for things such as:

Temperature

Wiring losses

Mismatch

Inverter/controller losses

Dust

Other system inefficiencies

The UI should display this clearly as a percentage:

80%

Do not confuse this with 80% loss.

It is an 80% performance/efficiency factor.

Location

Default:

Abuja, Nigeria

Latitude:

9.0765

Longitude:

7.3986

Forecast horizon:

16 days

The location must NOT be hard-coded into the application.

Users must be able to change the location.

5. CURRENT SPREADSHEET CALCULATIONS

These calculations must be preserved.

Total panels

Formula:

Panels in series × Parallel strings

Example:

4 × 2 = 8 panels

Array DC capacity

Formula:

Panel rated power × Total panels

Example:

650 W × 8 = 5,200 W

Array DC capacity in kW

Formula:

Array DC capacity / 1000

Example:

5,200 / 1000 = 5.2 kW

Baseline daily energy at 5 PSH

The spreadsheet uses:

Array DC capacity × 5 × Performance factor / 1000

Example:

5200 × 5 × 0.8 / 1000 = 20.8 kWh/day

This should be presented as a baseline reference rather than the actual forecast.

Label it clearly:

Baseline Daily Energy

with a supporting explanation such as:

"Estimated daily production using 5 peak sun hours."

6. WEATHER-BASED ENERGY CALCULATION

The existing spreadsheet uses Open-Meteo weather data.

The important daily weather fields are:

Date

Weather code

Condition

Rain probability

Rain/precipitation

Sunshine duration

Effective PSH

Usable energy

Shortwave radiation

Data source

The spreadsheet currently treats:

Sunshine duration (hours) = Effective PSH

Therefore:

Effective PSH

Effective PSH = Sunshine duration in hours

Do NOT silently replace this calculation with another methodology.

If you want to introduce a more sophisticated solar-radiation-based model later, treat that as a separate optional calculation mode rather than changing the default spreadsheet-compatible mode.

7. FORECAST ENERGY FORMULA

For every forecast day:

Usable Energy (kWh) = Array DC Capacity (W) × Effective PSH × Performance Factor / 1000

Where:

Array DC Capacity = panel wattage × total panels

Effective PSH = daily sunshine duration in hours

Performance Factor = system derating/performance factor

Example:

5,200 W array

6 hours sunshine

80% performance

Calculation:

5200 × 6 × 0.8 / 1000

=

24.96 kWh

Display:

24.96 kWh

8. FORECAST PERIOD CALCULATIONS

The dashboard should calculate:

Forecast-period energy

Sum of all daily usable energy values.

Forecast average daily energy

Average of all daily usable energy values.

Best forecast day

Day with the highest expected energy production.

Lowest forecast day

Day with the lowest expected energy production.

Average sunshine

Average sunshine duration across the forecast.

Average rain probability

Average precipitation probability.

These additional summary metrics are an interface improvement and should not change the original spreadsheet calculation model.

9. WEEKLY SUMMARY

The existing spreadsheet groups the forecast into:

Days 1–7

Days 8–14

Days 15–16

For each period calculate:

Average rain probability

Average effective PSH

Total usable energy

Average sunshine duration

Weather impact

The existing spreadsheet calculates:

Weather Impact = 1 - (Average Effective PSH / 5)

Preserve this logic for spreadsheet compatibility.

However, in the UI, present it in a human-readable way.

For example:

Favorable

Moderate

Poor

with the actual percentage/value available in a tooltip or details panel.

Do not misrepresent this as an official weather-service confidence score.

Call it something like:

Weather Impact on Production

10. OPEN-METEO INTEGRATION

Use Open-Meteo as the live weather provider.

Use the official forecast API and request the daily variables required by the estimator.

The relevant variables include:

weather_code

precipitation_probability_max

precipitation_sum

sunshine_duration

shortwave_radiation_sum

Open-Meteo's documentation confirms these are available as daily forecast variables. Sunshine duration is supplied in seconds and should be converted to hours by dividing by 3600.

The application should also request useful contextual variables where appropriate, such as:

temperature minimum

temperature maximum

sunrise

sunset

precipitation hours

wind speed

daylight duration

These can enrich the UI without changing the core energy calculation.

11. LOCATION SYSTEM

Do not restrict the application to Abuja.

The user should be able to enter a location.

Ideal experience:

Location search

User enters:

Abuja

or:

Lagos

or:

Enugu

or:

Port Harcourt

or any other supported location.

Resolve the location into:

City

Country

Latitude

Longitude

Timezone

Then use those coordinates for the weather forecast.

If a geocoding service is used, isolate it behind a clean service interface so it can be replaced later.

Also provide an advanced option where the user can manually enter:

Latitude

Longitude

This is useful for solar installation sites outside major cities.

12. DASHBOARD EXPERIENCE

The dashboard should NOT look like a spreadsheet.

It should feel like a modern professional solar-energy monitoring/forecasting product.

Suggested layout:

Header

Jambekcom Solutions logo

Product name:

Solar Energy Estimator

Current location

Weather refresh status

Last updated time

Refresh button

Settings button

13. HERO / OVERVIEW SECTION

At the top, show a strong summary.

Example:

Solar Production Forecast

Abuja, Nigeria

Next 16 days

Then show the most important metrics:

Forecast Energy

XXX kWh

Average / Day

XX.X kWh

System Size

5.2 kW

Best Day

XX.X kWh

This section should immediately tell the user how the solar system is expected to perform.

14. SYSTEM CONFIGURATION CARD

Create a clean card/panel called:

Solar System Configuration

Fields:

Panel rated power

Number of panels in series

Parallel strings

Total panels

System capacity

Performance factor

Make input fields editable.

Whenever a value changes:

Recalculate total panels.

Recalculate array capacity.

Recalculate baseline energy.

Recalculate all forecast production.

Update charts.

Update summaries.

The user should never need to press "calculate."

Calculations should update reactively.

15. LOCATION CARD

Create:

Installation Location

Display:

Location name

Country

Latitude

Longitude

Timezone

Include:

Change Location

The location picker should be mobile-friendly.

If coordinates are manually entered, validate:

Latitude:

-90 to 90

Longitude:

-180 to 180

16. MAIN FORECAST GRAPH

This is one of the most important parts of the application.

Create an interactive chart showing:

X axis

Date

Y axis

Expected energy generation in kWh

Example:

Monday — 18.2 kWh

Tuesday — 24.6 kWh

Wednesday — 13.8 kWh

etc.

The chart should support:

Hover/tap interaction

Tooltip

Responsive resizing

Daily values

Clear labels

Smooth visual transitions

Good mobile behavior

Use a professional charting library such as:

Recharts

Apache ECharts

or another production-quality React charting library

Do NOT create a fake chart with static SVG data.

It must be driven by actual forecast calculations.

17. OPTIONAL WEATHER OVERLAY

Where practical, allow the user to visually understand why production changes.

For example:

Energy:

24.8 kWh

Sunshine:

6.2 h

Rain probability:

20%

Weather:

Partly cloudy

This can appear in the chart tooltip.

18. DAILY FORECAST TABLE

Below the graph, create a detailed forecast table.

Columns:

DateWeatherRainSunshinePSHRadiationExpected Energy

Example:

24 Aug | Cloudy | 85% | 8.1h | 8.1 | 19.4 MJ/m² | 33.7 kWh

The table must be:

horizontally scrollable on small screens

readable on mobile

sortable where useful

visually clean

On mobile, consider transforming each row into a compact forecast card instead of forcing a huge table.

19. DAILY FORECAST CARDS

For mobile, create a card-based alternative.

Each day can show:

Mon, Aug 24

Weather icon

24.8 kWh

Expected generation

6.2h sunshine

25% rain

Partly cloudy

This should be highly readable at a glance.

20. WEATHER CONDITION MAPPING

Preserve the spreadsheet's existing WMO weather-code interpretation.

The spreadsheet currently groups conditions approximately into:

Clear sky

Cloudy / overcast

Fog / drizzle / rain

Rain

Showers

Thunderstorm

Other

However, implement this cleanly using a reusable weather-code mapping function.

Do not scatter weather-code logic throughout the UI.

Create something like:

getWeatherCondition(code)

returning:

label

icon

severity/category

The mapping should follow WMO/Open-Meteo weather codes.

21. WEATHER IMPACT

Create a visual indication of expected weather impact.

Example:

Production outlook

Good

or

Moderate

or

Low

Use sunshine duration, rain probability and forecast production to help users understand the outlook.

But keep the spreadsheet's original "Weather Impact" calculation available for compatibility.

Do not claim the metric is a scientifically validated production confidence score.

22. WEEKLY SUMMARY

Create a section:

Forecast Summary

Cards/tabs:

Week 1

Days 1–7

Total energy

Average sunshine

Average rain probability

Average PSH

Weather impact

Week 2

Days 8–14

Same metrics.

Final period

Days 15–16

Same metrics.

Make the summary visually easy to compare.

23. BASELINE VS FORECAST

Create a useful comparison.

Baseline

Production assuming:

5 PSH

versus:

Weather Forecast

Production based on actual forecast sunshine duration.

For example:

Baseline:

20.8 kWh/day

Forecast:

17.4 kWh/day

Difference:

-16.3%

This helps users understand how upcoming weather affects expected output.

Do not modify the underlying spreadsheet formulas.

24. SYSTEM SIZE VISUALIZATION

Add a small visual representation of the solar array.

Example:

8 Panels

5.2 kW DC

Display:

4 × 2 configuration

This should make the configuration easier to understand.

Do not make the visual overly complicated.

25. DATA FRESHNESS

The user should always know whether the weather data is current.

Display:

Weather updated: 10 minutes ago

or:

Last updated: Aug 24, 2026 00:45

Also show:

Source: Open-Meteo

Provide a refresh button.

When refreshing:

Show loading state.

Disable duplicate refresh requests.

Handle errors.

Preserve previous successful forecast until the new data arrives.

Show when the refresh completed.

26. ERROR HANDLING

The app must gracefully handle:

Weather API failure

Show:

"Unable to refresh weather data."

Do not destroy the existing forecast.

Invalid location

Show:

"Please enter a valid location."

Invalid panel configuration

Show appropriate validation.

Network offline

Show:

"You are offline. Showing the last available forecast."

No forecast data

Show a useful empty state.

Never show raw JavaScript errors to users.

27. PWA REQUIREMENTS

This must be a REAL PWA.

Not merely a responsive website.

Implement:

Web app manifest

Service worker

Installable application

App icons

Splash/theme configuration

Offline support

Cache strategy

Network-aware behavior

The application should be installable on:

Android

iOS where supported

Windows

macOS

modern desktop browsers

Use an established React PWA approach.

If using Vite, use a suitable PWA plugin.

If using Next.js, use an appropriate service-worker/PWA implementation.

Do not build a fake "Install App" button.

The install prompt should only appear when the browser actually supports installation.

28. OFFLINE BEHAVIOR

The most recently successful forecast should be cached locally.

If the user opens the application without internet:

Show:

Offline

and:

Last updated forecast

The user should still be able to:

view the last forecast

view calculations

change system configuration

see charts based on cached weather data

Weather cannot be refreshed until connectivity returns.

29. LOCAL DATA STORAGE

For the initial version, avoid unnecessary backend complexity.

Use local storage or IndexedDB for:

System configuration

Last selected location

Last successful forecast

User preferences

Last refresh timestamp

Structure the application so a backend/database can be introduced later without rewriting the calculation engine.

30. ARCHITECTURE

Use a clean architecture.

Suggested structure:

src/
  components/
    dashboard/
    forecast/
    charts/
    system/
    weather/
    ui/

  pages/
    Dashboard
    Settings

  services/
    weather/
      openMeteo.ts
      geocoding.ts

  calculations/
    solarEstimator.ts
    weatherImpact.ts
    forecastSummary.ts

  hooks/
    useWeatherForecast.ts
    useSolarEstimator.ts
    useLocation.ts

  types/
    solar.ts
    weather.ts

  utils/
    weatherCodes.ts
    formatting.ts
    storage.ts

  pwa/


The exact structure can differ, but maintain the same separation of concerns.

31. CALCULATION ENGINE

Create a pure calculation module.

It should be independently testable.

Example conceptual API:

calculateSystemConfiguration({
  panelRatedPower,
  panelsInSeries,
  parallelStrings,
  performanceFactor
})


Returns:

{
  totalPanels,
  arrayDcCapacityWatts,
  arrayDcCapacityKw,
  baselineDailyEnergyKwh
}


Then:

calculateDailyEnergy({
  arrayDcCapacityWatts,
  sunshineDurationHours,
  performanceFactor
})


Returns:

usableEnergyKwh


Then:

calculateForecastSummary(forecastDays)


Returns:

total energy

average energy

best day

worst day

average sunshine

average rain probability

weekly summaries

Keep calculations pure.

No React code inside the calculation engine.

32. TYPESCRIPT

Use TypeScript throughout.

Create explicit types for:

SolarSystem

{
  panelRatedPowerW: number
  panelsInSeries: number
  parallelStrings: number
  performanceFactor: number
}


Location

{
  name: string
  country?: string
  latitude: number
  longitude: number
  timezone?: string
}


WeatherForecastDay

Include:

{
  date
  weatherCode
  condition
  precipitationProbability
  precipitationMm
  sunshineDurationHours
  effectivePsh
  shortwaveRadiationMjM2
  usableEnergyKwh
}


33. VALIDATION

Inputs must be validated.

Panel rated power:

> 0

Panels in series:

positive integer

Parallel strings:

positive integer

Performance factor:

between:

0 and 1

Latitude:

-90 to 90

Longitude:

-180 to 180

Forecast days:

positive integer within supported API limits.

Do not allow NaN values or negative system sizes.

34. DESIGN SYSTEM — JAMBECOM SOLUTIONS

The UI must clearly belong to Jambekcom Solutions.

Use the supplied Jambekcom logo as the primary brand reference.

The provided logo has a strong:

orange

black/dark

white

visual identity.

Build the design system around those characteristics.

Do NOT replace the logo.

Do NOT create a generic SaaS template that happens to contain the Jambekcom name.

The application should look like a product built specifically for Jambekcom Solutions.

35. BRAND COLORS

Use the supplied logo as the visual source of truth.

The primary accent should be a vivid Jambekcom-style orange.

Use:

dark/near-black for major surfaces

orange for primary actions and highlights

white/off-white for primary text

muted gray for secondary text

subtle neutral borders

restrained use of gradients

Do not make every component orange.

The orange should be used strategically for:

buttons

active states

chart highlights

important metrics

icons

progress indicators

branding

The overall interface should feel:

technical + premium + energetic + professional

rather than playful.

36. DARK/LIGHT MODE

Default to a dark, premium interface that complements the supplied Jambekcom logo.

If you implement light mode, make sure it is a proper design system rather than simply inverting colors.

Dark mode should remain the primary experience.

37. TYPOGRAPHY

Use a modern professional sans-serif.

Prioritize:

readability

strong numerical typography

clear hierarchy

compact dashboard labels

Large energy numbers should be visually dominant.

For example:

42.8 kWh

should immediately stand out.

38. RESPONSIVENESS

This is extremely important.

The application must be very, very responsive.

Design mobile-first.

Test at minimum:

Mobile

320px

375px

390px

430px

Tablet

768px

1024px

Desktop

1280px

1440px

1920px+

Do not simply shrink the desktop dashboard.

Reflow the layout intelligently.

39. MOBILE DESIGN

On mobile:

navigation should collapse cleanly

cards should stack

charts should remain usable

tables should transform or horizontally scroll

controls should have comfortable touch targets

buttons should not become tiny

numeric values should remain readable

no horizontal page overflow

no clipped charts

no desktop-only interactions

The main dashboard should feel like a purpose-built mobile application.

40. DESKTOP DESIGN

On desktop:

Use a dashboard layout with:

compact sidebar/navigation

main content area

responsive cards

large forecast graph

configuration panel

forecast table

Avoid excessive empty space.

The interface should feel information-dense but not cluttered.

41. NAVIGATION

Suggested navigation:

Dashboard

Main overview.

Forecast

Detailed daily weather/production forecast.

Solar System

System configuration.

Location

Installation location.

Settings

Preferences and application settings.

However, avoid unnecessary pages if they make the app cumbersome.

The most important workflow should remain accessible from the main dashboard.

42. DASHBOARD INFORMATION HIERARCHY

The dashboard should answer these questions in order:

1. Where is this system?

Abuja, Nigeria

2. What size is the system?

5.2 kW

3. How much will it generate?

XX kWh

4. What will the next few days look like?

Forecast graph

5. Why does generation change?

Sunshine/weather

6. What does the detailed forecast say?

Daily forecast

7. What are the system settings?

Configuration

43. MICRO-INTERACTIONS

Add subtle professional interactions:

smooth card transitions

loading skeletons

chart animations

hover states

button feedback

refresh animation

success state after refresh

input validation feedback

Do not over-animate the application.

The product should feel fast.

44. LOADING STATES

Never show a blank screen while weather is loading.

Use skeleton loaders for:

forecast cards

metrics

chart

table

On first load:

Show a clear loading state.

On refresh:

Keep existing data visible while displaying a small refresh/loading indicator.

45. ACCESSIBILITY

Implement proper:

semantic HTML

keyboard navigation

focus states

accessible labels

ARIA where appropriate

sufficient contrast

screen-reader-friendly controls

Charts should have accessible summaries.

Do not rely exclusively on color to communicate weather or performance status.

46. PERFORMANCE

The application should feel extremely fast.

Optimize:

API requests

rendering

chart rendering

local storage

bundle size

image/logo loading

PWA caching

Avoid unnecessary dependencies.

Do not install a huge UI library when simple components are sufficient.

47. WEATHER API SERVICE

Create a dedicated weather service.

It should:

Accept latitude

Accept longitude

Accept forecast horizon

Request the required daily variables

Parse the response

Normalize units

Return application-level types

Do not let raw Open-Meteo API response structures leak throughout the application.

Example:

Open-Meteo API
      ↓
Weather Service
      ↓
Normalized Forecast Model
      ↓
Solar Calculation Engine
      ↓
React State
      ↓
Dashboard


48. API ERROR AND RATE LIMIT HANDLING

Implement:

timeout handling

retry where appropriate

graceful API failure

cached fallback

clear error messaging

Avoid aggressive infinite retries.

49. REFRESH STRATEGY

Implement:

Manual refresh

User clicks refresh.

Automatic refresh

Refresh weather periodically when the application is active.

Do not constantly hammer the API.

Persist:

last successful update

forecast data

If the forecast is still reasonably fresh, use cached data first and refresh intelligently.

50. DATA SOURCE DISPLAY

Clearly identify:

Weather data: Open-Meteo

The app should not imply that Jambekcom itself is collecting meteorological observations.

This is a forecast/estimation tool.

Use wording such as:

Estimated solar generation

rather than:

Guaranteed generation

51. IMPORTANT PRODUCT DISCLAIMER

Include a subtle information area:

Solar generation values are estimates based on system configuration and weather forecast data. Actual production may vary due to panel orientation, shading, temperature, equipment efficiency, dust, installation conditions, and other factors.

Keep it professional and unobtrusive.

52. FUTURE-READY DESIGN

Structure the application so future versions can support:

panel tilt

panel azimuth

battery capacity

battery state of charge

inverter efficiency

load consumption

estimated savings

grid availability

historical generation

actual vs forecast generation

multiple solar installations

customer/project management

PDF reports

CSV export

WhatsApp reports

email reports

authenticated users

cloud persistence

Do not implement all of these now unless necessary.

But do not architect the MVP in a way that makes them impossible later.

53. EXPORT

Consider adding:

Export Forecast

with:

CSV export

print-friendly report

PDF generation can be added later.

The exported data should include:

system configuration

location

forecast dates

weather

sunshine

energy estimates

summary

54. DATA TABLE / SPREADSHEET PARITY

The web application should allow someone familiar with the original spreadsheet to reconcile the numbers.

For example, if the spreadsheet says:

Array capacity:

5.2 kW

Baseline:

20.8 kWh/day

and a forecast day has:

6 hours sunshine

the application must produce:

24.96 kWh

Do not introduce hidden rounding differences.

Use full precision internally and round only for display.

55. ROUNDING

Internally:

retain sufficient precision.

UI:

Energy:

1–2 decimal places

Example:

24.96 kWh

Sunshine:

6.2 h

Rain:

85%

System capacity:

5.2 kW

Avoid displaying unnecessary decimals.

56. TESTING

Create unit tests for the calculation engine.

At minimum test:

Configuration

4 panels in series

2 parallel strings

650 W panels

Expected:

8 panels

5,200 W

5.2 kW

Baseline

5.2 kW

5 PSH

80%

Expected:

20.8 kWh/day

Daily energy

5,200 W

6 PSH

80%

Expected:

24.96 kWh

Forecast total

Test multiple days.

Weather impact

Verify the spreadsheet formula:

1 - (average PSH / 5)

Invalid inputs

Verify validation.

57. END-TO-END TESTING

Test:

Load application.

Default Abuja location appears.

Default solar configuration appears.

Weather loads.

Forecast graph renders.

Daily cards render.

Changing panel wattage recalculates everything.

Changing number of panels recalculates everything.

Changing performance factor recalculates everything.

Changing location fetches new weather.

Refresh works.

Offline mode displays cached forecast.

PWA installability works.

Mobile layout works.

Desktop layout works.

58. DEFAULT DEMO STATE

Use the spreadsheet's current values as the default demo state:

Solar

Panel:

650 W

Series:

4

Parallel:

2

Performance:

80%

Location

Abuja, Nigeria

Latitude:

9.0765

Longitude:

7.3986

Forecast:

16 days

This means the application should initially produce results that can be compared directly against the supplied spreadsheet.

59. IMPORTANT: DO NOT FAKE THE DATA

Do not build a static mockup.

Do not hard-code:

forecast values

chart values

weather conditions

energy values

The dashboard must actually calculate from:

System Configuration + Live Forecast Data

You may use fallback/demo data ONLY when the weather API is unavailable, and clearly mark it as cached/demo data.

60. IMPORTANT: DO NOT OVERENGINEER THE MVP

Do not introduce:

unnecessary authentication

complex databases

unnecessary microservices

unnecessary backend infrastructure

complicated state management

unless there is a real requirement.

A clean React + TypeScript PWA with a weather service, calculation engine, local persistence and responsive dashboard is sufficient for the first version.

61. RECOMMENDED TECHNOLOGY

Preferred:

React

TypeScript

Vite

PWA plugin/service worker

Tailwind CSS or a similarly clean utility/component approach

Recharts or ECharts

Lucide icons

Open-Meteo API

localStorage/IndexedDB

Use the project's existing framework if one already exists.

If starting from scratch, prioritize simplicity and maintainability.

62. VISUAL QUALITY BAR

This is NOT an internal admin dashboard.

It should look like a polished commercial product.

Aim for the quality level of a modern:

energy monitoring platform

climate-tech dashboard

SaaS analytics application

solar operations dashboard

But maintain the Jambekcom identity.

Avoid generic AI-generated UI patterns such as:

excessive glassmorphism

giant gradients

random colorful cards

excessive rounded containers

meaningless decorative graphics

huge hero sections

excessive shadows

The interface should be purposeful.

63. JAMBECOM BRAND APPLICATION

Use the supplied Jambekcom logo in:

app header

desktop navigation

mobile navigation

PWA icon where appropriate

The logo should remain recognizable.

Use the orange brand accent consistently across:

primary CTA

active navigation

chart highlights

important statistics

status indicators

The logo itself should determine the final visual treatment rather than inventing a new brand identity.

64. MOBILE-FIRST PRIORITY

If there is a conflict between desktop and mobile design, prioritize usability on mobile.

A solar technician or business operator should be able to stand at an installation site with a phone and:

Open the PWA.

Select the site.

Enter the solar configuration.

See expected production.

Check the next 16 days.

Understand weather impact.

Refresh the forecast.

without needing a desktop.

65. USER FLOW

The primary workflow should be:

Open App
   ↓
Dashboard
   ↓
Select / Confirm Location
   ↓
Enter Solar System Configuration
   ↓
Fetch Weather Forecast
   ↓
Calculate Solar Production
   ↓
Display Summary
   ↓
Display Graph
   ↓
Display Daily Forecast
   ↓
Display Weekly Summary


Make this flow extremely simple.

66. SETTINGS

Settings should include:

Location

Panel wattage

Series panels

Parallel strings

Performance factor

Forecast horizon

Theme if supported

Clear cached data

Do not bury critical solar settings in obscure menus.

67. TOOLTIP / EDUCATIONAL UX

Many users will not understand:

PSH

derating

DC capacity

shortwave radiation

Use small information icons.

For example:

Effective PSH

"Peak Sun Hours represents the equivalent number of hours of sunlight at an intensity of 1,000 W/m². In this estimator, effective PSH follows the spreadsheet's sunshine-duration methodology."

Make technical concepts understandable without clutter.

68. SECURITY

Do not expose unnecessary secrets.

If Open-Meteo is accessed directly from the browser and the selected endpoint requires no private API key, this is acceptable.

If any future API requires credentials:

Never expose private credentials in frontend code.

Use a server-side proxy/API route.

69. FINAL IMPLEMENTATION REQUIREMENT

Before considering the project complete:

Compare the application's results against the supplied spreadsheet using the default values.

The following must reconcile:

Total panels

Array DC capacity

Array DC capacity kW

Baseline daily energy

Daily usable energy

Forecast-period energy

Forecast average daily energy

Weekly summaries

Weather impact

If any values differ, investigate the calculation before changing the UI.

70. BUILD PROCESS

Do not immediately start generating random UI components.

First:

Step 1

Inspect the supplied spreadsheet thoroughly.

Step 2

Map every spreadsheet input.

Step 3

Map every spreadsheet calculation.

Step 4

Map every weather field.

Step 5

Design the data model.

Step 6

Implement the calculation engine.

Step 7

Implement Open-Meteo integration.

Step 8

Implement responsive dashboard.

Step 9

Implement charts.

Step 10

Implement PWA/offline functionality.

Step 11

Add tests.

Step 12

Compare results against spreadsheet.

Step 13

Polish the Jambekcom visual design.

Step 14

Test mobile, tablet and desktop.

Do not declare completion simply because the page visually looks good.

The calculations and live weather flow must actually work.

71. DEFINITION OF DONE

The project is complete when:

React/TypeScript application works.

Application is installable as a PWA.

Jambekcom branding is correctly applied.

Supplied logo is used.

Application works beautifully on mobile.

Application works beautifully on desktop.

Solar system inputs are editable.

Calculations update immediately.

Location is editable.

Latitude/longitude can be used.

Open-Meteo weather data loads dynamically.

16-day forecast works.

Weather conditions are mapped correctly.

Sunshine duration is converted correctly.

Effective PSH matches spreadsheet methodology.

Daily energy calculation matches spreadsheet.

Forecast total matches spreadsheet.

Forecast average matches spreadsheet.

Weekly summaries work.

Interactive production chart works.

Daily forecast works.

Loading states exist.

Error states exist.

Offline/cached forecast works.

Last updated time is visible.

Weather source is visible.

Calculation engine has tests.

Spreadsheet parity has been verified.

No fake/static dashboard data remains.

No horizontal overflow exists on mobile.

No console errors remain.

Production build succeeds.

72. MOST IMPORTANT INSTRUCTION

Do not interpret this project as:

"Create a dashboard that looks like a solar calculator."

Interpret it as:

"Convert an existing working solar-generation spreadsheet into a professional, dynamic, live-weather-powered, mobile-first solar estimation product for Jambekcom Solutions."

The spreadsheet's formulas are the starting calculation model.

The PWA is the product.

The Jambekcom branding is the identity.

Open-Meteo is the weather data source.

The dashboard should make the information dramatically easier to understand and use than the spreadsheet.

Build the application to production quality, not as a prototype or static visual mockup.






https://docs.google.com/spreadsheets/u/1/d/1BMmE_6sw7sBrwxHpXXelB6vCxDGJjYQvG3_RkwJlKks/edit?usp=sharing_eip&ts=6a7c48eb&urp=gmail_link

https://docs.google.com/spreadsheets/u/1/d/1BMmE_6sw7sBrwxHpXXelB6vCxDGJjYQvG3_RkwJlKks/edit?usp=sharing_eip&ts=6a7c48eb&urp=gmail_link

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://jambekcom-solar.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/78db975c-3ed6-42bc-84ac-802b001eef35).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
