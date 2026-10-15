const API_KEY = "de6428b130610fbf66e457feb671fdae";

let currentCity = "";
let timer;
// 1. Get Current Weather
async function getWeather(city) {

    const url =
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("City not found");
    }

    const data = await response.json();

    return {
        city: data.name,
        temp: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,

    };
}

// Get 5-Day Forecast
async function getForecast(city) {

    const url =
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Forecast not found");
    }

    const data = await response.json();

    return data;
}

// 2. Add Favorite
function addFavorite(city) {

    let favorites =
        JSON.parse(localStorage.getItem("favorites")) || [];

    if (!favorites.includes(city)) {

        favorites.push(city);

        localStorage.setItem(
            "favorites",
            JSON.stringify(favorites)
        );
    }

    loadFavorites();
}


// Remove Favorite
function removeFavorite(city) {

    let favorites =
        JSON.parse(localStorage.getItem("favorites")) || [];

    favorites = favorites.filter(function(item) {
        return item !== city;
    });

    localStorage.setItem(
        "favorites",
        JSON.stringify(favorites)
    );

    loadFavorites();

    if (currentCity === city) {

        document.getElementById("favoriteBtn").innerText =
            "⭐ Add to Favorites";
    }
}


// 3. Load Favorites
function loadFavorites() {

    let list =
        document.getElementById("favoritesList");

    list.innerHTML = "";

    let favorites =
        JSON.parse(localStorage.getItem("favorites")) || [];

    favorites.forEach(function(city) {

        let div = document.createElement("div");

        div.className = "favorite-city";

        div.innerHTML = `
            <span>${city}</span>
            <button>❌</button>
        `;

        div.querySelector("span").onclick =
            function() {
                searchWeather(city);
            };

        div.querySelector("button").onclick =
            function() {
                removeFavorite(city);
            };

        list.appendChild(div);
    });
}


// 4. Search Weather
async function searchWeather(city) {

    if (city === "") {

        document.getElementById("errorMsg").innerText =
            "Please enter a city name";

        return;
    }

    try {

        document.getElementById("loading").style.display =
            "block";

        document.getElementById("errorMsg").innerText = "";


        // Current weather
        let weather = await getWeather(city);

        currentCity = weather.city;


        // Display current weather
        document.getElementById("weatherCard").style.display =
            "block";

        document.getElementById("cityName").innerText =
            weather.city;

        document.getElementById("temperature").innerText =
            weather.temp + "°C";

        document.getElementById("description").innerText =
            weather.description;

        document.getElementById("humidity").innerText =
            weather.humidity;

        document.getElementById("wind").innerText =
            weather.windSpeed;



        // Check favorite
        let favorites =
            JSON.parse(localStorage.getItem("favorites")) || [];

        if (favorites.includes(weather.city)) {

            document.getElementById("favoriteBtn").innerText =
                "⭐ Remove Favorite";

        } else {

            document.getElementById("favoriteBtn").innerText =
                "⭐ Add to Favorites";
        }
        // 5-day forecast
        let forecastData =
            await getForecast(city);
        showForecast(forecastData);
    }
    catch (error) {

        document.getElementById("weatherCard").style.display =
            "none";

        document.getElementById("forecast").innerHTML = "";

        document.getElementById("errorMsg").innerText =
            "City not found. Please try again.";
    }
    finally {

        document.getElementById("loading").style.display =
            "none";
    }
}
// Show Forecast
function showForecast(data) {

    let forecast = document.getElementById("forecast");

    forecast.innerHTML = "";

    let days = [];
    let count = 0;

    for (let i = 0; i < data.list.length; i++) {

        let item = data.list[i];

        let date = item.dt_txt.substring(0, 10);

        if (!days.includes(date)) {

            days.push(date);

            let newDate = new Date(item.dt_txt);

            let dateText = newDate.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            });

            let card = document.createElement("div");

            card.className = "forecast-card";

            card.innerHTML = `
                <h3>${dateText}</h3>

                <h3>${Math.round(item.main.temp)}°C</h3>

                <p>${item.weather[0].description}</p>
            `;

            forecast.appendChild(card);

            count++;

            if (count === 5) {
                break;
            }
        }
    }
}

// 5. Debounced Search
function debounceSearch() {

    clearTimeout(timer);

    timer = setTimeout(function() {

        let city =
            document.getElementById("cityInput").value.trim();

        if (city !== "") {

            searchWeather(city);
        }

    }, 500);
}


// 6. Event Listeners
document.addEventListener("DOMContentLoaded", function() {

    // Load saved favorites
    loadFavorites();

    // Hide weather card at beginning
    document.getElementById("weatherCard").style.display =
        "none";


    // Search button
    document.getElementById("searchBtn").onclick =
        function() {

            let city =
                document.getElementById("cityInput").value.trim();

            searchWeather(city);
        };


    // Debounced search
    document.getElementById("cityInput").oninput =
        function() {

            debounceSearch();
        };


    // Favorite button
    document.getElementById("favoriteBtn").onclick =
        function() {

            if (currentCity === "") {
                return;
            }

            let favorites =
                JSON.parse(localStorage.getItem("favorites")) || [];


            if (favorites.includes(currentCity)) {

                removeFavorite(currentCity);

            } else {

                addFavorite(currentCity);

                document.getElementById("favoriteBtn").innerText =
                    "⭐ Remove Favorite";
            }
        };


    // Dark / Light mode
    document.getElementById("themeBtn").onclick =
        function() {

            document.body.classList.toggle("dark");

            if (
                document.body.classList.contains("dark")
            ) {

                document.getElementById("themeBtn").innerText =
                    "☀️";

            } else {

                document.getElementById("themeBtn").innerText =
                    "🌙";
            }
        };

});