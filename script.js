// API
var weatherAPIURL = 'https://api.openweathermap.org';
var weatherAPIKey ='13bab808fc47bc498deaca08fecae7a8';
var searchHistory = [];

var searchHistoryContainer = document.querySelector('#search-history');
var searchForm = document.querySelector('#search-form');
var searchInput = document.querySelector('#search-input');
var todayContainer = document.querySelector('#today');
var forecastContainer = document.querySelector('#forecast');

function showSearchHistory() {
    searchHistoryContainer.innerHTML = '';

    for (var i = searchHistory.length -1; i>=0; i--) {
        var btn = document.createElement('button');
        btn.setAttribute('type', 'button');
        btn.setAttribute('data-search', searchHistory[i]);
        btn.textContent = searchHistory[i];
        searchHistoryContainer.append(btn);
    }
}

function appendHistory(search) {
    if (searchHistory.indexOf(search) !== -1) {
        return;
    }
    searchHistory.push(search);
    localStorage.setItem('search-history', JSON.stringify(searchHistory));
    showSearchHistory();
}

function getSearchHistory() {
    var localStorageHistory = localStorage.getItem('search-history');
    if (localStorageHistory) {
        searchHistory = JSON.parse(localStorageHistory);
    }
    showSearchHistory();
}

function renderCurrentWeather(city, weather) {
    var date = dayjs().format('M/D/YYYY');
    var tempF = weather.main.temp;
    var windMph = weather.wind.speed;
    var humidity = weather.main.humidity;
    var card = document.createElement('div');
    var cardBody = document.createElement('div');
    var heading = document.createElement('h2');
    var tempEl = document.createElement('p');
    var windEl = document.createElement('p');
    var humidityEl = document.createElement('p');
  
    card.setAttribute('class', 'card');
    cardBody.setAttribute('class', 'card-body');
    card.append(cardBody);
  
    heading.setAttribute('class', 'h3 card-title');
    tempEl.setAttribute('class', 'card-text');
    windEl.setAttribute('class', 'card-text');
    humidityEl.setAttribute('class', 'card-text');
  
    heading.textContent = `${city} (${date})`;
    tempEl.textContent = `Temp: ${tempF}°F`;
    windEl.textContent = `Wind: ${windMph} MPH`;
    humidityEl.textContent = `Humidity: ${humidity} %`;
    cardBody.append(heading, tempEl, windEl, humidityEl);
  
    todayContainer.innerHTML = '';
    todayContainer.append(card);
}
  
function renderForecastCard(forecast) {
    var iconDescription = forecast.weather[0].description;
    var tempF = forecast.main.temp;
    var humidity = forecast.main.humidity;
    var windMph = forecast.wind.speed;
  
    var col = document.createElement('div');
    var card = document.createElement('div');
    var cardBody = document.createElement('div');
    var cardTitle = document.createElement('h5');
    var tempEl = document.createElement('p');
    var windEl = document.createElement('p');
    var humidityEl = document.createElement('p');
  
    col.append(card);
    card.append(cardBody);
    cardBody.append(cardTitle, tempEl, windEl, humidityEl);
  
    col.setAttribute('class', 'col-md');
    col.classList.add('five-day-card');
    card.setAttribute('class', 'card bg-primary');
    cardBody.setAttribute('class', 'card-body p-2');
    cardTitle.setAttribute('class', 'card-title');
    tempEl.setAttribute('class', 'card-text');
    windEl.setAttribute('class', 'card-text');
    humidityEl.setAttribute('class', 'card-text');
  
    cardTitle.textContent = dayjs(forecast.dt_txt).format('M/D/YYYY');
    tempEl.textContent = `Temp: ${tempF} °F`;
    windEl.textContent = `Wind: ${windMph} MPH`;
    humidityEl.textContent = `Humidity: ${humidity} %`;
  
    forecastContainer.append(col);
}
  
function renderForecast(dailyForecast) {
    var startDt = dayjs().add(1, 'day').startOf('day').unix();
    var endDt = dayjs().add(6, 'day').startOf('day').unix();
  
    var headingCol = document.createElement('div');
    var heading = document.createElement('h4');
  
    headingCol.setAttribute('class', 'col-12');
    heading.textContent = '5-Day Forecast:';
    headingCol.append(heading);
  
    forecastContainer.innerHTML = '';
    forecastContainer.append(headingCol);
  
    for (var i = 0; i < dailyForecast.length; i++) {
  
      if (dailyForecast[i].dt >= startDt && dailyForecast[i].dt < endDt) {
  
        if (dailyForecast[i].dt_txt.slice(11, 13) == "12") {
          renderForecastCard(dailyForecast[i]);
        }
      }
    }
}
  
function renderItems(city, data) {
    renderCurrentWeather(city, data.list[0], data.city.timezone);
    renderForecast(data.list);
}
  
function fetchWeather(location) {
    var { lat } = location;
    var { lon } = location;
    var city = location.name;
  
    var apiUrl = `${weatherAPIURL}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${weatherAPIKey}`;
  
    fetch(apiUrl)
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        renderItems(city, data);
      })
      .catch(function (err) {
        console.error(err);
      });
}
  
function fetchCoords(search) {
    var apiUrl = `${weatherAPIURL}/geo/1.0/direct?q=${search}&limit=5&appid=${weatherAPIKey}`;
  
    fetch(apiUrl)
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        if (!data[0]) {
          alert('search again, location not found');
        } else {
          appendHistory(search);
          fetchWeather(data[0]);
        }
      })
      .catch(function (err) {
        console.error(err);
      });
}
  
function handleSearchFormSubmit(e) {
    if (!searchInput.value) {
      return;
    }
  
    e.preventDefault();
    var search = searchInput.value.trim();
    fetchCoords(search);
    searchInput.value = '';
}
  
function handleSearchHistoryClick(e) {
    if (!e.target.matches('.btn-history')) {
      return;
    }
  
    var btn = e.target;
    var search = btn.getAttribute('data-search');
    fetchCoords(search);
}

function getWeather(location) {
    var {lat} = location;
    var {lon} = location;
    var city = location.name;
    var api = `${weatherAPIURL}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${weatherAPIKey}`;

    fetch(api)
        .then(function (res) {
            return res.json();
        })
        .then(function (data) {
            renderItems(city, data);
        });
}

getSearchHistory();
searchForm.addEventListener('submit', handleSearchFormSubmit);
searchHistoryContainer.addEventListener('click', handleSearchHistoryClick);