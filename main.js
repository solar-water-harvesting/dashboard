// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCmvVA9K1kkzhMq8bMuJXVnNHI_c92_DW8",
  authDomain: "water-harvesting-b4520.firebaseapp.com",
  databaseURL: "https://water-harvesting-b4520-default-rtdb.firebaseio.com",
  projectId: "water-harvesting-b4520",
  storageBucket: "water-harvesting-b4520.firebasestorage.app",
  messagingSenderId: "957433848225",
  appId: "1:957433848225:web:eeb6574d2963f5df8debe0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const dataRef = ref(database, "sensorData");

// Historical data storage
let historicalData = {
  timestamps: [],
  soilMoisture: [],
  waterLevel: [],
  solarVoltage: [],
  pumpStatus: [],
  temperature: [],
  humidity: [],
};

let pumpRuntime = 0;
let autoMode = true;
let trendsChart, solarChart;

// Initialize charts
function initCharts() {
  const trendsCtx = document.getElementById("trendsChart").getContext("2d");
  trendsChart = new Chart(trendsCtx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Soil Moisture (%)",
          data: [],
          borderColor: "#fe9d1a",
          backgroundColor: "rgba(254, 157, 26, 0.1)",
          tension: 0.4,
        },
        {
          label: "Water Level (%)",
          data: [],
          borderColor: "#11385a",
          backgroundColor: "rgba(17, 56, 90, 0.1)",
          tension: 0.4,
        },
        {
          label: "Temperature (°C)",
          data: [],
          borderColor: "#ff6384",
          backgroundColor: "rgba(255, 99, 132, 0.1)",
          tension: 0.4,
        },
        {
          label: "Humidity (%)",
          data: [],
          borderColor: "#36a2eb",
          backgroundColor: "rgba(54, 162, 235, 0.1)",
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
        },
      },
    },
  });

  const solarCtx = document.getElementById("solarChart").getContext("2d");
  solarChart = new Chart(solarCtx, {
    type: "bar",
    data: {
      labels: [],
      datasets: [
        {
          label: "Solar Voltage (V)",
          data: [],
          backgroundColor: "rgba(254, 157, 26, 0.6)",
          borderColor: "#fe9d1a",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 3.5,
        },
      },
    },
  });
}

// Update dashboard with new data
function updateDashboard(data) {
  // Update metrics
  document.getElementById("soilMoisture").textContent = data.soilMoisture;
  document.getElementById("waterLevel").textContent = data.waterLevel;
  document.getElementById("solarVoltage").textContent =
    data.solarVoltage.toFixed(2);
  document.getElementById("temperature").textContent = data.temperature;
  document.getElementById("humidity").textContent = data.humidity;

  // Update progress bars
  document.getElementById("soilProgress").style.width = data.soilMoisture + "%";
  document.getElementById("waterProgress").style.width = data.waterLevel + "%";
  document.getElementById("solarProgress").style.width =
    (data.solarVoltage / 3.3) * 100 + "%";
  document.getElementById("temperatureProgress").style.width =
    (data.temperature / 50) * 100 + "%"; // Assume a max temp of 50°C
  document.getElementById("humidityProgress").style.width = data.humidity + "%";

  // Calculate and update efficiency
  const efficiency = calculateEfficiency(data);
  document.getElementById("efficiency").textContent = efficiency;
  document.getElementById("efficiencyProgress").style.width = efficiency + "%";

  // Update pump status
  const pumpElement = document.getElementById("pumpStatus");
  const pumpText = document.getElementById("pumpStatusText");
  if (data.pumpStatus === 1) {
    pumpElement.classList.add("active");
    pumpText.textContent = "ON";
    pumpRuntime += 5 / 60; // Increment by 5 seconds (converted to minutes) per update
  } else {
    pumpElement.classList.remove("active");
    pumpText.textContent = "OFF";
  }
  document.getElementById("pumpRuntime").textContent = pumpRuntime.toFixed(1);

  // Update last update time
  const now = new Date(data.timestamp * 1000); // Convert Firebase timestamp (seconds) to milliseconds
  document.getElementById("lastUpdate").textContent = now.toLocaleTimeString();

  // Check for alerts
  checkAlerts(data);

  // Update statistics
  updateStatistics(data);

  // Update charts
  updateCharts(data);
}

