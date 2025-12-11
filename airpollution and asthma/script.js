// ===========================================================
//                MANUAL AQI + GEOCODING DATA
// ===========================================================

// You can edit AQI values anytime here 👇
const MANUAL_DATA = {
    "delhi": {
        lat: 28.6139,
        lon: 77.2090,
        aqiIndex: 5,      // Very Poor (1-5 scale)
        pm25: 180,
        pm10: 250
    },
    "lucknow": {
        lat: 26.8467,
        lon: 80.9462,
        aqiIndex: 4,      // Poor
        pm25: 150,
        pm10: 200
    },
    "shillong": {
        lat: 25.5788,
        lon: 91.8933,
        aqiIndex: 2,      // Fair
        pm25: 25,
        pm10: 40
    }
};


// ===========================================================
//                     NAVIGATION TOGGLE
// ===========================================================

document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    toggleButton.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
});


// ===========================================================
//                   AQI CATEGORY / COLOR
// ===========================================================

function getAqiInfo(aqiIndex) {
    let category = '';
    let color = '';
    let healthAdvice = '';

    if (aqiIndex == 1) {
        category = 'Good'; color = '#00e400';
        healthAdvice = "Air quality is good.";
    } else if (aqiIndex == 2) {
        category = 'Fair'; color = '#ffff00';
        healthAdvice = "Moderate risk for sensitive groups.";
    } else if (aqiIndex == 3) {
        category = 'Moderate'; color = '#ff7e00';
        healthAdvice = "Asthma patients should limit outdoor activity.";
    } else if (aqiIndex == 4) {
        category = 'Poor'; color = '#ff0000';
        healthAdvice = "Avoid outdoor physical activity.";
    } else if (aqiIndex == 5) {
        category = 'Very Poor'; color = '#8f3f97';
        healthAdvice = "Severe health risk! Stay indoors.";
    } else {
        category = '--'; color = '#ccc';
        healthAdvice = "No data available.";
    }

    return { category, color, healthAdvice };
}

function showAsthmaWarning(healthAdvice) {
    const warningBox = document.getElementById('asthma-warning');
    warningBox.innerHTML = healthAdvice;
    warningBox.classList.remove('hidden');
}



// ===========================================================
//                   PAGE 1 → HOME PAGE
//                FETCH (MANUAL) AQI DATA
// ===========================================================

async function fetchAQI() {
    const cityInput = document.getElementById('city-input').value.trim().toLowerCase();

    if (!cityInput) {
        alert("Enter a city name.");
        return;
    }

    // Check if city exists in manual data
    const cityData = MANUAL_DATA[cityInput];

    if (!cityData) {
        alert("City not found in manual database.\nAvailable: Delhi, Lucknow, Shillong.");
        return;
    }

    // Extract manually provided data
    const { aqiIndex, pm25, pm10 } = cityData;
    const { category, color, healthAdvice } = getAqiInfo(aqiIndex);

    // Update UI
    document.getElementById('location-name').textContent = cityInput.toUpperCase();
    document.getElementById('aqi-category').textContent = category;
    document.getElementById('aqi-color-bar').style.backgroundColor = color;
    document.getElementById('pm25-val').textContent = pm25;
    document.getElementById('pm10-val').textContent = pm10;

    document.getElementById('aqi-results').classList.remove('hidden');

    // Show warning
    showAsthmaWarning(healthAdvice);

    // Save for Solutions page
    localStorage.setItem('lastAqi', aqiIndex);

    // Hide forecast (still simulated)
    document.getElementById('forecast-results').classList.add('hidden');
}



// ===========================================================
//               PAGE 2 → AIR POLLUTION CHART
// ===========================================================

function initializePollutionChart() {
    const labels = ['Day -6', 'Day -5', 'Day -4', 'Day -3', 'Day -2', 'Yesterday', 'Today'];
    const dataPM25 = [60, 75, 55, 120, 90, 80, 48];
    const dataPM10 = [100, 150, 90, 210, 160, 130, 75];

    const ctx = document.getElementById('pollution-chart').getContext('2d');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'PM2.5 (µg/m³)',
                    data: dataPM25,
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.2)',
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'PM10 (µg/m³)',
                    data: dataPM10,
                    borderColor: '#f39c12',
                    backgroundColor: 'rgba(243, 156, 18, 0.2)',
                    fill: true,
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true
        }
    });
}



// ===========================================================
//               PAGE 3 → ASTHMA CHECKER
// ===========================================================

function checkAsthmaRisk() {
    const symptoms = document.querySelectorAll('#symptom-form input[name="symptom"]:checked');
    const symptomValues = Array.from(symptoms).map(s => s.value);
    const count = symptoms.length;

    const resultsDiv = document.getElementById('risk-results');
    const riskLevelSpan = document.getElementById('risk-level');

    let risk = "Low";

    if (count >= 3 || symptomValues.includes('shortness')) {
        risk = "HIGH (Severe)";
    } else if (count >= 1) {
        risk = "Medium";
    }

    riskLevelSpan.textContent = risk;
    resultsDiv.classList.remove('hidden');

    localStorage.setItem('lastSymptoms', JSON.stringify(symptomValues));
}



