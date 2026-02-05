document.addEventListener("DOMContentLoaded", initApp);

function initApp() {
  setupTheme();
  setupNavigation();
  setupMobileNav();
  setupSearch();
  safeCall("setupHourlyForecastSlider");
  safeCall("setupLocationButton");
  setupUserName();

  console.log("Weather App UI Initialized");
}

function safeCall(fnName) {
  const fn = window[fnName];
  if (typeof fn === "function") {
    fn();
  }
}

function setupTheme() {
  const themeBtn = document.querySelector(".theme-toggle");
  const body = document.body;

  if (!themeBtn) return;

  const themeIcon = themeBtn.querySelector("i");

  if (localStorage.getItem("theme") === "dark") {
    body.classList.add("dark-mode");
    themeIcon.classList.replace("ri-moon-line", "ri-sun-line");
  }

  themeBtn.addEventListener("click", () => {
    body.classList.toggle("dark-mode");

    if (body.classList.contains("dark-mode")) {
      themeIcon.classList.replace("ri-moon-line", "ri-sun-line");
      localStorage.setItem("theme", "dark");
    } else {
      themeIcon.classList.replace("ri-sun-line", "ri-moon-line");
      localStorage.setItem("theme", "light");
    }
  });
}

function getViewConfig() {
  return {
    dashboard: {
      el: document.querySelector(".dashboard"),
      display: "flex",
    },
    map: {
      el: document.querySelector("#map-view"),
      display: "block",
      onShow: showMap,
    },
    calendar: {
      el: document.querySelector("#calendar-view"),
      display: "block",
      onShow: renderYearCalendar,
    },
    settings: {
      el: document.querySelector("#settings-view"),
      display: "block",
      onShow: renderSettings,
    },
  };
}

function setActiveView(viewKey) {
  const navLinks = document.querySelectorAll(".nav-links li");
  const views = getViewConfig();
  const activeView = views[viewKey] ? viewKey : "dashboard";

  Object.entries(views).forEach(([key, config]) => {
    if (!config.el) return;
    config.el.style.display = key === activeView ? config.display : "none";
  });

  navLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.view === activeView);
  });

  const viewConfig = views[activeView];
  if (viewConfig && typeof viewConfig.onShow === "function") {
    viewConfig.onShow();
  }
}

function setupNavigation() {
  const navLinks = document.querySelectorAll(".nav-links li");

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const viewKey = link.dataset.view || "dashboard";
      setActiveView(viewKey);
    });
  });
}

function setupSearch() {
  const searchForm = document.querySelector(".search-box");

  if (!searchForm) return;

  const searchInput = searchForm.querySelector("input");
  const icon = searchForm.querySelector("i");

  if (!searchInput || !icon) return;

  searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (!query) return;

    const originalIcon = icon.className;
    icon.className = "ri-loader-4-line";
    icon.style.animation = "spin 1s linear infinite";

    try {
      const result = await geocodeLocation(query);
      if (result) {
        showMapView();
        showMapAt(result.lat, result.lon, result.name);
      } else {
        console.warn("No matching location found.");
      }
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      searchInput.value = "";
      icon.className = originalIcon;
      icon.style.animation = "";
    }
  });
}
const ENABLE_LIVE_WEATHER = false;
const ENABLE_LOCATION_ONLY = true;

function setupUserName() {
  localStorage.removeItem("userName");
  const name = prompt("Welcome! Please enter your name:");

  const greetingName = document.querySelector(".user-greeting h1");
  if (greetingName) {
    greetingName.textContent = name ? `Hello, ${name}` : "Hello";
  }

  if (!("geolocation" in navigator)) return;

  if (ENABLE_LIVE_WEATHER) {
    askForLocation();
  } else if (ENABLE_LOCATION_ONLY) {
    updateLocationOnly();
  }
}

function updateLocationOnly() {
  if (!("geolocation" in navigator)) return;

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      const locationName = await reverseGeocodeName(latitude, longitude);
      const locationSpan = document.querySelector(
        ".current-header .location span",
      );
      if (locationSpan) locationSpan.textContent = locationName;
    },
    (error) => {
      console.error("Location access denied or error:", error);
    },
  );
}

async function reverseGeocodeName(lat, lon) {
  const geoUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
  try {
    const geoRes = await fetch(geoUrl);
    if (!geoRes.ok) throw new Error("Reverse geocode failed");
    const geoData = await geoRes.json();
    const addr = geoData.address || {};
    let name =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.municipality ||
      addr.county ||
      `Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`;
    if (addr.country_code) name += `, ${addr.country_code.toUpperCase()}`;
    return name;
  } catch {
    return `Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`;
  }
}

