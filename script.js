const userTab = document.querySelector("[data-userWeather]")
const searchTab = document.querySelector("[data-searchWeather]")
const userContainer = document.querySelector(".weather-container")
const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]")
const loadingScreen = document.querySelector(".loading-container")
const userInfoContainer = document.querySelector(".user-info-container") 


// initial variables
let currentTab = userTab;
const API_KEY = "5ffb01e322f96f80174cd2255076e43d";
currentTab.classList.add("current-tab");
getFromSessionStorage()

userTab.addEventListener("click", ()=>{
    switchTab(userTab);
})

searchTab.addEventListener("click", ()=>{
    switchTab(searchTab);
})

function switchTab(clickedTab)
{
    if(clickedTab != currentTab){
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");

        if(!searchForm.classList.contains("active")){
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active")
        }
        else{
            // grantAccessContainer.classList.remove("active");
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            // searchForm.classList.add("active");
            getFromSessionStorage();
        }
    }
}


// CHECK IF CORDINATES ARE PRESENT IN STORAGE ---------- >
function getFromSessionStorage(){
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates){
        // agar humko local cordinate na mile iska mtlb hai humne permission nahi de rakhi hai  
        grantAccessContainer.classList.add("active");
    }
    else{
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

async function fetchUserWeatherInfo(coordinates){
    try{
        const {lat, lon} = coordinates;
        grantAccessContainer.classList.remove("active");
        loadingScreen.classList.add("active");
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`)
        
        const data = await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");

        renderWeatherInfo(data);
    }
    catch(err)
    {
        loadingScreen.classList.remove("active");
    }
}



function renderWeatherInfo(weatherInfo){
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    let kelvinTemp = parseInt(weatherInfo?.main?.temp) - 273.15;
    let celciusTemp = kelvinTemp.toFixed(2);
    temp.innerText = celciusTemp + " °C";
    windspeed.innerText = `${weatherInfo?.wind?.speed}` + " m/s";
    humidity.innerText = `${weatherInfo?.main?.humidity}` + "%";
    cloudiness.innerText = `${weatherInfo?.clouds?.all}` + "%";
}

const grantAccessButton = document.querySelector("[data-grantAccess]");

grantAccessButton.addEventListener("click", ()=>{
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else{
        alert("User location not found");
    }
})

function showPosition(position){
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
} 

// ---------------------------------> SEARCH FORM 
const searchInput = document.querySelector("[data-searchInput]");
searchForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    let cityName = searchInput.value;
    if(cityName === "") return;

    fetchSearchWeatherInfo(cityName);
})

async function fetchSearchWeatherInfo(city){

    loadingScreen.classList.add("active");
    // searchForm.classList.remove("active");
    grantAccessButton.classList.remove("active");
    userInfoContainer.classList.remove("active");

   try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`)
        const data =  await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
   }
   catch(err){
        alert("City not found");
   }
}