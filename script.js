// ========== FarmGuru - Main Application Script ==========

const WEATHER_API_KEY = '3c62d9d1ccd24beb815204547241811';

// ========== Initialization ==========
document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initThemeToggle();
    initLanguageSelector();
    initWeather();
    initCropRecommendation();
    initFertilizerOptimizer();
    initPestDetection();
    initMarketInsights();
    initCommunity();
    initMap();
    initChatbot();
    initHeroSearch();
    initScrollAnimations();

    // Apply saved language
    i18n.updateDOM();
});

// ========== Navbar / Sidebar ==========
function initNavbar() {
    const navLinks = document.getElementById('navLinks');
    const mobileNav = document.getElementById('mobileNav');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const mobileMoreBtn = document.getElementById('mobileMoreBtn');
    const mobileDrawerClose = document.getElementById('mobileDrawerClose');
    const mobileDrawerOverlay = document.getElementById('mobileDrawerOverlay');

    // Mobile "More" drawer
    if (mobileMoreBtn) {
        mobileMoreBtn.addEventListener('click', () => mobileDrawer.classList.add('open'));
    }
    if (mobileDrawerClose) {
        mobileDrawerClose.addEventListener('click', () => mobileDrawer.classList.remove('open'));
    }
    if (mobileDrawerOverlay) {
        mobileDrawerOverlay.addEventListener('click', () => mobileDrawer.classList.remove('open'));
    }

    // Close drawer on link click
    document.querySelectorAll('.mobile-drawer-link').forEach(link => {
        link.addEventListener('click', () => mobileDrawer.classList.remove('open'));
    });

    // Active link highlighting on scroll
    const sections = document.querySelectorAll('section[id]');
    const allNavLinks = [
        ...document.querySelectorAll('.nav-links a'),
        ...document.querySelectorAll('.mobile-nav-item[href]')
    ];

    window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY + 120;
        let currentId = '';
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            if (scrollPos >= top && scrollPos < top + height) {
                currentId = section.getAttribute('id');
            }
        });

        allNavLinks.forEach(link => {
            const href = link.getAttribute('href');
            link.classList.toggle('active', href === `#${currentId}`);
        });
    });

    // Sync mobile language selector with desktop
    const langMobile = document.getElementById('langSelectorMobile');
    const langDesktop = document.getElementById('langSelector');
    if (langMobile && langDesktop) {
        langMobile.addEventListener('change', e => {
            langDesktop.value = e.target.value;
            langDesktop.dispatchEvent(new Event('change'));
        });
        langDesktop.addEventListener('change', () => {
            langMobile.value = langDesktop.value;
        });
    }

    // Sync mobile theme toggle with desktop
    const themeToggleMobile = document.getElementById('themeToggleMobile');
    if (themeToggleMobile) {
        themeToggleMobile.addEventListener('click', () => {
            document.getElementById('themeToggle').click();
            // Sync icon
            const icon = document.getElementById('themeToggle').querySelector('i').className;
            themeToggleMobile.querySelector('i').className = icon;
        });
    }
}

// ========== Theme Toggle ==========
function initThemeToggle() {
    const toggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('farmguru-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    toggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('farmguru-theme', next);
        updateThemeIcon(next);
    });
}

function updateThemeIcon(theme) {
    const cls = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    document.querySelectorAll('#themeToggle i, #themeToggleMobile i').forEach(icon => {
        icon.className = cls;
    });
}

// ========== Language Selector ==========
function initLanguageSelector() {
    const selector = document.getElementById('langSelector');
    const selectorMobile = document.getElementById('langSelectorMobile');
    selector.value = i18n.currentLang;
    if (selectorMobile) selectorMobile.value = i18n.currentLang;
    selector.addEventListener('change', (e) => {
        i18n.setLanguage(e.target.value);
    });
}

// ========== Weather ==========
function initWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            pos => fetchWeather(pos.coords.latitude, pos.coords.longitude),
            () => {
                // Default to Delhi if location denied
                fetchWeather(28.6139, 77.2090);
            }
        );
    } else {
        fetchWeather(28.6139, 77.2090);
    }
}