function askForLocation() {
  if (!("geolocation" in navigator)) {
    console.error("Geolocation is not supported by this browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      fetchWeatherData(latitude, longitude);
    },
    (error) => {
      console.error("Location access denied or error:", error);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    },
  );
}

let currentUserLocation = { lat: 0, lon: 0 };
let mapInitialized = false;
let map = null;
let mapMarker = null;

async function fetchWeatherData(lat, lon) {
  currentUserLocation = { lat, lon };
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,weathercode,surface_pressure,visibility&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto`;
  const geoUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
  const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi`;

  try {
    const [weatherRes, geoRes, aqiRes] = await Promise.all([
      fetch(weatherUrl),
      fetch(geoUrl),
      fetch(aqiUrl),
    ]);

    if (!weatherRes.ok) throw new Error("Weather data fetch failed");
    const weatherData = await weatherRes.json();

    let locationName = `Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`;
    if (geoRes.ok) {
      try {
        const geoData = await geoRes.json();
        const addr = geoData.address;
        locationName =
          addr.city ||
          addr.town ||
          addr.village ||
          addr.municipality ||
          addr.county ||
          locationName;
        if (addr.country_code) {
          locationName += `, ${addr.country_code.toUpperCase()}`;
        }
      } catch (e) {
        console.error("Geo parse error", e);
      }
    }

    let aqiData = null;
    if (aqiRes.ok) {
      try {
        aqiData = await aqiRes.json();
      } catch (e) {
        console.error("AQI parse error", e);
      }
    }

    updateWeatherUI(weatherData, locationName, aqiData);
  } catch (err) {
    console.error(err);
  }
}

function updateWeatherUI(data, locationName, aqiData) {
  const current = data.current_weather;
  const hourly = data.hourly;
  const daily = data.daily;

  // Header & Location
  updateDateTime();
  const locationSpan = document.querySelector(".current-header .location span");
  if (locationSpan) locationSpan.textContent = locationName;

  const tempDiv = document.querySelector(".current-body .temp");
  if (tempDiv) tempDiv.textContent = `${Math.round(current.temperature)}°`;

  const conditionDiv = document.querySelector(".current-body .condition");
  if (conditionDiv)
    conditionDiv.textContent = getWeatherConditionText(current.weathercode);

  const mainIcon = document.querySelector(".current-body .weather-icon-lg i");
  if (mainIcon) mainIcon.className = getWeatherIcon(current.weathercode);

  // Stats
  const currentPressure = hourly.surface_pressure
    ? hourly.surface_pressure[0]
    : 1013;
  const sunrise = daily.sunrise[0];
  updateCurrentStats(currentPressure, current.windspeed, sunrise);

  // Hourly Forecast
  updateHourlyList(hourly);

  // Highlights
  updateHighlights(daily, current, hourly, aqiData);

  // 7 Days Forecast
  updateDailyForecast(daily);
}

function updateDateTime() {
  const timeDiv = document.querySelector(".current-header .time");
  if (timeDiv) {
    const now = new Date();
    const options = {
      weekday: "long",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };
    timeDiv.textContent = now.toLocaleDateString("en-US", options);
  }
}

