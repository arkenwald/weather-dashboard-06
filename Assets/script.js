// user search history in an array
let searchHistory = []
let lastSearched = ""

// api call
let getWeather = function (city) {
    // formatting the api url
    let apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=8349e891f22a87cc5ab4dd7f92ef435c&units=metric";

    // url request
    fetch(apiUrl)

        .then(function (response) {
            // request successful
            if (response.ok) {
                response.json().then(function (data) {
                    displayWeather(data);
                });
                // request failed/error
            } else {
                alert("Error: " + response.statusText);
            }
        })

        // alerts user of no response
        .catch(function (error) {
            alert("Cannot connect to OpenWeather");
        })
};

// search form submit function
let submitSearch = function (event) {
    event.preventDefault();

    // input element value
    let cityName = $("#cityname").val().trim();

    // check if search field has a value
    if (cityName) {
        // passing value to getWeather function
        getWeather(cityName);

        // clearing search input
        $("#cityname").val("");
    } else {
        // blank input alerts user
        alert("Please type in the city name");
    }
};

// function to display data from api
let displayWeather = function (weatherData) {

    // display and format of values
    $("#city-name").text(weatherData.name + " (" + dayjs(weatherData.dt * 1000).format("MM/DD/YYYY") + ") ").append(`<img src="https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png"></img>`);
    $("#city-temp").text("Temperature: " + weatherData.main.temp.toFixed(0) + "°C");
    $("#city-humid").text("Humidity: " + weatherData.main.humidity + "%");
    $("#city-wind").text("Wind Speed: " + weatherData.wind.speed.toFixed(0) + " kmh");

    // uv api call with longitude and latitude
    fetch("https://api.openweathermap.org/data/2.5/uvi?lat=" + weatherData.coord.lat + "&lon=" + weatherData.coord.lon + "&appid=8349e891f22a87cc5ab4dd7f92ef435c")
        .then(function (response) {
            response.json().then(function (data) {

                // displays uv value
                $("#uv-box").text(data.value);

                // EPA's UV Index Scale colors highlights
                if (data.value >= 11) {
                    $("#uv-box").css("background-color", "#6c49cb")
                } else if (data.value < 11 && data.value >= 8) {
                    $("#uv-box").css("background-color", "#d90011")
                } else if (data.value < 8 && data.value >= 6) {
                    $("#uv-box").css("background-color", "#f95901")
                } else if (data.value < 6 && data.value >= 3) {
                    $("#uv-box").css("background-color", "#f7e401")
                } else {
                    $("#uv-box").css("background-color", "#299501")
                }
            })
        });

    // five-day api call
    fetch("https://api.openweathermap.org/data/2.5/forecast?q=" + weatherData.name + "&appid=8349e891f22a87cc5ab4dd7f92ef435c&units=metric")
        .then(function (response) {
            response.json().then(function (data) {

                // clear any previous entries in the five day forecast
                $("#five-day").empty();

                // get every 24hour value (8th) in the returned array received from api call
                for (i = 7; i <= data.list.length; i += 8) {

                    // insert data into five day forecast card template
                    let fiveDayCard = `
                    <div class="col-md-2 m-2 py-3 card text-white bg-secondary">
                        <div class="card-body p-1">
                            <h5 class="card-title">` + dayjs(data.list[i].dt * 1000).format("MM/DD/YYYY") + `</h5>
                            <img src="https://openweathermap.org/img/wn/` + data.list[i].weather[0].icon + `.png" alt="rain">
                            <p class="card-text">Temp: ` + data.list[i].main.temp.toFixed(0) + `°C</p>
                            <p class="card-text">Humidity: ` + data.list[i].main.humidity + ` % </p>
                        </div>
                    </div>
                    `;

                    // appending date to the five-day forecast
                    $("#five-day").append(fiveDayCard);
                }
            })
        });

    // last city searched
    lastSearched = weatherData.name;

    // search history is saved
    saveSearchHistory(weatherData.name);
};

// function to save to localStorage
let saveSearchHistory = function (city) {
    if (!searchHistory.includes(city)) {
        searchHistory.push(city);
        $("#search-history").append("<a href='#' class='list-group-item list-group-item-action' id='" + city + "'>" + city + "</a>")
    }

    // saving searchHistory array to localStorage
    localStorage.setItem("weatherSearchHistory", JSON.stringify(searchHistory));

    // saveing lastSearched to localStorage
    localStorage.setItem("lastSearched", JSON.stringify(lastSearched));

    // displaying searchHistory array
    loadSearchHistory();
};

// function to load from localStorage (saved search history)
let loadSearchHistory = function () {
    searchHistory = JSON.parse(localStorage.getItem("weatherSearchHistory"));
    lastSearched = JSON.parse(localStorage.getItem("lastSearched"));

    // if localStorage is empty, creates empty array and empty string (searchHistory and lastSearched)
    if (!searchHistory) {
        searchHistory = []
    }

    if (!lastSearched) {
        lastSearched = ""
    }

    // emptying previous values from the search-history ul
    $("#search-history").empty();

    // for loop to run every city found in array
    for (i = 0; i < searchHistory.length; i++) {

        // adding city as link, setting an id, and appending it to the search-history ul
        $("#search-history").append("<a href='#' class='list-group-item list-group-item-action' id='" + searchHistory[i] + "'>" + searchHistory[i] + "</a>");
    }
};

// loads search history from localStorage
loadSearchHistory();

// loads page with last searched city info
if (lastSearched != "") {
    getWeather(lastSearched);
}

// event handlers
$("#input-form").submit(submitSearch);
$("#search-history").on("click", function (event) {
    // getting id value of links
    let prevCity = $(event.target).closest("a").attr("id");
    // passing id value to the getWeather function
    getWeather(prevCity);
});