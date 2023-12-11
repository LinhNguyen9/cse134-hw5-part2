class WeatherWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.build();
    this.fetchWeatherData();
  }

  build() {
    const style = document.createElement('style');
    const weatherContainer = document.createElement('div');
    weatherContainer.setAttribute('id', 'weather-container');

    style.textContent = `
      #weather-container {
        font-family: Arial, sans-serif;
        background-color: #f9f9f9;
        padding: 10px;
        border-radius: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
      }
      .temp {
        font-size: 2em;
        font-weight: bold;
      }
      .condition {
        font-size: 1em;
      }
      .icon {
        width: 50px;
        height: 50px;
      }
      .unavailable {
        color: red;
        font-weight: bold;
      }
    `;

    const noscript = document.createElement('noscript');
    const noscriptMessage = document.createElement('div');
    noscriptMessage.textContent = "Current Weather Conditions Unavailable";
    noscriptMessage.classList.add('unavailable');
    noscript.appendChild(noscriptMessage);

    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(weatherContainer);
    this.shadowRoot.appendChild(noscript);
  }

  fetchWeatherData() {
    const weatherContainer = this.shadowRoot.querySelector('#weather-container');
    // Latitude and longitude for UCSD
    const lat = '32.8801';
    const lon = '-117.2340';
    const endpoint = `https://api.weather.gov/points/${lat},${lon}`;

    fetch(endpoint)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        const forecastUrl = data.properties.forecast;
        return fetch(forecastUrl);
      })
      .then(response => response.json())
      .then(forecastData => {
        console.log(forecastData);
        const currentConditions = forecastData.properties.periods[0];
        let temp = currentConditions.temperature;
        let tempUnit = currentConditions.temperatureUnit;
        let weatherStatus = currentConditions.shortForecast;
        this.displayWeather(currentConditions);
        console.log(currentConditions);
        console.log(temp);
        console.log(tempUnit);
        console.log(weatherStatus);
      })
      .catch(() => {
        weatherContainer.innerHTML = '<div class="unavailable">Weather data could not be retrieved.</div>';
      });
  }

  displayWeather(data) {
    const weatherContainer = this.shadowRoot.querySelector('#weather-container');
    weatherContainer.innerHTML = ''; // Clear previous content

    // Create and append the title
    const titleElement = document.createElement('h1');
    titleElement.textContent = 'Current Weather';
    titleElement.style.fontFamily = 'Georgia, serif';
    titleElement.style.textAlign = 'center';

    // Create and append the condition text and temperature
    const conditionElement = document.createElement('div');
    conditionElement.textContent = `${data.shortForecast} ${data.temperature}°${data.temperatureUnit}`;
    conditionElement.style.fontFamily = 'Arial, sans-serif';
    conditionElement.style.textAlign = 'center';

    // Determine the icon based on the weather condition
    let iconFileName;
    if (data.shortForecast.includes('Clear')) {
      iconFileName = 'sun.png'; // Replace with your local clear weather icon file
    } else if (data.shortForecast.includes('Cloudy')) {
      iconFileName = 'cloudy.png'; // Replace with your local cloudy weather icon file
    } else if (data.shortForecast.includes('Rain')) {
      iconFileName = 'rain.png'; // Replace with your local rainy weather icon file
    } else {
      iconFileName = 'default.png'; // Replace with your local default weather icon file
    }

    // Create and append an icon for the weather condition
    const iconElement = document.createElement('img');
    iconElement.src = `./icons/${iconFileName}`; // Path to your local icons directory
    iconElement.alt = data.shortForecast;
    iconElement.classList.add('icon');

    // Container for icon and condition text
    const conditionContainer = document.createElement('div');
    conditionContainer.style.display = 'flex';
    conditionContainer.style.justifyContent = 'center';
    conditionContainer.style.alignItems = 'center';
    conditionContainer.style.gap = '10px';

    // Append icon and condition text to the container
    conditionContainer.appendChild(iconElement);
    conditionContainer.appendChild(conditionElement);

    // Append all elements to the weather container
    weatherContainer.appendChild(titleElement);
    weatherContainer.appendChild(conditionContainer);
  }
}

customElements.define('weather-widget', WeatherWidget);