function updateCurrentStats(pressure, wind, sunriseIso) {
  const stats = document.querySelectorAll(".current-footer .stat-item");
  if (stats[0]) {
    const val = stats[0].querySelector("span");
    if (val) val.textContent = `${Math.round(pressure)} hPa`;
  }
  if (stats[1]) {
    const val = stats[1].querySelector("span");
    if (val) val.textContent = `${wind} km/h`;
  }
  if (stats[2] && sunriseIso) {
    const val = stats[2].querySelector("span");
    const time = new Date(sunriseIso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    if (val) val.textContent = time;
  }
}

function updateHourlyList(hourly) {
  const container = document.querySelector(".hourly-forecast");
  if (!container) return;

  container.innerHTML = "";

  const currentHourIndex = new Date().getHours();

  for (let i = currentHourIndex; i < currentHourIndex + 8; i++) {
    if (!hourly.time[i]) break;

    const timeStr = hourly.time[i];
    const temp = hourly.temperature_2m[i];
    const code = hourly.weathercode[i];

    const date = new Date(timeStr);
    const hours = date.getHours();
    const displayHour =
      i === currentHourIndex
        ? "Now"
        : (hours % 12 || 12) + (hours >= 12 ? " PM" : " AM");

    const div = document.createElement("div");
    div.className = "hour-card";
    if (i === currentHourIndex) div.classList.add("active");

    div.innerHTML = `
            <span class="hour">${displayHour}</span>
            <i class="${getWeatherIcon(code)}"></i>
            <span class="temp">${Math.round(temp)}°</span>
        `;
    container.appendChild(div);
  }
}

function updateHighlights(daily, current, hourly, aqiData) {
  const cards = document.querySelectorAll(".highlight-card");

  // 1. UV Index
  const uvValRaw = daily.uv_index_max[0];
  const uvVal = Number.isFinite(uvValRaw) ? uvValRaw : 0;
  const uvClamped = Math.min(Math.max(uvVal, 0), 11);
  if (cards[0]) {
    cards[0].querySelector(".highlight-value").textContent = uvVal.toFixed(1);
    cards[0].querySelector(".highlight-status").textContent =
      getUVStatus(uvVal);
    cards[0].querySelector(".fill").style.width = `${(uvClamped / 11) * 100}%`;
  }

  // 2. Wind Status
  if (cards[1]) {
    cards[1].querySelector(".highlight-value").innerHTML =
      `${current.windspeed} <span>km/h</span>`;
  }

  // 3. Sunrise & Sunset
  if (cards[2]) {
    const rise = new Date(daily.sunrise[0]).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const set = new Date(daily.sunset[0]).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const times = cards[2].querySelectorAll(".sun-time span");
    if (times[0]) times[0].textContent = rise;
    if (times[1]) times[1].textContent = set;
  }

  // 4. Humidity
  const currentHourIndex = new Date().getHours();
  const humidRaw = hourly.relativehumidity_2m
    ? hourly.relativehumidity_2m[currentHourIndex]
    : 0;
  const humid = Number.isFinite(humidRaw) ? humidRaw : 0;
  const humidClamped = Math.min(Math.max(humid, 0), 100);

  if (cards[3]) {
    cards[3].querySelector(".highlight-value").textContent = `${Math.round(
      humidClamped,
    )}%`;
    cards[3].querySelector(".highlight-status").textContent =
      getHumidityStatus(humidClamped);
    cards[3].querySelector(".fill").style.width = `${humidClamped / 2}%`;
  }

  // 5. Visibility
  const vis = hourly.visibility ? hourly.visibility[currentHourIndex] : 10000;
  if (cards[4]) {
    cards[4].querySelector(".highlight-value").innerHTML = `${(
      vis / 1000
    ).toFixed(1)} <span>km</span>`;
    cards[4].querySelector(".highlight-status").textContent =
      getVisibilityStatus(vis);
  }

  // 6. Air Quality
  if (cards[5] && aqiData && aqiData.current) {
    const aqi = aqiData.current.us_aqi;
    cards[5].querySelector(".highlight-value").textContent = aqi;
    cards[5].querySelector(".highlight-status").textContent = getAQIStatus(aqi);
    // Add color class if needed
    cards[5].querySelector(".highlight-status").className = "highlight-status"; // reset
    if (aqi > 100)
      cards[5].querySelector(".highlight-status").classList.add("unhealthy");
  }
}

function updateDailyForecast(daily) {
  const list = document.querySelector(".forecast-list");
  if (!list) return;
  list.innerHTML = "";

  for (let i = 0; i < 7; i++) {
    if (!daily.time[i]) break;

    const date = new Date(daily.time[i]);
    const dayName =
      i === 0
        ? "Today"
        : date.toLocaleDateString("en-US", { weekday: "short" });

    const code = daily.weathercode[i];
    const max = Math.round(daily.temperature_2m_max[i]);
    const min = Math.round(daily.temperature_2m_min[i]);

    const div = document.createElement("div");
    div.className = "forecast-item";
    div.innerHTML = `
            <div class="day">${dayName}</div>
            <div class="icon-condition">
                <i class="${getWeatherIcon(code)}"></i>
                <span>${getWeatherConditionText(code)}</span>
            </div>
            <div class="temp-range">
                <span class="high">${max}°</span>
                <span class="low">/ ${min}°</span>
            </div>
        `;
    list.appendChild(div);
  }
}

function getWeatherIcon(code) {
  if (code === 0) return "ri-sun-line";
  if (code >= 1 && code <= 3) return "ri-sun-cloudy-line";
  if (code >= 45 && code <= 48) return "ri-mist-line";
  if (code >= 51 && code <= 67) return "ri-rainy-line";
  if (code >= 71 && code <= 77) return "ri-snowy-line";
  if (code >= 80 && code <= 82) return "ri-showers-line";
  if (code >= 95 && code <= 99) return "ri-thunderstorms-line";
  return "ri-question-line";
}

function getUVStatus(uv) {
  if (uv <= 2) return "Low";
  if (uv <= 5) return "Moderate";
  if (uv <= 7) return "High";
  if (uv <= 10) return "Very High";
  return "Extreme";
}

function getHumidityStatus(h) {
  if (h < 30) return "Dry";
  if (h <= 60) return "Normal 🤙";
  return "High";
}

function getVisibilityStatus(v) {
  if (v > 10000) return "Excellent";
  if (v > 5000) return "Good";
  if (v > 2000) return "Average";
  return "Poor";
}

function getAQIStatus(aqi) {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
}

function getWeatherConditionText(code) {
  if (code === 0) return "Clear Sky";
  if (code >= 1 && code <= 3) return "Partly Cloudy";
  if (code >= 45 && code <= 48) return "Foggy";
  if (code >= 51 && code <= 67) return "Rainy";
  if (code >= 71 && code <= 77) return "Snowy";
  if (code >= 80 && code <= 82) return "Showers";
  if (code >= 95 && code <= 99) return "Thunderstorm";
  return "Unknown";
}

function renderYearCalendar() {
  const calendarView = document.querySelector("#calendar-view");
  if (!calendarView) return;

  const now = new Date();
  const year = now.getFullYear();
  const months = Array.from({ length: 12 }, (_, i) => {
    return new Date(year, i, 1).toLocaleDateString("en-US", {
      month: "long",
    });
  });
  const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const monthBlocks = months
    .map((monthName, monthIndex) => {
      const firstDay = new Date(year, monthIndex, 1);
      const lastDay = new Date(year, monthIndex + 1, 0);
      const daysInMonth = lastDay.getDate();

      const jsDay = firstDay.getDay();
      const offset = jsDay === 0 ? 6 : jsDay - 1; // Monday start

      const dayCells = [];
      for (let i = 0; i < offset; i++) {
        dayCells.push(`<div></div>`);
      }
      for (let d = 1; d <= daysInMonth; d++) {
        const isToday =
          d === now.getDate() &&
          monthIndex === now.getMonth() &&
          year === now.getFullYear();
        dayCells.push(
          `<div style="
            padding: 6px 0;
            text-align: center;
            border-radius: 8px;
            background: ${isToday ? "#4D8AFF" : "transparent"};
            color: ${isToday ? "#ffffff" : "inherit"};
            font-weight: ${isToday ? "600" : "400"};
          ">${d}</div>`,
        );
      }

      return `
        <div style="background: var(--card-bg); border-radius: 18px; padding: 14px; box-shadow: var(--card-shadow);">
          <div style="font-weight: 600; margin-bottom: 8px;">${monthName}</div>
          <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; font-size: 12px; color: var(--text-secondary); margin-bottom: 6px;">
            ${weekdayLabels.map((w) => `<div style=\"text-align:center;\">${w}</div>`).join("")}
          </div>
          <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; font-size: 12px;">
            ${dayCells.join("")}
          </div>
        </div>
      `;
    })
    .join("");

  calendarView.innerHTML = `
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 18px;">
      <h2 style="margin: 0; font-size: 20px;">${year} Calendar</h2>
    </div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px;">
      ${monthBlocks}
    </div>
  `;
}

function renderSettings() {
  const settingsView = document.querySelector("#settings-view");
  if (!settingsView) return;

  const storedUnit = localStorage.getItem("tempUnit") || "c";
  const storedTime = localStorage.getItem("timeFormat") || "12";
  const storedNotif = localStorage.getItem("weatherAlerts") || "off";

  settingsView.innerHTML = `
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 18px;">
      <h2 style="margin: 0; font-size: 20px;">Settings</h2>
    </div>
    <div style="display: grid; gap: 16px;">
      <div style="background: var(--card-bg); border-radius: 16px; padding: 16px; box-shadow: var(--card-shadow); display:flex; align-items:center; justify-content:space-between;">
        <div>
          <div style="font-weight:600;">Temperature Unit</div>
          <div style="color: var(--text-secondary); font-size: 13px;">Choose Celsius or Fahrenheit</div>
        </div>
        <select id="setting-temp-unit" style="padding: 8px 12px; border-radius: 10px; border: 1px solid #e5e7eb;">
          <option value="c" ${storedUnit === "c" ? "selected" : ""}>Celsius (°C)</option>
          <option value="f" ${storedUnit === "f" ? "selected" : ""}>Fahrenheit (°F)</option>
        </select>
      </div>

      <div style="background: var(--card-bg); border-radius: 16px; padding: 16px; box-shadow: var(--card-shadow); display:flex; align-items:center; justify-content:space-between;">
        <div>
          <div style="font-weight:600;">Time Format</div>
          <div style="color: var(--text-secondary); font-size: 13px;">Choose 12h or 24h format</div>
        </div>
        <select id="setting-time-format" style="padding: 8px 12px; border-radius: 10px; border: 1px solid #e5e7eb;">
          <option value="12" ${storedTime === "12" ? "selected" : ""}>12-hour</option>
          <option value="24" ${storedTime === "24" ? "selected" : ""}>24-hour</option>
        </select>
      </div>

      <div style="background: var(--card-bg); border-radius: 16px; padding: 16px; box-shadow: var(--card-shadow); display:flex; align-items:center; justify-content:space-between;">
        <div>
          <div style="font-weight:600;">Weather Alerts</div>
          <div style="color: var(--text-secondary); font-size: 13px;">Enable notifications for severe weather</div>
        </div>
        <label style="display:flex; align-items:center; gap: 8px;">
          <input id="setting-alerts" type="checkbox" ${storedNotif === "on" ? "checked" : ""} />
          <span style="font-size: 14px;">Enable</span>
        </label>
      </div>
    </div>
  `;

  const unitSelect = settingsView.querySelector("#setting-temp-unit");
  const timeSelect = settingsView.querySelector("#setting-time-format");
  const alertToggle = settingsView.querySelector("#setting-alerts");

  if (unitSelect) {
    unitSelect.addEventListener("change", (e) => {
      localStorage.setItem("tempUnit", e.target.value);
    });
  }

  if (timeSelect) {
    timeSelect.addEventListener("change", (e) => {
      localStorage.setItem("timeFormat", e.target.value);
    });
  }

  if (alertToggle) {
    alertToggle.addEventListener("change", (e) => {
      localStorage.setItem("weatherAlerts", e.target.checked ? "on" : "off");
    });
  }
}

function showMap() {
  if (!mapInitialized) {
    if (currentUserLocation.lat && currentUserLocation.lon) {
      map = L.map("map").setView(
        [currentUserLocation.lat, currentUserLocation.lon],
        13,
      );
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      mapMarker = L.marker([currentUserLocation.lat, currentUserLocation.lon])
        .addTo(map)
        .bindPopup("You are here")
        .openPopup();

      mapInitialized = true;
    } else {
      console.log("No location data available yet.");
      map = L.map("map").setView([51.505, -0.09], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
      mapInitialized = true;
    }
  } else {
    setTimeout(() => {
      map.invalidateSize();
      if (currentUserLocation.lat && currentUserLocation.lon) {
        map.setView([currentUserLocation.lat, currentUserLocation.lon], 13);
      }
    }, 100);
  }
}

function showMapAt(lat, lon, label = "Selected location") {
  currentUserLocation = { lat, lon };
  if (!mapInitialized) {
    showMap();
  }
  if (map) {
    map.setView([lat, lon], 13);
    if (mapMarker) {
      mapMarker.setLatLng([lat, lon]);
      mapMarker.setPopupContent(label).openPopup();
    } else {
      mapMarker = L.marker([lat, lon]).addTo(map).bindPopup(label).openPopup();
    }
  }
}

function showMapView() {
  setActiveView("map");
}

async function geocodeLocation(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    query,
  )}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Geocoding failed");
  const data = await res.json();
  if (!data || !data.length) return null;

  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon),
    name: data[0].display_name || query,
  };
}

function setupMobileNav() {
  const btn = document.querySelector(".menu-toggle");
  const sidebar = document.querySelector(".sidebar");
  const navLinks = document.querySelectorAll(".nav-links li a");

  if (!btn || !sidebar) return;

  btn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    const icon = btn.querySelector("i");
    if (sidebar.classList.contains("open")) {
      icon.classList.replace("ri-menu-line", "ri-close-line");
    } else {
      icon.classList.replace("ri-close-line", "ri-menu-line");
    }
  });

  // Close sidebar when a link is clicked
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 480) {
        sidebar.classList.remove("open");
        const icon = btn.querySelector("i");
        if (icon) icon.classList.replace("ri-close-line", "ri-menu-line");
      }
    });
  });

  // Close sidebar when clicking outside
  document.addEventListener("click", (e) => {
    if (
      window.innerWidth <= 480 &&
      sidebar.classList.contains("open") &&
      !sidebar.contains(e.target) &&
      !btn.contains(e.target)
    ) {
      sidebar.classList.remove("open");
      const icon = btn.querySelector("i");
      if (icon) icon.classList.replace("ri-close-line", "ri-menu-line");
    }
  });
}
