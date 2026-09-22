const GEOCODING = "https://geocoding-api.open-meteo.com/v1/search";
const COUNTRIES = "https://countries.dev/name";
const WEATHER = "https://api.open-meteo.com/v1/forecast";

export async function searchCities(query) {
  const url = `${GEOCODING}?name=${encodeURIComponent(query)}&count=6&language=en`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("City search failed");
  const data = await res.json();
  return data.results ?? [];
}

export async function getCountry(name) {
  const url = `${COUNTRIES}/${encodeURIComponent(name)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Country not found");
  const list = await res.json();
  if (!Array.isArray(list) || list.length === 0) throw new Error("Country not found");
  const exact = list.find(
    (c) => c.name.toLowerCase() === String(name).toLowerCase()
  );
  return exact ?? list[0];
}

export async function getWeather(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day",
    daily: "temperature_2m_max,temperature_2m_min,weather_code",
    timezone: "auto",
    forecast_days: 3
  });
  const res = await fetch(`${WEATHER}?${params}`);
  if (!res.ok) throw new Error("Weather unavailable");
  return res.json();
}

const WIKI_API = "https://en.wikipedia.org/w/api.php";

export async function getGallery(titles) {
  const url =
    WIKI_API +
    "?" +
    new URLSearchParams({
      action: "query",
      format: "json",
      origin: "*",
      titles: titles.join("|"),
      prop: "pageimages|extracts|info",
      exintro: "1",
      explaintext: "1",
      piprop: "thumbnail",
      pithumbsize: "800",
      inprop: "url"
    });
  const res = await fetch(url);
  if (!res.ok) throw new Error("Gallery unavailable");
  const pages = Object.values((await res.json())?.query?.pages ?? []);
  return pages
    .filter((p) => p.thumbnail?.source)
    .map((p) => ({
      title: p.title,
      image: p.thumbnail.source,
      extract: p.extract ?? "",
      url:
        p.fullurl ??
        `https://en.wikipedia.org/wiki/${p.title.replace(/ /g, "_")}`
    }))
    .sort(() => Math.random() - 0.5);
}

export async function getWiki(title) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}

export async function getLandmarks(points, limit = 10, exclude = "") {
  const landmarkTitles = new Set();

  for (const { lat, lon } of points) {
    const geoUrl =
      "https://en.wikipedia.org/w/api.php?" +
      new URLSearchParams({
        action: "query",
        format: "json",
        origin: "*",
        list: "geosearch",
        gscoord: `${lat}|${lon}`,
        gsradius: "10000",
        gslimit: "100",
        gsprop: "type"
      });
    const res = await fetch(geoUrl);
    if (!res.ok) continue;
    const data = await res.json();
    for (const g of data?.query?.geosearch ?? []) {
      if (g.type === "landmark") landmarkTitles.add(g.title);
    }
  }

  if (!landmarkTitles.size) return [];
  const titles = [...landmarkTitles].slice(0, 50);

  const detailUrl =
    "https://en.wikipedia.org/w/api.php?" +
    new URLSearchParams({
      action: "query",
      format: "json",
      origin: "*",
      titles: titles.join("|"),
      prop: "pageimages|extracts|pageviews",
      exintro: "1",
      explaintext: "1",
      pithumbsize: "320"
    });
  const dres = await fetch(detailUrl);
  if (!dres.ok) return [];
  const pages = Object.values((await dres.json())?.query?.pages ?? []);

  const excludeLower = String(exclude).toLowerCase();
  return pages
    .filter(
      (p) =>
        p.thumbnail?.source &&
        p.extract &&
        p.title.toLowerCase() !== excludeLower
    )
    .map((p) => ({
      ...p,
      views: Object.values(p.pageviews ?? {}).reduce(
        (a, v) => a + (typeof v === "number" ? v : 0),
        0
      )
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
}

export const WMO = {
  0: ["Clear sky", "☀️"],
  1: ["Mainly clear", "🌤️"],
  2: ["Partly cloudy", "⛅"],
  3: ["Overcast", "☁️"],
  45: ["Foggy", "🌫️"],
  48: ["Rime fog", "🌫️"],
  51: ["Light drizzle", "🌦️"],
  53: ["Drizzle", "🌧️"],
  55: ["Dense drizzle", "🌧️"],
  61: ["Light rain", "🌦️"],
  63: ["Rain", "🌧️"],
  65: ["Heavy rain", "🌧️"],
  71: ["Light snow", "🌨️"],
  73: ["Snow", "🌨️"],
  75: ["Heavy snow", "❄️"],
  80: ["Light showers", "🌦️"],
  81: ["Showers", "🌧️"],
  82: ["Violent showers", "⛈️"],
  95: ["Thunderstorm", "⛈️"],
  96: ["Thunderstorm with hail", "⛈️"],
  99: ["Thunderstorm with heavy hail", "⛈️"]
};

export function weatherInfo(code) {
  return WMO[code] ?? ["Unknown", "🌡️"];
}

export function formatNumber(n) {
  return new Intl.NumberFormat("en-US").format(n ?? 0);
}

export function formatArea(km2) {
  if (km2 == null) return "—";
  if (km2 >= 1000000) return `${(km2 / 1000000).toFixed(2)}M km²`;
  return `${formatNumber(Math.round(km2))} km²`;
}