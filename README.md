# Weather App 🌤️

A modern, responsive weather dashboard allowing users to track real-time weather conditions, forecasts, and air quality for any location worldwide. Built with vanilla HTML, CSS, and JavaScript, leveraging open-source APIs.

![Weather App Preview](assets/img/image.png) <!-- Replace with actual screenshot if available -->

## ✨ Features

- **Real-Time Weather Data**: Get current temperature, weather conditions, wind status, humidity, visibility, and pressure.
- **Advanced Metrics**: Includes UV Index, Air Quality Index (AQI), and Sunrise/Sunset times.
- **Forecasts**:
  - **24-Hour Forecast**: Scrollable hourly breakdown.
  - **7-Day Forecast**: Weekly outlook with min/max temperatures.
- **Interactive Map**: View selected locations on a dynamic map using Leaflet.js.
- **Search Functionality**: Search for any city or region globally.
- **Theme Support**: Toggle between Light and Dark modes.
- **Fully Responsive**: Optimized experience for Desktops, Laptops, Tablets, and Mobile devices.

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3 (Flexbox, Grid, Variables), JavaScript (ES6+)
- **Map Visualization**: [Leaflet.js](https://leafletjs.com/)
- **Icons**: [Remix Icon](https://remixicon.com/)
- **Fonts**: [Google Fonts - Poppins](https://fonts.google.com/specimen/Poppins)

## 📡 APIs Used

1. **[Open-Meteo API](https://open-meteo.com/)**:
   - Weather Forecast API (Current, Hourly, Daily)
   - Air Quality API
2. **[OpenStreetMap Nominatim](https://nominatim.org/)**:
   - Forward Geocoding (Search)
   - Reverse Geocoding (Location Name)

## 🚀 Getting Started

No build process or installation is required since this project utilizes vanilla web technologies.

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/weather-app.git
   ```

2. **Open the project**:
   - Navigate to the project folder.
   - Open `index.html` in your preferred web browser.

   _Tip: For the best experience (and to avoid CORS issues with some browser security settings), use a local development server (like Live Server in VS Code)._

## 📂 Project Structure

```
.
├── assets/
│   ├── css/
│   │   └── style.css      # Main stylesheet (includes responsive styles & themes)
│   └── js/
│       └── script.js      # Application logic, API handling, and UI updates
├── index.html             # Main HTML structure
└── README.md              # Project documentation
```

## 📱 Responsiveness

The application adapts to various screen sizes:

- **Desktop/Laptop**: Full dashboard view with sidebar.
- **Tablet**: Collapsed sidebar/drawer navigation.
- **Mobile**: Full-screen layouts, vertical stacking, and a slide-out navigation menu.

## 📄 License

This project is open-source and available for educational purposes.

## Live Demo : [https://weather-app-ten-fawn-48.vercel.app/](https://weather-app-ten-fawn-48.vercel.app/)