// ===========================================================
//               PAGE 4 → SOLUTIONS PAGE
// ===========================================================

function loadRecommendations() {
    const lastAqi = parseInt(localStorage.getItem('lastAqi') || 1);
    const symptoms = JSON.parse(localStorage.getItem('lastSymptoms') || '[]');
    const recsDiv = document.getElementById('recs-output');

    const info = getAqiInfo(lastAqi);

    const recs = [];

    recs.push(`<strong>Your Last AQI:</strong> ${info.category}`);
    recs.push(`<strong>Symptoms:</strong> ${symptoms.length > 0 ? symptoms.join(', ') : "None"}`);

    if (lastAqi >= 4) recs.push("Avoid going outside.");
    else if (lastAqi == 3) recs.push("Limit outdoor activity.");
    else recs.push("Air quality is good.");

    recsDiv.innerHTML = "<ul>" + recs.map(r => `<li>${r}</li>`).join("") + "</ul>";
}



// ===========================================================
//               PAGE 5 → TOOLS PAGE (MANUAL)
// ===========================================================

function getInstantAQI() {
    const cityInput = document.getElementById('tool-city-input').value.trim().toLowerCase();
    const result = document.getElementById('instant-aqi-result');

    const cityData = MANUAL_DATA[cityInput];

    if (!cityData) {
        result.innerHTML = `<p style="color:red;">City not found in manual database.</p>`;
        return;
    }

    const { aqiIndex } = cityData;
    const { category, color } = getAqiInfo(aqiIndex);

    result.innerHTML = `
        <p>AQI for ${cityInput.toUpperCase()}: 
        <strong style="color:${color};">${aqiIndex}</strong></p>
        <p>Category: ${category}</p>
    `;
}
const pollutantData = {
    delhi: { PM25: 180, PM10: 250, NO2: 95, Ozone: 70 },
    lucknow: { PM25: 160, PM10: 210, NO2: 80, Ozone: 60 },
    shillong: { PM25: 40, PM10: 60, NO2: 20, Ozone: 30 }
};

const radarCtx = document.getElementById('radarChart').getContext('2d');

let radarChart = new Chart(radarCtx, {
    type: 'radar',
    data: {
        labels: ['PM25', 'PM10', 'NO₂', 'Ozone'],
        datasets: [{
            label: 'Pollutant Levels',
            data: [0, 0, 0, 0],
            fill: true,
            backgroundColor: "rgba(0, 128, 0, 0.3)",
            borderColor: "rgba(0, 128, 0, 1)",
            pointBackgroundColor: "rgba(0, 128, 0, 1)",
            pointBorderColor: "#fff",
            borderWidth: 2
        }]
    },
    options: {
        responsive: true,
        scales: {
            r: {
                min: 0,
                max: 300,
                ticks: { stepSize: 50 },
                grid: { color: "#ccc" },
                angleLines: { color: "#ccc" }
            }
        }
    }
});

// ----------------------
// MANUAL DATA (Change Anytime)
// ----------------------
const cityData = {
    delhi: {
        aqi: 310,
        pm25: 180,
        pm10: 240,
        no2: 95,
        ozone: 50
    },
    lucknow: {
        aqi: 220,
        pm25: 130,
        pm10: 180,
        no2: 60,
        ozone: 40
    },
    shillong: {
        aqi: 70,
        pm25: 30,
        pm10: 40,
        no2: 20,
        ozone: 15
    }
};

// ----------------------
// SEARCH FUNCTION
// ----------------------
function searchCity() {
    let typedCity = document.getElementById("city-input").value.trim().toLowerCase();
    let dropdownCity = document.getElementById("city-dropdown").value;

    let finalCity = dropdownCity || typedCity;

    if (!finalCity || !cityData[finalCity]) {
        alert("City not found in manual data!");
        return;
    }

    // Update AQI box
    document.getElementById("city-name").textContent = capitalize(finalCity);
    document.getElementById("aqi-value").textContent = cityData[finalCity].aqi;
    document.getElementById("aqi-box").classList.remove("hidden");

    // Update Radar Chart
    updateRadar(finalCity);
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ----------------------
// RADAR CHART
// ----------------------

function updateRadar(city) {
    let c = cityData[city];

    let data = [c.pm25, c.pm10, c.no2, c.ozone];

    if (radarChart) radarChart.destroy();

    const ctx = document.getElementById("radarChart");

    radarChart = new Chart(ctx, {
        type: "radar",
        data: {
            labels: ["PM2.5", "PM10", "NO₂", "Ozone"],
            datasets: [{
                label: capitalize(city) + " Pollutants",
                data: data,
                fill: true,
                backgroundColor: "rgba(0, 128, 255, 0.2)",
                borderColor: "rgb(0, 128, 255)",
                pointBackgroundColor: "rgb(0, 128, 255)"
            }]
        },
        options: {
            responsive: true,
            scales: {
                r: { beginAtZero: true }
            }
        }
    });
}