function fetchWeather(lat, lon) {
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${lat},${lon}&days=1`;

    fetch(url)
        .then(r => r.json())
        .then(data => {
            document.getElementById('weatherLoading').style.display = 'none';
            document.getElementById('weatherContent').style.display = 'block';

            const { current, location, forecast } = data;
            const day = forecast.forecastday[0].day;
            const hours = forecast.forecastday[0].hour;

            document.getElementById('locationName').textContent = `${location.name}, ${location.region}`;
            document.getElementById('weatherDate').textContent = new Date(location.localtime).toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });
            document.getElementById('tempMain').textContent = `${Math.round(current.temp_c)}°C`;
            document.getElementById('tempCondition').textContent = current.condition.text;
            document.getElementById('tempRange').textContent = `H: ${Math.round(day.maxtemp_c)}° L: ${Math.round(day.mintemp_c)}°`;
            document.getElementById('weatherIcon').src = `https:${current.condition.icon.replace('64x64', '128x128')}`;
            document.getElementById('windSpeed').textContent = `${current.wind_kph} km/h`;
            document.getElementById('humidity').textContent = `${current.humidity}%`;
            document.getElementById('rainChance').textContent = `${day.daily_chance_of_rain}%`;
            document.getElementById('visibility').textContent = `${current.vis_km} km`;
            document.getElementById('pressure').textContent = `${current.pressure_mb} mb`;
            document.getElementById('uvIndex').textContent = current.uv;

            // Hourly forecast
            const currentHour = new Date(location.localtime).getHours();
            const upcoming = hours.filter(h => new Date(h.time).getHours() >= currentHour).slice(0, 8);
            document.getElementById('hourlyForecast').innerHTML = upcoming.map(h => {
                const hr = new Date(h.time).getHours();
                const displayTime = hr === 0 ? '12 AM' : hr < 12 ? `${hr} AM` : hr === 12 ? '12 PM' : `${hr - 12} PM`;
                return `
                    <div class="hourly-item">
                        <div class="hourly-time">${displayTime}</div>
                        <img src="https:${h.condition.icon}" alt="${h.condition.text}">
                        <div class="hourly-temp">${Math.round(h.temp_c)}°</div>
                    </div>
                `;
            }).join('');

            // Farming advisory
            generateAdvisory(current, day);

            // Store for crop recommendation
            window.weatherData = { temp: current.temp_c, humidity: current.humidity, condition: current.condition.text };
        })
        .catch(() => {
            document.getElementById('weatherLoading').innerHTML = '<p>Unable to load weather data. Please check your connection.</p>';
        });
}

function generateAdvisory(current, day) {
    const advisories = [];
    if (day.daily_chance_of_rain > 60) {
        advisories.push('High rain probability today. Consider postponing pesticide spraying and ensure proper drainage.');
    }
    if (current.temp_c > 35) {
        advisories.push('Extreme heat alert. Ensure adequate irrigation and consider shade nets for sensitive crops.');
    }
    if (current.temp_c < 5) {
        advisories.push('Frost risk. Protect tender crops with mulching or frost covers.');
    }
    if (current.wind_kph > 30) {
        advisories.push('Strong winds expected. Secure plant supports and avoid spraying operations.');
    }
    if (current.humidity > 80) {
        advisories.push('High humidity may increase fungal disease risk. Monitor crops for signs of blight or mildew.');
    }
    if (current.uv > 7) {
        advisories.push('High UV index. Schedule fieldwork during early morning or late evening hours.');
    }
    if (advisories.length === 0) {
        advisories.push('Weather conditions are favorable for farming activities today. Good conditions for field work.');
    }

    document.getElementById('advisoryContent').innerHTML = advisories
        .map(a => `<div class="advisory-item">${a}</div>`).join('');
}

// ========== Crop Recommendations (Kaggle Dataset) ==========
// Data derived from: https://www.kaggle.com/datasets/atharvaingle/crop-recommendation-dataset
// Each crop has mean & std of N, P, K, temperature, humidity, pH, rainfall from 100 samples each
const kaggleCropData = [
    { label: 'Rice',         N: [80, 20],  P: [48, 15],  K: [40, 10],  temp: [23.7, 3.5],  humidity: [82.3, 7.0],   ph: [6.4, 0.8],  rainfall: [236.2, 40.0] },
    { label: 'Maize',        N: [78, 18],  P: [48, 12],  K: [20, 5],   temp: [22.4, 3.5],  humidity: [65.8, 8.0],   ph: [6.2, 0.7],  rainfall: [88.7, 25.0] },
    { label: 'Chickpea',     N: [18, 10],  P: [68, 15],  K: [80, 10],  temp: [18.9, 3.0],  humidity: [16.9, 5.0],   ph: [7.1, 0.5],  rainfall: [80.1, 20.0] },
    { label: 'Kidney Beans', N: [20, 5],   P: [68, 12],  K: [20, 5],   temp: [20.1, 3.5],  humidity: [21.6, 6.0],   ph: [5.7, 0.5],  rainfall: [105.9, 30.0] },
    { label: 'Pigeon Peas',  N: [20, 10],  P: [68, 12],  K: [20, 5],   temp: [27.7, 5.0],  humidity: [48.6, 15.0],  ph: [5.8, 0.8],  rainfall: [149.5, 40.0] },
    { label: 'Moth Beans',   N: [21, 8],   P: [48, 12],  K: [20, 5],   temp: [28.2, 4.0],  humidity: [53.2, 10.0],  ph: [6.8, 0.8],  rainfall: [51.2, 15.0] },
    { label: 'Mung Bean',    N: [21, 8],   P: [48, 10],  K: [20, 5],   temp: [28.5, 3.5],  humidity: [85.5, 5.0],   ph: [6.7, 0.6],  rainfall: [48.6, 12.0] },
    { label: 'Black Gram',   N: [40, 10],  P: [68, 12],  K: [20, 5],   temp: [30.0, 4.0],  humidity: [65.1, 10.0],  ph: [7.1, 0.6],  rainfall: [67.9, 20.0] },
    { label: 'Lentil',       N: [18, 8],   P: [68, 15],  K: [20, 5],   temp: [24.5, 5.0],  humidity: [64.8, 12.0],  ph: [6.9, 0.7],  rainfall: [45.7, 15.0] },
    { label: 'Pomegranate',  N: [18, 8],   P: [18, 8],   K: [40, 5],   temp: [21.8, 4.0],  humidity: [90.1, 5.0],   ph: [6.4, 0.7],  rainfall: [107.5, 20.0] },
    { label: 'Banana',       N: [100, 15], P: [82, 10],  K: [50, 10],  temp: [27.0, 2.0],  humidity: [80.4, 5.0],   ph: [6.0, 0.5],  rainfall: [104.6, 20.0] },
    { label: 'Mango',        N: [20, 8],   P: [18, 8],   K: [30, 5],   temp: [31.2, 4.0],  humidity: [50.2, 10.0],  ph: [5.8, 0.6],  rainfall: [94.6, 30.0] },
    { label: 'Grapes',       N: [23, 10],  P: [132, 10], K: [200, 5],  temp: [23.8, 5.0],  humidity: [82.0, 5.0],   ph: [6.0, 0.8],  rainfall: [69.6, 15.0] },
    { label: 'Watermelon',   N: [100, 15], P: [18, 8],   K: [50, 5],   temp: [25.6, 3.0],  humidity: [85.0, 5.0],   ph: [6.5, 0.5],  rainfall: [50.8, 15.0] },
    { label: 'Muskmelon',    N: [100, 15], P: [18, 8],   K: [50, 5],   temp: [28.7, 3.0],  humidity: [92.3, 3.0],   ph: [6.4, 0.5],  rainfall: [24.7, 8.0] },
    { label: 'Apple',        N: [20, 8],   P: [132, 10], K: [200, 5],  temp: [23.0, 4.0],  humidity: [92.3, 4.0],   ph: [5.9, 0.5],  rainfall: [112.7, 20.0] },
    { label: 'Orange',       N: [20, 5],   P: [18, 8],   K: [10, 5],   temp: [22.8, 4.0],  humidity: [92.2, 4.0],   ph: [7.0, 0.5],  rainfall: [110.5, 20.0] },
    { label: 'Papaya',       N: [50, 15],  P: [58, 12],  K: [50, 5],   temp: [33.7, 5.0],  humidity: [92.4, 4.0],   ph: [6.7, 0.5],  rainfall: [45.2, 15.0] },
    { label: 'Coconut',      N: [22, 8],   P: [18, 8],   K: [30, 5],   temp: [27.4, 2.0],  humidity: [94.8, 3.0],   ph: [6.0, 0.5],  rainfall: [175.7, 40.0] },
    { label: 'Cotton',       N: [118, 15], P: [46, 10],  K: [20, 5],   temp: [24.0, 3.5],  humidity: [80.0, 5.0],   ph: [7.0, 0.5],  rainfall: [80.1, 20.0] },
    { label: 'Jute',         N: [78, 15],  P: [46, 10],  K: [40, 5],   temp: [25.0, 2.5],  humidity: [80.4, 5.0],   ph: [6.7, 0.5],  rainfall: [174.8, 30.0] },
    { label: 'Coffee',       N: [101, 15], P: [28, 8],   K: [30, 5],   temp: [25.5, 2.5],  humidity: [58.9, 8.0],   ph: [6.8, 0.5],  rainfall: [158.1, 30.0] }
];

const cropEmojis = {
    Rice: '🌾', Maize: '🌽', Chickpea: '🫘', 'Kidney Beans': '🫘', 'Pigeon Peas': '🌿',
    'Moth Beans': '🌱', 'Mung Bean': '🌱', 'Black Gram': '🌑', Lentil: '🫘',
    Pomegranate: '🍎', Banana: '🍌', Mango: '🥭', Grapes: '🍇', Watermelon: '🍉',
    Muskmelon: '🍈', Apple: '🍏', Orange: '🍊', Papaya: '🥭', Coconut: '🥥',
    Cotton: '🏵️', Jute: '🌿', Coffee: '☕', default: '🌱'
};

// Calculate Gaussian suitability score: how well input matches crop's ideal range
function gaussianScore(value, mean, std) {
    if (std === 0) return value === mean ? 1 : 0;
    return Math.exp(-0.5 * Math.pow((value - mean) / std, 2));
}

// Compute overall suitability for a crop given user inputs
function computeCropScore(crop, N, P, K, temp, humidity, ph, rainfall) {
    const scores = [
        gaussianScore(N, crop.N[0], crop.N[1]),
        gaussianScore(P, crop.P[0], crop.P[1]),
        gaussianScore(K, crop.K[0], crop.K[1]),
        gaussianScore(temp, crop.temp[0], crop.temp[1]),
        gaussianScore(humidity, crop.humidity[0], crop.humidity[1]),
        gaussianScore(ph, crop.ph[0], crop.ph[1]),
        gaussianScore(rainfall, crop.rainfall[0], crop.rainfall[1])
    ];
    // Weighted average: NPK and climate equally important
    const weights = [1, 1, 1, 1.2, 0.8, 1, 1];
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    return scores.reduce((sum, s, i) => sum + s * weights[i], 0) / totalWeight;
}

function getSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'Spring';
    if (month >= 5 && month <= 8) return 'Kharif (Summer)';
    if (month >= 9 && month <= 10) return 'Autumn';
    return 'Rabi (Winter)';
}

function initCropRecommendation() {
    // Auto-fill temp & humidity from weather when available
    const fillFromWeather = () => {
        if (window.weatherData) {
            document.getElementById('cropTemp').value = window.weatherData.temp;
            document.getElementById('cropHumidity').value = window.weatherData.humidity;
        }
    };
    // Try immediately and also after a delay (weather may load later)
    fillFromWeather();
    setTimeout(fillFromWeather, 3000);
    setTimeout(fillFromWeather, 6000);

    document.getElementById('getCropRecommendation').addEventListener('click', () => {
        const N = parseFloat(document.getElementById('cropN').value) || 0;
        const P = parseFloat(document.getElementById('cropP').value) || 0;
        const K = parseFloat(document.getElementById('cropK').value) || 0;
        const temp = parseFloat(document.getElementById('cropTemp').value) || 25;
        const humidity = parseFloat(document.getElementById('cropHumidity').value) || 70;
        const ph = parseFloat(document.getElementById('cropPH').value) || 6.5;
        const rainfall = parseFloat(document.getElementById('cropRainfall').value) || 150;

        // Score all 22 crops
        const scored = kaggleCropData.map(crop => ({
            ...crop,
            score: computeCropScore(crop, N, P, K, temp, humidity, ph, rainfall)
        })).sort((a, b) => b.score - a.score);

        const season = getSeason();

        const topCrops = scored.filter(c => c.score > 0.15);
        const display = topCrops.length >= 3 ? topCrops : scored.slice(0, 5);

        let html = `<div class="crop-results-head">
            <h3>${i18n.t('crops.resultTitle')}</h3>
            <span class="crop-results-meta">${season} &middot; ${display.length} of 22</span>
        </div><div class="crop-chips">`;

        display.forEach((crop, idx) => {
            const emoji = cropEmojis[crop.label] || cropEmojis.default;
            const pct = (crop.score * 100).toFixed(0);
            const matchClass = crop.score > 0.7 ? 'excellent' : crop.score > 0.4 ? 'good' : 'partial';
            html += `<div class="crop-chip${idx === 0 ? ' selected' : ''}" onclick="showCropDetail(${idx})" data-idx="${idx}">
                <span class="crop-chip-emoji">${emoji}</span>
                <span class="crop-chip-name">${crop.label}</span>
                <span class="crop-chip-pct ${matchClass}">${pct}%</span>
            </div>`;
        });

        html += `</div><div class="crop-detail-panel visible" id="cropDetailPanel"></div>`;

        window._cropDisplay = display.map(c => ({
            label: c.label,
            emoji: cropEmojis[c.label] || cropEmojis.default,
            pct: (c.score * 100).toFixed(0),
            N: c.N[0], P: c.P[0], K: c.K[0],
            temp: c.temp[0], humidity: c.humidity[0], rainfall: c.rainfall[0]
        }));

        document.getElementById('cropResults').innerHTML = html;
        showCropDetail(0);
    });
}

function showCropDetail(idx) {
    const crop = window._cropDisplay[idx];
    if (!crop) return;
    document.querySelectorAll('.crop-chip').forEach(c => c.classList.toggle('selected', +c.dataset.idx === idx));
    const panel = document.getElementById('cropDetailPanel');
    panel.className = 'crop-detail-panel visible';
    panel.innerHTML = `
        <div class="crop-detail-panel-head">
            <span>${crop.emoji}</span>
            <strong>${crop.label}</strong>
            <span style="font-size:0.8rem;font-weight:700;color:var(--accent);margin-left:auto">${crop.pct}% match</span>
        </div>
        <div class="crop-detail-grid">
            <span><i class="fas fa-atom"></i> N: ${crop.N}</span>
            <span><i class="fas fa-flask"></i> P: ${crop.P}</span>
            <span><i class="fas fa-fire"></i> K: ${crop.K}</span>
            <span><i class="fas fa-thermometer-half"></i> ${crop.temp}°C</span>
            <span><i class="fas fa-tint"></i> ${crop.humidity}%</span>
            <span><i class="fas fa-cloud-rain"></i> ${crop.rainfall}mm</span>
        </div>`;
}

// ========== Fertilizer Optimizer ==========
const fertilizerData = {
    organic: {
        seedling: [
            { name: 'Vermicompost', dosage: '2-3 tons/acre', desc: 'Apply as base dressing before transplanting. Rich in nutrients and beneficial microorganisms.' },
            { name: 'Neem Cake', dosage: '200 kg/acre', desc: 'Mix with soil to improve seedling vigor and protect against soil-borne pests.' }
        ],
        vegetative: [
            { name: 'Farm Yard Manure (FYM)', dosage: '5-8 tons/acre', desc: 'Apply around root zone. Provides balanced NPK and improves soil structure.' },
            { name: 'Jeevamrut', dosage: '200 L/acre (monthly)', desc: 'Liquid biofertilizer to boost microbial activity and plant growth.' },
            { name: 'Green Manure', dosage: 'Incorporate cover crop', desc: 'Plow under green manure crop to add nitrogen and organic matter.' }
        ],
        flowering: [
            { name: 'Bone Meal', dosage: '100 kg/acre', desc: 'High phosphorus content promotes flowering and fruit set.' },
            { name: 'Panchagavya', dosage: '3% foliar spray', desc: 'Natural growth promoter that enhances flowering and fruiting.' }
        ],
        fruiting: [
            { name: 'Wood Ash', dosage: '200 kg/acre', desc: 'Rich in potassium, supports fruit development and quality.' },
            { name: 'Seaweed Extract', dosage: '2-3 ml/L foliar spray', desc: 'Provides micronutrients and growth hormones for better fruit quality.' }
        ],
        harvest: [
            { name: 'Reduce all inputs', dosage: 'Minimal', desc: 'Reduce fertilizer inputs near harvest to improve produce quality and shelf life.' }
        ]
    },
    conventional: {
        seedling: [
            { name: 'DAP (Di-Ammonium Phosphate)', dosage: '50 kg/acre', desc: 'Base application for phosphorus and nitrogen at planting.' },
            { name: 'SSP (Single Super Phosphate)', dosage: '100 kg/acre', desc: 'Alternative phosphorus source with added calcium and sulphur.' }
        ],
        vegetative: [
            { name: 'Urea', dosage: '50-75 kg/acre', desc: 'Split application for nitrogen. Apply in 2-3 doses during active growth.' },
            { name: 'NPK 19:19:19', dosage: '5 g/L foliar spray', desc: 'Balanced nutrition through foliar application for quick uptake.' }
        ],
        flowering: [
            { name: 'MOP (Muriate of Potash)', dosage: '30 kg/acre', desc: 'Potassium boost for flowering and stress resistance.' },
            { name: 'Boron', dosage: '1 g/L foliar spray', desc: 'Essential micronutrient for flower retention and pollen viability.' }
        ],
        fruiting: [
            { name: 'Potassium Sulphate', dosage: '25 kg/acre', desc: 'Improves fruit size, color, and sugar content.' },
            { name: 'Calcium Nitrate', dosage: '5 g/L foliar spray', desc: 'Prevents blossom-end rot and improves fruit firmness.' }
        ],
        harvest: [
            { name: 'Stop all chemical inputs', dosage: 'None', desc: 'Maintain pre-harvest interval (PHI) for food safety compliance.' }
        ]
    },
    integrated: {
        seedling: [
            { name: 'Vermicompost + DAP', dosage: '1.5 tons + 25 kg/acre', desc: 'Combination of organic base and minimal chemical for strong start.' },
            { name: 'Trichoderma', dosage: '2 kg/acre', desc: 'Bio-agent for soil disease suppression and growth promotion.' }
        ],
        vegetative: [
            { name: 'FYM + Urea', dosage: '3 tons + 25 kg/acre', desc: 'Organic base with supplemental nitrogen for balanced growth.' },
            { name: 'Azotobacter / Rhizobium', dosage: 'Seed treatment', desc: 'Nitrogen-fixing bacteria to reduce chemical nitrogen dependency.' }
        ],
        flowering: [
            { name: 'Bone Meal + MOP', dosage: '50 kg + 15 kg/acre', desc: 'Organic phosphorus with chemical potassium for optimal flowering.' },
            { name: 'PSB (Phosphate Solubilizing Bacteria)', dosage: '2 kg/acre', desc: 'Unlocks fixed phosphorus in soil for plant uptake.' }
        ],
        fruiting: [
            { name: 'Wood Ash + Potassium Sulphate', dosage: '100 kg + 12 kg/acre', desc: 'Combined organic and chemical potassium for fruit quality.' },
            { name: 'Humic Acid', dosage: '2 ml/L foliar spray', desc: 'Improves nutrient uptake and overall plant health.' }
        ],
        harvest: [
            { name: 'Minimal inputs', dosage: 'Reduce significantly', desc: 'Taper off both organic and chemical inputs before harvest.' }
        ]
    }
};

function initFertilizerOptimizer() {
    document.getElementById('getFertilizer').addEventListener('click', () => {
        const crop = document.getElementById('fertilizerCrop').value;
        const stage = document.getElementById('growthStage').value;
        const method = document.getElementById('farmingMethod').value;

        const plan = fertilizerData[method]?.[stage] || [];
        const stageNames = { seedling: 'Seedling', vegetative: 'Vegetative', flowering: 'Flowering', fruiting: 'Fruiting', harvest: 'Near Harvest' };
        const methodNames = { organic: 'Organic', conventional: 'Conventional', integrated: 'Integrated (IPM)' };
        const icons = { organic: '🌿', conventional: '⚗️', integrated: '🔄' };

        let html = `<div style="margin-bottom:16px">
            <h3 style="font-size:1.125rem;font-weight:700;margin-bottom:4px">${icons[method]} Fertilizer Plan - ${crop.charAt(0).toUpperCase() + crop.slice(1)}</h3>
            <p style="font-size:0.813rem;color:var(--text-muted)">Method: ${methodNames[method]} | Stage: ${stageNames[stage]}</p>
        </div><div class="fert-plan">`;

        plan.forEach(item => {
            html += `
                <div class="fert-item">
                    <h4><i class="fas fa-check-circle" style="color:var(--accent)"></i> ${item.name}</h4>
                    <p>${item.desc}</p>
                    <span class="dosage">Dosage: ${item.dosage}</span>
                </div>
            `;
        });

        html += '</div>';
        document.getElementById('fertilizerResults').innerHTML = html;
    });
}

// ========== Pest Detection ==========
const pestDatabase = [
    {
        symptoms: ['yellow', 'spots', 'leaves', 'yellowing'],
        pest: 'Leaf Blight / Bacterial Spot',
        severity: 'Moderate',
        treatment: 'Apply copper-based fungicide (Bordeaux mixture). Remove infected leaves. Ensure proper air circulation.',
        organic: 'Neem oil spray (5ml/L). Apply Trichoderma viride. Use baking soda solution (1 tsp/L).'
    },
    {
        symptoms: ['wilting', 'wilt', 'drooping', 'droopy'],
        pest: 'Fusarium Wilt / Root Rot',
        severity: 'High',
        treatment: 'Apply systemic fungicide (Carbendazim). Improve drainage. Practice crop rotation.',
        organic: 'Apply Trichoderma harzianum to soil. Add neem cake. Use biofumigation with mustard.'
    },
    {
        symptoms: ['holes', 'eaten', 'chewed', 'caterpillar', 'worm'],
        pest: 'Caterpillar / Armyworm',
        severity: 'High',
        treatment: 'Apply Chlorantraniliprole or Spinosad. Set up pheromone traps. Manual removal if infestation is small.',
        organic: 'Apply Bacillus thuringiensis (Bt). Use neem oil spray. Encourage natural predators like birds and wasps.'
    },
    {
        symptoms: ['white', 'powder', 'powdery', 'mildew'],
        pest: 'Powdery Mildew',
        severity: 'Moderate',
        treatment: 'Apply Sulphur-based fungicide. Improve air circulation. Avoid overhead irrigation.',
        organic: 'Milk spray (1:9 ratio). Baking soda solution. Apply potassium bicarbonate.'
    },
    {
        symptoms: ['brown', 'rust', 'orange', 'spots'],
        pest: 'Rust Disease',
        severity: 'Moderate to High',
        treatment: 'Apply Propiconazole or Mancozeb. Remove infected plant parts. Use resistant varieties.',
        organic: 'Apply neem oil. Use sulfur-based organic fungicides. Maintain proper plant spacing.'
    },
    {
        symptoms: ['aphid', 'tiny', 'green', 'insects', 'sticky', 'curling'],
        pest: 'Aphid Infestation',
        severity: 'Moderate',
        treatment: 'Apply Imidacloprid or Thiamethoxam. Use yellow sticky traps. Spray with soapy water for mild cases.',
        organic: 'Neem oil spray. Release ladybugs. Spray with garlic-chili extract.'
    },
    {
        symptoms: ['black', 'rot', 'decay', 'fungus', 'mold'],
        pest: 'Black Rot / Sooty Mold',
        severity: 'High',
        treatment: 'Apply Copper Oxychloride. Remove badly infected parts. Improve ventilation around plants.',
        organic: 'Apply Bordeaux mixture (organic grade). Prune affected areas. Use compost tea spray.'
    }
];

function initPestDetection() {
    const uploadZone = document.getElementById('uploadZone');
    const pestImage = document.getElementById('pestImage');
    const preview = document.getElementById('uploadPreview');
    const previewImg = document.getElementById('previewImage');
    const removeBtn = document.getElementById('removeImage');

    uploadZone.addEventListener('click', () => pestImage.click());
    uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.style.borderColor = 'var(--accent)'; });
    uploadZone.addEventListener('dragleave', () => { uploadZone.style.borderColor = ''; });
    uploadZone.addEventListener('drop', e => {
        e.preventDefault();
        uploadZone.style.borderColor = '';
        if (e.dataTransfer.files.length) handleImageUpload(e.dataTransfer.files[0]);
    });

    pestImage.addEventListener('change', e => {
        if (e.target.files.length) handleImageUpload(e.target.files[0]);
    });

    removeBtn.addEventListener('click', () => {
        preview.style.display = 'none';
        uploadZone.style.display = 'block';
        pestImage.value = '';
    });

    document.getElementById('analyzePest').addEventListener('click', () => {
        if (preview.style.display !== 'none') {
            simulatePestAnalysis();
        } else {
            document.getElementById('pestResults').innerHTML = '<div class="crop-placeholder"><i class="fas fa-exclamation-triangle"></i><p>Please upload an image first</p></div>';
        }
    });

    document.getElementById('analyzeSymptomsBtn').addEventListener('click', () => {
        const symptoms = document.getElementById('pestSymptoms').value.toLowerCase();
        if (!symptoms.trim()) return;
        analyzeSymptoms(symptoms);
    });
}

function handleImageUpload(file) {
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) {
        alert('File too large. Max 5MB.');
        return;
    }
    const reader = new FileReader();
    reader.onload = e => {
        document.getElementById('previewImage').src = e.target.result;
        document.getElementById('uploadPreview').style.display = 'block';
        document.getElementById('uploadZone').style.display = 'none';
    };
    reader.readAsDataURL(file);
}

function simulatePestAnalysis() {
    const randomPest = pestDatabase[Math.floor(Math.random() * pestDatabase.length)];
    showPestResult(randomPest);
}

function analyzeSymptoms(input) {
    let bestMatch = null;
    let bestScore = 0;

    pestDatabase.forEach(pest => {
        const score = pest.symptoms.filter(s => input.includes(s)).length;
        if (score > bestScore) {
            bestScore = score;
            bestMatch = pest;
        }
    });

    if (bestMatch && bestScore > 0) {
        showPestResult(bestMatch);
    } else {
        document.getElementById('pestResults').innerHTML = `
            <div class="pest-result-card">
                <h4>No exact match found</h4>
                <p>We couldn't identify the issue from the symptoms provided. Try uploading an image or providing more details about the affected plant parts, colors, and patterns you observe.</p>
            </div>
        `;
    }
}

function showPestResult(pest) {
    document.getElementById('pestResults').innerHTML = `
        <div class="pest-result-card">
            <h4><i class="fas fa-bug"></i> Detected: ${pest.pest}</h4>
            <p><strong>Severity:</strong> ${pest.severity}</p>
        </div>
        <div class="pest-result-card treatment">
            <h4><i class="fas fa-prescription-bottle-medical"></i> Chemical Treatment</h4>
            <p>${pest.treatment}</p>
        </div>
        <div class="pest-result-card treatment">
            <h4><i class="fas fa-leaf"></i> Organic Treatment</h4>
            <p>${pest.organic}</p>
        </div>
        <div class="pest-result-card treatment">
            <h4><i class="fas fa-shield-alt"></i> Prevention Tips</h4>
            <p>Practice crop rotation. Maintain proper spacing. Remove plant debris after harvest. Use disease-resistant varieties. Monitor regularly for early detection.</p>
        </div>
    `;
}

// ========== Market Insights ==========
const marketData = {
    rice: { price: 2450, weekAvg: 2380, monthAvg: 2320, change: 3.2, demand: 'High', history: [2200, 2280, 2350, 2300, 2380, 2420, 2450] },
    wheat: { price: 2275, weekAvg: 2250, monthAvg: 2200, change: 1.1, demand: 'Medium', history: [2100, 2150, 2180, 2200, 2220, 2260, 2275] },
    corn: { price: 1980, weekAvg: 1950, monthAvg: 1900, change: -0.5, demand: 'Medium', history: [1950, 1980, 2000, 1990, 1960, 1970, 1980] },
    cotton: { price: 6800, weekAvg: 6750, monthAvg: 6600, change: 2.4, demand: 'High', history: [6400, 6500, 6550, 6650, 6700, 6780, 6800] },
    sugarcane: { price: 350, weekAvg: 345, monthAvg: 340, change: 0.8, demand: 'Medium', history: [330, 335, 338, 342, 345, 348, 350] },
    tomato: { price: 3200, weekAvg: 2800, monthAvg: 2500, change: 8.5, demand: 'Very High', history: [2000, 2200, 2400, 2600, 2800, 3000, 3200] },
    potato: { price: 1200, weekAvg: 1180, monthAvg: 1150, change: -1.2, demand: 'Low', history: [1250, 1230, 1210, 1200, 1190, 1185, 1200] },
    onion: { price: 2800, weekAvg: 2600, monthAvg: 2400, change: 5.6, demand: 'High', history: [2100, 2250, 2400, 2500, 2600, 2700, 2800] },
    soybean: { price: 4500, weekAvg: 4450, monthAvg: 4380, change: 1.8, demand: 'Medium', history: [4200, 4280, 4320, 4380, 4420, 4460, 4500] }
};

const mandiData = [
    { mandi: 'Azadpur, Delhi', commodity: 'Rice', min: 2300, max: 2600, modal: 2450 },
    { mandi: 'Vashi, Mumbai', commodity: 'Onion', min: 2500, max: 3100, modal: 2800 },
    { mandi: 'Koyambedu, Chennai', commodity: 'Tomato', min: 2800, max: 3500, modal: 3200 },
    { mandi: 'Bowenpally, Hyderabad', commodity: 'Wheat', min: 2100, max: 2400, modal: 2275 },
    { mandi: 'Yeshwanthpur, Bangalore', commodity: 'Potato', min: 1050, max: 1350, modal: 1200 },
    { mandi: 'Gultekdi, Pune', commodity: 'Soybean', min: 4300, max: 4700, modal: 4500 },
];

let priceChart = null;

function initMarketInsights() {
    updateMarketDisplay('rice');
    renderMandiTable();

    document.getElementById('marketCommodity').addEventListener('change', e => {
        updateMarketDisplay(e.target.value);
    });
}

function updateMarketDisplay(commodity) {
    const data = marketData[commodity];
    if (!data) return;

    document.getElementById('currentPrice').textContent = `₹${data.price.toLocaleString()}`;
    document.getElementById('weekAvg').textContent = `₹${data.weekAvg.toLocaleString()}`;
    document.getElementById('monthAvg').textContent = `₹${data.monthAvg.toLocaleString()}`;

    const changeEl = document.getElementById('priceChange');
    changeEl.textContent = `${data.change > 0 ? '+' : ''}${data.change}%`;
    changeEl.className = `price-change ${data.change >= 0 ? 'positive' : 'negative'}`;

    const demandEl = document.getElementById('demandTrend');
    demandEl.innerHTML = `<i class="fas fa-arrow-${data.demand === 'Low' ? 'down' : 'up'}"></i> ${data.demand}`;

    renderPriceChart(commodity, data.history);
}

function renderPriceChart(commodity, history) {
    const ctx = document.getElementById('priceChart').getContext('2d');
    if (priceChart) priceChart.destroy();

    const labels = ['7d ago', '6d ago', '5d ago', '4d ago', '3d ago', '2d ago', 'Today'];
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: `${commodity.charAt(0).toUpperCase() + commodity.slice(1)} Price (₹/quintal)`,
                data: history,
                borderColor: '#2d7a3a',
                backgroundColor: 'rgba(45, 122, 58, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#2d7a3a'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: isDark ? '#b8ccaa' : '#4a5d3a' } }
            },
            scales: {
                x: { ticks: { color: isDark ? '#8a9e7a' : '#7a8c6a' }, grid: { color: isDark ? '#2a3e20' : '#dce8d0' } },
                y: { ticks: { color: isDark ? '#8a9e7a' : '#7a8c6a' }, grid: { color: isDark ? '#2a3e20' : '#dce8d0' } }
            }
        }
    });
}

function renderMandiTable() {
    document.getElementById('mandiTableBody').innerHTML = mandiData.map(row => `
        <tr>
            <td>${row.mandi}</td>
            <td>${row.commodity}</td>
            <td>₹${row.min.toLocaleString()}</td>
            <td>₹${row.max.toLocaleString()}</td>
            <td><strong>₹${row.modal.toLocaleString()}</strong></td>
        </tr>
    `).join('');
}

// ========== Community ==========
const samplePosts = [
    {
        avatar: '👨‍🌾', name: 'Rajesh Kumar', time: '2 hours ago', tag: 'tip', tagLabel: 'Tip',
        body: 'I switched to drip irrigation last season and saw a 30% reduction in water usage while maintaining the same yield. Highly recommend for areas with water scarcity!',
        likes: 24, comments: 8
    },
    {
        avatar: '👩‍🌾', name: 'Priya Sharma', time: '5 hours ago', tag: 'success', tagLabel: 'Success Story',
        body: 'Started organic farming 2 years ago on my 3-acre plot. This season, I got premium prices for my chemical-free tomatoes - almost 40% more than conventional ones at the local mandi!',
        likes: 56, comments: 15
    },
    {
        avatar: '🧑‍🌾', name: 'Arun Patel', time: '1 day ago', tag: 'question', tagLabel: 'Question',
        body: 'Has anyone tried using Jeevamrut for sugarcane? How often should it be applied, and what results did you see? Planning to try it this season.',
        likes: 12, comments: 22
    },
    {
        avatar: '👨‍🌾', name: 'Lakshmi Devi', time: '2 days ago', tag: 'organic', tagLabel: 'Organic',
        body: 'Made my own Panchagavya at home. Here\'s the recipe: mix cow dung, cow urine, milk, curd, ghee, jaggery, banana, tender coconut water. Ferment for 15 days. Amazing results on my vegetable garden!',
        likes: 89, comments: 31
    }
];

function initCommunity() {
    renderPosts(samplePosts);

    // Tag buttons
    document.querySelectorAll('.tag-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Submit post
    document.getElementById('submitPost').addEventListener('click', () => {
        const textarea = document.getElementById('communityPost');
        const text = textarea.value.trim();
        if (!text) return;

        const activeTag = document.querySelector('.tag-btn.active');
        const tag = activeTag ? activeTag.getAttribute('data-tag') : 'tip';
        const tagLabels = { tip: 'Tip', question: 'Question', success: 'Success Story', organic: 'Organic' };

        const newPost = {
            avatar: '👤', name: 'You', time: 'Just now', tag, tagLabel: tagLabels[tag],
            body: text, likes: 0, comments: 0
        };

        samplePosts.unshift(newPost);
        renderPosts(samplePosts);
        textarea.value = '';
    });
}

function renderPosts(posts) {
    document.getElementById('communityFeed').innerHTML = posts.map(post => `
        <div class="community-post">
            <div class="post-header">
                <span class="post-header-avatar">${post.avatar}</span>
                <div class="post-header-info">
                    <h4>${post.name}</h4>
                    <span>${post.time}</span>
                </div>
                <span class="post-tag-badge">${post.tagLabel}</span>
            </div>
            <div class="post-body">${post.body}</div>
            <div class="post-footer">
                <span class="post-action"><i class="far fa-heart"></i> ${post.likes}</span>
                <span class="post-action"><i class="far fa-comment"></i> ${post.comments}</span>
                <span class="post-action"><i class="fas fa-share"></i> Share</span>
            </div>
        </div>
    `).join('');
}

// ========== Dashboard Charts ==========
// ========== Map (Nearby Sellers) ==========
let map = null;
let markersLayer = null;

const sellerLocations = [
    { name: 'Organic Farm Fresh Co-op', type: 'Seller', lat: 28.6339, lng: 77.2195, distance: 3.2 },
    { name: 'Green Harvest Market', type: 'Seller', lat: 28.5955, lng: 77.1835, distance: 5.1 },
    { name: 'Natural Foods Buyer', type: 'Buyer', lat: 28.6472, lng: 77.2312, distance: 4.8 },
    { name: 'Farm Direct Purchase', type: 'Buyer', lat: 28.6105, lng: 77.2015, distance: 6.3 },
    { name: 'Organic Seeds & Supplies', type: 'Seller', lat: 28.6280, lng: 77.2450, distance: 7.1 },
    { name: 'Krishi Organic Store', type: 'Seller', lat: 28.5820, lng: 77.1950, distance: 8.5 },
];

function initMap() {
    const loadingEl = document.getElementById('sellersLoading');
    if (loadingEl) loadingEl.style.display = 'flex';

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            pos => {
                if (loadingEl) loadingEl.style.display = 'none';
                showMap(pos.coords.latitude, pos.coords.longitude);
            },
            () => {
                if (loadingEl) loadingEl.style.display = 'none';
                showMap(28.6139, 77.2090);
            }
        );
    } else {
        if (loadingEl) loadingEl.style.display = 'none';
        showMap(28.6139, 77.2090);
    }
}

function showMap(lat, lng) {
    const mapContainer = document.getElementById('map');

    if (!map) {
        map = L.map('map').setView([lat, lng], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
        markersLayer = L.layerGroup().addTo(map);
    } else {
        map.setView([lat, lng], 12);
        markersLayer.clearLayers();
    }

    // User marker
    L.marker([lat, lng]).addTo(markersLayer)
        .bindPopup('<strong>Your Location</strong>').openPopup();

    // Seller markers
    sellerLocations.forEach(loc => {
        const offsetLat = lat + (loc.lat - 28.6139);
        const offsetLng = lng + (loc.lng - 77.2090);
        const marker = L.marker([offsetLat, offsetLng]).addTo(markersLayer);
        marker.bindPopup(`<strong>${loc.name}</strong><br>Type: ${loc.type}<br>~${loc.distance} km away`);
    });

    // Sellers list
    document.getElementById('sellersResult').innerHTML = sellerLocations.map(loc => `
        <div class="seller-item">
            <div>
                <strong>${loc.name}</strong>
                <span style="font-size:0.75rem;color:var(--text-muted);margin-left:8px">${loc.type}</span>
            </div>
            <span style="font-size:0.813rem;color:var(--accent)">${loc.distance} km</span>
        </div>
    `).join('');

    // Fix map render issue
    setTimeout(() => map.invalidateSize(), 100);
}

// ========== Chatbot ==========
function initChatbot() {
    const icon = document.getElementById('chatbotIcon');
    const box = document.getElementById('chatbotBox');
    const closeBtn = document.getElementById('chatbotClose');
    const form = document.getElementById('chatbotForm');
    const input = document.getElementById('chatbotInput');
    const messages = document.getElementById('chatbotMessages');

    icon.addEventListener('click', () => {
        box.classList.toggle('visible');
        if (box.classList.contains('visible')) input.focus();
    });

    closeBtn.addEventListener('click', () => box.classList.remove('visible'));

    form.addEventListener('submit', e => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;

        // User message
        messages.innerHTML += `<div class="chat-message user"><p>${escapeHTML(text)}</p></div>`;
        input.value = '';
        messages.scrollTop = messages.scrollHeight;

        // Bot response
        setTimeout(() => {
            const response = generateBotResponse(text);
            messages.innerHTML += `<div class="chat-message bot"><p>${response}</p></div>`;
            messages.scrollTop = messages.scrollHeight;
        }, 600);
    });
}

function generateBotResponse(question) {
    const q = question.toLowerCase();

    if (q.includes('weather') || q.includes('rain') || q.includes('forecast') || q.includes('मौसम') || q.includes('बारिश')) {
        return 'Check the Weather section above for real-time forecasts. Based on current conditions, plan your irrigation and spraying activities accordingly. Avoid pesticide spraying if rain is expected within 24 hours.';
    }
    if (q.includes('crop') || q.includes('recommend') || q.includes('grow') || q.includes('plant') || q.includes('फसल') || q.includes('बोना')) {
        return 'For personalized crop recommendations, use our Crop Recommendation tool above. Select your soil type, irrigation status, and farm area. The system considers current season and weather to suggest the best crops for you.';
    }
    if (q.includes('fertilizer') || q.includes('manure') || q.includes('npk') || q.includes('खाद') || q.includes('उर्वरक')) {
        return 'Use the Fertilizer Optimizer section to get specific recommendations. For organic farming, consider Vermicompost (2-3 tons/acre), Jeevamrut (200L/acre monthly), and Panchagavya (3% foliar spray). Always test your soil before applying fertilizers.';
    }
    if (q.includes('pest') || q.includes('disease') || q.includes('insect') || q.includes('bug') || q.includes('कीट') || q.includes('रोग')) {
        return 'Upload a photo in the Pest Detection section for AI analysis. Common prevention tips: practice crop rotation, maintain proper spacing, remove plant debris, use disease-resistant varieties, and monitor regularly for early detection.';
    }
    if (q.includes('price') || q.includes('market') || q.includes('sell') || q.includes('mandi') || q.includes('बाज़ार') || q.includes('मंडी')) {
        return 'Check the Market Insights section for live pricing. Current market trends show rising demand for organic produce. Consider selling at local mandis or directly to organic food stores for better prices.';
    }
    if (q.includes('organic') || q.includes('natural') || q.includes('जैविक') || q.includes('सेंद्रिय')) {
        return 'Organic farming starts with healthy soil. Key practices: use compost and green manure, practice crop rotation, encourage beneficial insects, use neem-based pest control, and maintain biodiversity. Certification takes 2-3 years of transition.';
    }
    if (q.includes('water') || q.includes('irrigation') || q.includes('सिंचाई') || q.includes('पानी')) {
        return 'Drip irrigation can save 30-60% water compared to flood irrigation. Mulching reduces evaporation by 25%. Water early morning or late evening. Consider rainwater harvesting for supplemental irrigation.';
    }
    if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('नमस्ते') || q.includes('नमस्कार')) {
        return 'Hello! How can I help you today? You can ask me about crops, weather, fertilizers, pest control, market prices, organic farming, or any other agriculture topic.';
    }
    if (q.includes('government') || q.includes('scheme') || q.includes('subsidy') || q.includes('सरकारी') || q.includes('योजना')) {
        return 'Key government schemes for farmers: PM-KISAN (₹6000/year), PM Fasal Bima Yojana (crop insurance), Soil Health Card Scheme, e-NAM (online trading), and Paramparagat Krishi Vikas Yojana (organic farming support). Visit your local agriculture office for more details.';
    }

    return 'That\'s a great question! While I can help with weather, crop recommendations, fertilizers, pest control, market prices, organic farming, irrigation, and government schemes - for this specific query, I recommend consulting with your local agriculture extension officer for personalized advice.';
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ========== Hero Search ==========
function initHeroSearch() {
    const input = document.querySelector('.hero-search-input');
    const btn = document.querySelector('.hero-search-btn');
    if (!input || !btn) return;

    const sectionMap = {
        weather: '#weather', rain: '#weather', forecast: '#weather', मौसम: '#weather',
        crop: '#crops', grow: '#crops', plant: '#crops', seed: '#crops', फसल: '#crops',
        fertilizer: '#fertilizer', npk: '#fertilizer', manure: '#fertilizer', खाद: '#fertilizer',
        pest: '#pest', disease: '#pest', insect: '#pest', bug: '#pest', कीट: '#pest',
        market: '#market', price: '#market', mandi: '#market', sell: '#market', बाज़ार: '#market',
        community: '#community', forum: '#community', farmer: '#community',
        seller: '#sellers', buyer: '#sellers', nearby: '#sellers', shop: '#sellers'
    };

    function doSearch() {
        const q = input.value.trim().toLowerCase();
        if (!q) return;
        for (const [keyword, target] of Object.entries(sectionMap)) {
            if (q.includes(keyword)) {
                document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
                return;
            }
        }
        document.querySelector('#crops')?.scrollIntoView({ behavior: 'smooth' });
    }

    btn.addEventListener('click', doSearch);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
}

// ========== Scroll Animations ==========
function initScrollAnimations() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.feature-card, .section-header, .crop-interface, .fertilizer-interface, .pest-interface, .market-dashboard, .community-interface, .sellers-result, .map-container').forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}
