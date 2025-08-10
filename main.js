// Simulated data (replace with actual Firebase connection)
let currentData = {
  soilMoisture: 45,
  waterLevel: 75,
  solarVoltage: 2.8,
  pumpStatus: 0,
  timestamp: Date.now(),
};

let historicalData = {
  timestamps: [],
  soilMoisture: [],
  waterLevel: [],
  solarVoltage: [],
  pumpStatus: [],
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

  // Update progress bars
  document.getElementById("soilProgress").style.width = data.soilMoisture + "%";
  document.getElementById("waterProgress").style.width = data.waterLevel + "%";
  document.getElementById("solarProgress").style.width =
    (data.solarVoltage / 3.3) * 100 + "%";

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
    pumpRuntime++;
  } else {
    pumpElement.classList.remove("active");
    pumpText.textContent = "OFF";
  }
  document.getElementById("pumpRuntime").textContent = pumpRuntime;

  // Update last update time
  const now = new Date();
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
  // Simulated statistics - replace with actual calculations
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
  const time = new Date().toLocaleTimeString();
  historicalData.timestamps.push(time);
  historicalData.soilMoisture.push(data.soilMoisture);
  historicalData.waterLevel.push(data.waterLevel);
  historicalData.solarVoltage.push(data.solarVoltage);

  // Keep only last 24 data points
  if (historicalData.timestamps.length > 24) {
    historicalData.timestamps.shift();
    historicalData.soilMoisture.shift();
    historicalData.waterLevel.shift();
    historicalData.solarVoltage.shift();
  }

  // Update trends chart
  trendsChart.data.labels = historicalData.timestamps;
  trendsChart.data.datasets[0].data = historicalData.soilMoisture;
  trendsChart.data.datasets[1].data = historicalData.waterLevel;
  trendsChart.update();

  // Update solar chart
  solarChart.data.labels = historicalData.timestamps.slice(-10);
  solarChart.data.datasets[0].data = historicalData.solarVoltage.slice(-10);
  solarChart.update();
}

function refreshData() {
  // Simulate data refresh (replace with actual Firebase fetch)
  currentData = {
    soilMoisture: Math.floor(Math.random() * 100),
    waterLevel: Math.floor(Math.random() * 100),
    solarVoltage: Math.random() * 3.3,
    pumpStatus: Math.random() > 0.5 ? 1 : 0,
    timestamp: Date.now(),
  };
  updateDashboard(currentData);
}

function toggleAutoMode() {
  autoMode = !autoMode;
  document.getElementById("autoModeStatus").textContent = autoMode
    ? "ON"
    : "OFF";
  alert(`Auto mode ${autoMode ? "enabled" : "disabled"}`);
}

function manualPumpToggle() {
  if (!autoMode) {
    currentData.pumpStatus = currentData.pumpStatus === 1 ? 0 : 1;
    updateDashboard(currentData);
  } else {
    alert("Please disable auto mode first to control pump manually");
  }
}

function downloadReport() {
  alert("Report download feature coming soon!");
}

// Initialize on load
window.onload = function () {
  initCharts();
  updateDashboard(currentData);

  // Auto-refresh every 5 seconds (matching your ESP32 delay)
  setInterval(refreshData, 5000);
};

// TODO: Add Firebase integration
// Import Firebase SDK and replace simulated data with:
/*
        import { initializeApp } from 'firebase/app';
        import { getDatabase, ref, onValue } from 'firebase/database';
        
        const firebaseConfig = {
            apiKey: "AIzaSyCmvVA9K1kkzhMq8bMuJXVnNHI_c92_DW8",
            databaseURL: "https://water-harvesting-b4520-default-rtdb.firebaseio.com/"
        };
        
        const app = initializeApp(firebaseConfig);
        const database = getDatabase(app);
        
        const dataRef = ref(database, 'sensorData');
        onValue(dataRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                updateDashboard(data);
            }
        });
        */
