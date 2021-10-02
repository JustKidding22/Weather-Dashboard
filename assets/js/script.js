// Defining Global Variables
var searchButton = document.getElementById("searchButton");
var temp = document.getElementById("temp");
var windSpeed = document.getElementById("windSpeed");
var humidity = document.getElementById("humidity");
var uvIndex = document.getElementById("uvIndex");
var currentCity = document.getElementById("currentCity");
var cityArray = JSON.parse(localStorage.getItem("cities")) || [];

//API KEY
const API_KEY = "c1794384b97a2c0ebbc7c95f679ac6b3";

var currentTime = new Date();

function start() {
  recentSearchHistory();
  //Default City name
  cityName = "Los Angeles";
  // use OpenWeather current API to get the latitude & longitude of the city
  var apiUrl =
    "http://api.openweathermap.org/data/2.5/weather?q=" +
    cityName +
    "&appid=" +
    API_KEY +
    "&units=imperial";

  var lat;
  var lon;

  fetch(apiUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (res) {
      lat = res.coord.lat;
      lon = res.coord.lon;
      console.log(res);
      getData(lat, lon, cityName);
    });
}

function init() {
  start();
  // add click event listener to search button
  searchButton.addEventListener("click", function () {
    // get weather data on click of search button
    getLatLon();
    recentSearchHistory();
  });
}

function recentSearchHistory() {
  // get reference to ul using id name & assign it to a variable
  var recentSearchUl = document.querySelector("#recentSearches");
  $("#recentSearches").children("button").remove();
  // for loop to iterate through cityArray
  for (var i = 0; i < cityArray.length; i++) {
    // create <li> element using document.createElement & assign it to a variable
    var recentSearchLi = document.createElement("button");
    recentSearchLi.setAttribute(
      "class",
      "list-group-item btn recSearchBtn name-city"
    );
    recentSearchLi.setAttribute("id", "recCityName");
    recentSearchLi.setAttribute("type", "button");
    recentSearchLi.setAttribute("value", cityArray[i]);
    recentSearchLi.innerHTML = cityArray[i];
    recentSearchUl.appendChild(recentSearchLi);
  }
}

function searchSavedCity(event) {
  // retrieve the name of the city that was entered in the input field
  var cityName = event.target.value;
  getLatLon(cityName);
}

// Function to get the longitude and Latitude of the input city
function getLatLon(cityName = null) {
  // Get input city name
  if (cityName == null) {
    var cityName = document.querySelector("#cityName").value;
  }

  //Updating the Array in local Storage to include new city in history
  updateCityArray(cityName);

  // Getting the langitute and Latitude of the city From Weather API by giving city name
  var apiUrl =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    cityName +
    "&appid=" +
    API_KEY +
    "&units=imperial";
  var lat;
  var lon;

  // Sending GET request, receiving json response and extracting longitude and latitude from the json response
  fetch(apiUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (res) {
      lat = res.coord.lat;
      lon = res.coord.lon;
      //Getting actual Weather Data by giving Longitute and Latitude
      getData(lat, lon, cityName);
    });
}

// This function gets the Weather data from API and populates the page with the obtained data
function getData(lat, lon, city) {
  var apiUrl =
    "https://api.openweathermap.org/data/2.5/onecall?lat=" +
    lat +
    "&lon=" +
    lon +
    "&appid=" +
    API_KEY +
    "&units=imperial";

  // Sending GET request, receiving json response and extracting weather data from the json response
  fetch(apiUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log(data);
      var tempValue = data.current.temp;
      var windValue = data.current.wind_speed;
      var humidityValue = data.current.humidity;
      var uviValue = data.current.uvi;
      var apiIconCurrent = data.current.weather[0].icon;

      var apiIcon, tempVal, windVal, humidVal, dateVal, dailyData;
      for (var i = 0; i < 5; i++) {
        dailyData = data.daily[i];
        apiIcon = dailyData.weather[0].icon;
        tempVal = dailyData.temp.max;
        windVal = dailyData.wind_speed;
        humidVal = dailyData.humidity;
        dateVal = epochToGMT(dailyData.dt);
        document.querySelector("#tempDay" + (i + 1)).innerHTML =
          "Temp: " + tempVal + " &#8457";
        document.querySelector("#windDay" + (i + 1)).innerHTML =
          "Wind Speed: " + windVal + " MPH";
        document.querySelector("#humidityDay" + (i + 1)).innerHTML =
          "Humidity: " + humidVal + "%";
        document.querySelector("#iconDay" + (i + 1)).src =
          "https://openweathermap.org/img/wn/" + apiIcon + "@2x.png";
        document.querySelector("#day" + (i + 1)).innerHTML = dateVal;
      }
      if (uviValue < 5) {
        uvIndex.classList.add("btn-success");
        uvIndex.classList.remove("btn-danger", "btn-warning");
      } else if (uviValue > 4 && uviValue < 8) {
        uvIndex.classList.add("btn-warning");
        uvIndex.classList.remove("btn-success", "btn-danger");
      } else if (uviValue > 7) {
        uvIndex.classList.add("btn-danger");
        uvIndex.classList.remove("btn-success", "btn-warning");
      }

      document.querySelector("#currentDate").innerHTML =
        " (" + epochToGMT(data.current.dt) + ")";
      currentCity.innerHTML = city;
      temp.innerHTML = "Temp: " + tempValue + " &#8457";
      windSpeed.innerHTML = "Wind Speed: " + windValue + " MPH";
      humidity.innerHTML = "Humidity: " + humidityValue + "%";
      uvIndex.innerHTML = uviValue;
      document.querySelector("#icon").src =
        "https://openweathermap.org/img/wn/" + apiIconCurrent + "@2x.png";
    });
}

function epochToGMT(unixTime) {
  var utcSeconds = unixTime;
  var d = new Date(0);
  d.setUTCSeconds(utcSeconds);
  return d.toLocaleString().split(",")[0];
}

function updateCityArray(cityName) {
  // Adding cityName to cityArray only if it is not already in the array.
  const newcity = (city) => city.toLowerCase() === cityName.toLowerCase();
  if (!cityArray.some(newcity)) {
    cityArray.unshift(cityName);
  }
  //Remove the old items
  if (cityArray.length > 10) {
    cityArray.pop();
  }
  // save cityArray to local storage
  localStorage.setItem("cities", JSON.stringify(cityArray));
}

init();
$(document.body).on("click", ".name-city", searchSavedCity);
