# Weather App 🌤️

A modern, responsive weather dashboard that lets users track real-time weather conditions, forecasts, and air quality for any location worldwide. Built with vanilla HTML, CSS, and JavaScript, leveraging open-source APIs.

![Weather App Preview](assets/img/image.png)

## ✨ Features

### 🌡️ Weather Dashboard

- **Current Weather**: Live temperature, weather condition, animated weather icon, pressure, wind speed, and sunrise time.
- **Hourly Forecast**: Scrollable 8-hour forecast with temperature and condition icons.
- **7-Day Forecast**: Weekly outlook with daily high/low temperatures and conditions.
- **Today's Highlights**: Six detailed cards:
  - UV Index (with progress bar and status label)
  - Wind Status (speed in km/h)
  - Sunrise & Sunset (with formatted times)
  - Humidity (percentage with progress bar)
  - Visibility (in km with status)
  - Air Quality Index (US AQI with health status)

### 🗺️ Interactive Map

- Powered by **Leaflet.js** with OpenStreetMap tiles.
- Pinpoints your current location with a marker and popup.
- Search any city to jump to its location on the map.

### 📅 Calendar View

- Full 12-month calendar for the current year.
- Today's date is highlighted.
- Responsive grid adapts from 4 columns on desktop to single column on mobile.

### ⚙️ Settings (with Real Effects)

- **Temperature Unit**: Switch between Celsius (°C) and Fahrenheit (°F) — instantly converts all temperature displays across the entire dashboard.
- **Time Format**: Switch between 12-hour and 24-hour format — updates the header clock, hourly forecast labels, sunrise/sunset times, and all time displays.
- **Weather Alerts**: Enable browser notifications for severe weather (showers, thunderstorms). Automatically requests notification permission when toggled on.
- All settings persist in `localStorage` and apply immediately without page reload.

### 🌗 Theme Support

- Toggle between **Light** and **Dark** modes.
- Theme preference saved in `localStorage` and restored on reload.
- Smooth CSS transitions between themes.

### 🔍 Search

- Search for any city or region worldwide using the search bar.
- Powered by OpenStreetMap Nominatim geocoding.
- Automatically navigates to the Map view and pins the searched location.
- Loading spinner animation during search.

### 📍 Geolocation

- Detects user's current location via the browser Geolocation API.
- Reverse geocodes coordinates to display city/country name.
- Uses location for weather data fetching and map centering.

### 👤 Personalized Greeting

- Prompts for user's name on first visit.
- Displays a personalized "Hello, [Name]" greeting in the header.

### 📱 Fully Responsive Design

Adapts seamlessly across 6 breakpoints:

| Breakpoint | Device       | Layout                                                               |
| ---------- | ------------ | -------------------------------------------------------------------- |
| > 1200px   | Desktop      | Full sidebar + 2-column dashboard, 3-column highlights               |
| ≤ 1200px   | Laptop       | Single-column dashboard, narrower search                             |
| ≤ 992px    | Tablet       | Icon-only sidebar (80px), 2-column highlights                        |
| ≤ 768px    | Mobile       | Hamburger menu + slide-out sidebar, full-width layout                |
| ≤ 480px    | Small Mobile | Stacked weather card, 3-column hourly grid, single-column highlights |
| ≤ 360px    | Very Small   | 2-column hourly grid, compact sizing throughout                      |

### 🎨 Animations

- **Fade-in scale** animations on dashboard cards.
- **Slide-in** animation on the 7-day forecast.
- **Floating** animation on the weather icon.
- **Hover effects** on cards, buttons, and hourly forecast items.
- **Smooth transitions** on sidebar, theme toggle, and navigation.

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3 (Flexbox, Grid, CSS Variables, Media Queries), JavaScript (ES6+)
- **Map Visualization**: [Leaflet.js](https://leafletjs.com/)
- **Icons**: [Remix Icon](https://remixicon.com/)
- **Fonts**: [Google Fonts — Poppins](https://fonts.google.com/specimen/Poppins)
- **Storage**: `localStorage` for persisting theme, settings, and preferences

## 📡 APIs Used

1. **[Open-Meteo Weather Forecast API](https://open-meteo.com/)**
   - Current weather (temperature, wind speed, weather code)
   - Hourly forecast (temperature, humidity, weather code, pressure, visibility)
   - Daily forecast (min/max temp, weather code, sunrise, sunset, UV index)
2. **[Open-Meteo Air Quality API](https://open-meteo.com/)**
   - US Air Quality Index (AQI)
3. **[OpenStreetMap Nominatim](https://nominatim.org/)**
   - Forward geocoding (city search → coordinates)
   - Reverse geocoding (coordinates → city name)

## 🚀 Getting Started

No build process or installation required — pure vanilla web technologies.

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/weather-app.git
   ```

2. **Open the project**:
   - Navigate to the project folder.
   - Open `index.html` in your preferred web browser.

   _Tip: For the best experience (and to avoid CORS issues), use a local development server like Live Server in VS Code._

## 📂 Project Structure

```text
.
├── assets/
│   ├── css/
│   │   └── style.css       # Stylesheet (themes, responsive breakpoints, animations)
│   ├── img/                 # Image assets
│   └── js/
│       └── script.js        # App logic, API calls, settings, UI rendering
├── index.html               # Main HTML structure
└── README.md                # Project documentation
```

## 📄 License

This project is open-source and available for educational purposes.

## 🌐 Live Demo

[https://weather-app-ten-fawn-48.vercel.app/](https://weather-app-ten-fawn-48.vercel.app/)
