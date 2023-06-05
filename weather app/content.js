
const locationFormInput = document.getElementById('weather-location');
const debouncedSearch = debounce(searchLocations, 300);


locationFormInput.addEventListener('focus', showSearchResults);
locationFormInput.addEventListener('input', showSearchResults);
locationFormInput.addEventListener('blur', hideSearchResults);

function debounce(func, delay) {
 
  let timeoutId;


  return function (...args) {
 
    if (timeoutId) {
      clearTimeout(timeoutId);
    }


    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}


function hideSearchResults() {
  const locationResults = document.getElementById('location-results');
  locationResults.className = 'hidden';
}

function showSearchResults() {
  const locationResults = document.getElementById('location-results');
  locationResults.className = 'visible';
  debouncedSearch(locationFormInput.value);
}


async function searchLocations(location) {
  if (location) {
    const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${location}&count=5`;

    try {
      const geocodingResponse = await fetch(geocodingUrl);
      if (!geocodingResponse.ok) {
        throw new Error(`HTTP error! Status: ${geocodingResponse.status}`);
      } else {
        const geocodingData = await geocodingResponse.json();
        if (geocodingData.results) {
          displayLocationResults(geocodingData.results);
        } else {
          displayNoLocationsFound();
        }
      }
    } catch (error) {
      console.log(`Error: ${error}`);
    }
  }
}


function displayNoLocationsFound() {
  const locationResults = document.getElementById('location-results');
  locationResults.innerHTML = '';
  const noLocation = document.createElement('li');
  noLocation.classList.add('no-location');
  noLocation.innerHTML = `<p>No locations found!</p>`;
  locationResults.appendChild(noLocation);
}

function displayLocationResults(locations) {
  const locationResults = document.getElementById('location-results');
  locationResults.innerHTML = '';


  locations.forEach((location) => {
    const locationLi = document.createElement('li');
    locationLi.classList.add('location');
    locationLi.dataset.id = location.id;


    const locationString = location.admin1
      ? `${location.name} <span>${location.admin1}, ${location.country}</span>`
      : `${location.name} ${location.country}</span>`;

    locationLi.innerHTML = `<p>${locationString}</p>`;

    locationResults.appendChild(locationLi);
  });


  const locationLis = document.querySelectorAll('.location');
  locationLis.forEach((locationLi) => {
   
    locationLi.addEventListener('mousedown', () => {
      handleLocationClick(locations, Number(locationLi.dataset.id));
    });
  });
}


function handleLocationClick(locations, locationId) {
  const location = locations.find((location) => location.id === locationId);
  console.log(location);
  const locationResults = document.getElementById('location-results');
  locationResults.innerHTML = '';
  getWeatherData(location);
}

async function getWeatherData({ name, admin1, country, latitude, longitude }) {

  const locationString = admin1 ? `${name}, ${admin1}, ${country}` : `${name}, ${country}`;

  
  const hourlyVars = ['precipitation_probability', 'surface_pressure'].join(',');
  const dailyVars = ['temperature_2m_min', 'temperature_2m_max', 'uv_index_max'].join(',');


  const weatherApiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto&hourly=${hourlyVars}&daily=${dailyVars}`;


  try {
    const weatherResponse = await fetch(weatherApiUrl);
    if (!weatherResponse.ok) {
      throw new Error(`HTTP error! Status: ${weatherResponse.status}`);
    } else {
      const weatherData = await weatherResponse.json();
      displayWeatherData(
        locationString,
        weatherData.current_weather,
        weatherData.hourly,
        weatherData.daily
      );
    }
  } catch (error) {
    console.log(`Error: ${error}`);
  }
}

function displayWeatherData(locationString, currentWeather, hourly, daily) {

  const { temperature, time, windspeed, weathercode } = currentWeather;
  const { precipitation_probability, surface_pressure } = hourly;
  const { temperature_2m_min, temperature_2m_max, uv_index_max } = daily;


  animateWeatherGrid();
  animateWeatherData();

  document.getElementById('today-location').innerHTML = locationString;
  document.getElementById('today-time').textContent = formatDate(time);
  document.getElementById('today-temp').innerHTML = `${temperature}&deg;`;
  document.getElementById('today-min').innerHTML = `${temperature_2m_min[0]}&deg;`;
  document.getElementById('today-max').innerHTML = `${temperature_2m_max[0]}&deg;`;

  const weatherCondition = getWeatherCondition(weathercode);
  document.getElementById('today-conditions').textContent = weatherCondition;
  document.getElementById('today-wind').textContent = `${windspeed} MPH`;
  document.getElementById('today-rain').textContent = `${precipitation_probability[0]}%`;
  document.getElementById('today-pressure').textContent = `${surface_pressure[0]} hPa`;
  document.getElementById('today-uv').textContent = uv_index_max[0];

  document.querySelector(
    '.weather-grid__weather'
  ).style.backgroundImage = `url(./img/${weatherCondition.toLowerCase()}.jpg))`;
}


function animateWeatherGrid() {
  const weatherGrid = document.querySelector('.weather-grid');
  weatherGrid.style.maxHeight = '1000px';
  weatherGrid.style.marginTop = '16px';
}


function animateWeatherData() {

  const weather = document.querySelector('.weather-grid__weather');
  const wind = document.querySelector('.weather-grid__wind');
  const rain = document.querySelector('.weather-grid__rain');
  const pressure = document.querySelector('.weather-grid__pressure');
  const uvIndex = document.querySelector('.weather-grid__uv-index');

  const WEATHER_DELAY = 100;
  const WIND_DELAY = 100;
  const RAIN_DELAY = 100;
  const PRESSURE_DELAY = 100;
  const UV_INDEX_DELAY = 100;


  setTimeout(() => {
    weather.classList.remove('weather-card--hidden');
  }, WEATHER_DELAY);

  setTimeout(() => {
    wind.classList.remove('weather-card--hidden');
  }, WIND_DELAY);

  setTimeout(() => {
    rain.classList.remove('weather-card--hidden');
  }, RAIN_DELAY);

  setTimeout(() => {
    pressure.classList.remove('weather-card--hidden');
  }, PRESSURE_DELAY);

  setTimeout(() => {
    uvIndex.classList.remove('weather-card--hidden');
  }, UV_INDEX_DELAY);
}

function formatDate(dateString) {
  const date = new Date(dateString);

  let hours = date.getHours();
  let minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';

 
  hours = hours % 12;
  hours = hours ? hours : 12;

  minutes = minutes < 10 ? '0' + minutes : minutes;

  
}


function getWeatherCondition(weatherCode) {
  let condition = '';

  if ([0].includes(weatherCode)) {
    condition = 'Clear';
  } else if ([1, 2, 3].includes(weatherCode)) {
    condition = 'Cloudy';
  } else if ([45, 48].includes(weatherCode)) {
    condition = 'Fog';
  } else if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67].includes(weatherCode)) {
    condition = 'Rain';
  } else if ([71, 73, 75, 77, 80, 81, 82, 85, 86].includes(weatherCode)) {
    condition = 'Snow';
  } else if ([95, 96, 99].includes(weatherCode)) {
    condition = 'Thunderstorm';
  } else {
    condition = 'Unknown';
  }

  return condition;
}