function calculateEfficiency(data) {
  // Simple efficiency calculation based on solar power and water usage
  let efficiency = 0;
  if (data.solarVoltage > 2.0) {
    efficiency = Math.round((data.solarVoltage / 3.3) * 100);
  }
  return efficiency;
}

function checkAlerts(data) {
  const alertBanner = document.getElementById("alertBanner");
  const alertMessage = document.getElementById("alertMessage");

  if (data.waterLevel < 20) {
    alertMessage.textContent = "⚠️ Low water level! Tank is below 20%";
    alertBanner.classList.add("show");
  } else if (data.soilMoisture > 80) {
    alertMessage.textContent =
      "⚠️ Soil is very wet! Consider reducing irrigation";
    alertBanner.classList.add("show");
  } else if (data.solarVoltage < 1.0) {
    alertMessage.textContent = "⚠️ Low solar power! System running on backup";
    alertBanner.classList.add("show");
  } else {
    alertBanner.classList.remove("show");
  }
}

function updateStatistics(data) {
  // Simulated statistics based on pump runtime
  document.getElementById("dailyUsage").textContent =
    Math.round(pumpRuntime * 2.5) + " L";
  document.getElementById("waterSaved").textContent =
    Math.round(pumpRuntime * 1.8) + " L";
  document.getElementById("energyConsumed").textContent =
    (pumpRuntime * 0.05).toFixed(2) + " kWh";

  // Calculate next irrigation time
  if (data.soilMoisture > 50) {
    document.getElementById("nextIrrigation").textContent = "2:30";
  } else if (data.soilMoisture > 30) {
    document.getElementById("nextIrrigation").textContent = "1:00";
  } else {
    document.getElementById("nextIrrigation").textContent = "Now";
  }
}

function updateCharts(data) {
  // Add data to history
  const time = new Date(data.timestamp * 1000).toLocaleTimeString(); // Use Firebase timestamp
  historicalData.timestamps.push(time);
  historicalData.soilMoisture.push(data.soilMoisture);
  historicalData.waterLevel.push(data.waterLevel);
  historicalData.solarVoltage.push(data.solarVoltage);
  historicalData.temperature.push(data.temperature);
  historicalData.humidity.push(data.humidity);

  // Keep only last 24 data points
  if (historicalData.timestamps.length > 24) {
    historicalData.timestamps.shift();
    historicalData.soilMoisture.shift();
    historicalData.waterLevel.shift();
    historicalData.solarVoltage.shift();
    historicalData.temperature.shift();
    historicalData.humidity.shift();
  }

  // Update trends chart
  trendsChart.data.labels = historicalData.timestamps;
  trendsChart.data.datasets[0].data = historicalData.soilMoisture;
  trendsChart.data.datasets[1].data = historicalData.waterLevel;
  trendsChart.data.datasets[2].data = historicalData.temperature;
  trendsChart.data.datasets[3].data = historicalData.humidity;
  trendsChart.update();

  // Update solar chart
  solarChart.data.labels = historicalData.timestamps.slice(-10);
  solarChart.data.datasets[0].data = historicalData.solarVoltage.slice(-10);
  solarChart.update();
}

// Initialize on load
window.onload = function () {
  initCharts();

  // Listen for real-time updates from Firebase
  onValue(dataRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      updateDashboard(data);
    } else {
      console.error("No data received from Firebase");
      document.getElementById("alertBanner").classList.add("show");
      document.getElementById("alertMessage").textContent =
        "⚠️ Failed to fetch data from Firebase";
    }
  });
};
