import React, { useEffect, useRef, useState } from "react";
import {
  HashRouter,
  Link,
  Route,
  Routes,
  useNavigate,
  useSearchParams
} from "react-router-dom";
import {
  searchCities,
  getCountry,
  getWeather,
  getWiki,
  getLandmarks,
  weatherInfo,
  formatNumber,
  formatArea
} from "./api.js";

const HERO_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Positano_%28Italy%29_03.jpg/1920px-Positano_%28Italy%29_03.jpg";

const ICONS = {
  search: <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>,
  pin: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
  area: <><polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" /></>,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></>,
  trend: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></>,
  clock: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
  globe: <><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>,
  chat: <><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></>,
  wallet: <><rect x="2" y="6" width="20" height="14" rx="3" /><path d="M2 10h20" /><circle cx="17" cy="15" r="1.2" /></>,
  phone: <><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></>,
  compass: <><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></>,
  flag: <><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></>,
  book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></>,
  map: <><polygon points="1 6 8 3 16 6 23 3 23 18 16 21 8 18 1 21 1 6" /><line x1="8" y1="3" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="21" /></>,
  flame: <><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></>,
  arrow: <><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>,
  menu: <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="15" y2="18" /></>,
  alert: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>,
  cloud: <><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" /></>,
  layers: <><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></>
};

function Icon({ name, size = 18, className = "" }) {
  return (
    <svg
      className={`ic ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}

function Suggestion({ item, onPick }) {
  return (
    <button
      type="button"
      className="suggestion"
      onClick={() => onPick(item)}
      onKeyDown={(e) => e.key === "Enter" && onPick(item)}
    >
      <span className="suggest-left">
        <span className="suggest-pin">
          <Icon name="pin" size={14} />
        </span>
        <span className="suggest-name">
          {item.name}
          {item.admin1 ? <small> · {item.admin1}</small> : null}
        </span>
      </span>
      <span className="suggest-meta">
        {item.country} {item.feature_code === "PPLC" ? "· Capital" : ""}
      </span>
    </button>
  );
}

function Stat({ icon, label, value, tone = "" }) {
  return (
    <div className="stat">
      <span className={`stat-icon ${tone}`}>
        <Icon name={icon} size={19} />
      </span>
      <div>
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  );
}

function ListCard({ title, icon, children }) {
  return (
    <section className="panel">
      <h3 className="panel-title">
        <span className="pt-icon">
          <Icon name={icon} size={14} />
        </span>
        {title}
      </h3>
      <div className="tags">{children}</div>
    </section>
  );
}

function LandmarkCard({ place }) {
  const url = `https://en.wikipedia.org/wiki/${encodeURIComponent(place.title.replace(/ /g, "_"))}`;
  return (
    <a className="landmark" href={url} target="_blank" rel="noreferrer">
      <div className="landmark-img-wrap">
        {place.thumbnail?.source ? (
          <img
            className="landmark-img"
            src={place.thumbnail.source}
            alt={place.title}
            loading="lazy"
          />
        ) : (
          <div className="landmark-img placeholder">🏛️</div>
        )}
        <span className="landmark-views" title="Article views (7 days)">
          <Icon name="flame" size={12} />
          {formatNumber(place.views)}
        </span>
      </div>
      <div className="landmark-body">
        <p className="landmark-name">{place.title}</p>
        <p className="landmark-desc">
          {place.extract.split(/\s+/).slice(0, 24).join(" ")}…
        </p>
        <span className="landmark-cta">
          Read on Wikipedia <Icon name="arrow" size={13} />
        </span>
      </div>
    </a>
  );
}

function Weather({ weather, label }) {
  if (!weather || !weather.current) return null;
  const [desc, icon] = weatherInfo(weather.current.weather_code);
  return (
    <section className="panel weather">
      <h3 className="panel-title">
        <span className="pt-icon">
          <Icon name="cloud" size={14} />
        </span>
        Live weather · {label}
      </h3>
      <div className="weather-top">
        <div className="weather-now">
          <div className="weather-icon big">{icon}</div>
          <div>
            <p className="temp-now">
              {Math.round(weather.current.temperature_2m)}°C
            </p>
            <p className="stat-label" style={{ marginTop: 6 }}>
              Feels like {Math.round(weather.current.apparent_temperature)}°C · {desc}
            </p>
          </div>
        </div>
        <div className="weather-meta">
          <span>💧 {weather.current.relative_humidity_2m}% humidity</span>
          <span>💨 {weather.current.wind_speed_10m} km/h wind</span>
        </div>
      </div>
      <div className="forecast">
        {weather.daily.time.map((d, i) => (
          <div key={d} className="day">
            <span className="stat-label">
              {new Date(d).toLocaleDateString("en-US", { weekday: "short" })}
            </span>
            <span className="day-icon">{weatherInfo(weather.daily.weather_code[i])[1]}</span>
            <span className="day-temp">
              {Math.round(weather.daily.temperature_2m_max[i])}°{" "}
              <span className="low">/ {Math.round(weather.daily.temperature_2m_min[i])}°</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function ResultsSkeleton() {
  return (
    <main className="content skeleton" aria-busy="true" aria-label="Loading results">
      <div className="panel sk-hero">
        <div className="sk sk-flag" />
        <div className="sk-lines">
          <div className="sk sk-line lg" />
          <div className="sk sk-line sm" />
          <div className="sk sk-line" style={{ width: "45%" }} />
        </div>
      </div>
      <div className="stat-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="sk sk-stat" />
        ))}
      </div>
      <div className="columns">
        <div className="sk sk-panel" />
        <div className="sk sk-panel" />
      </div>
      <div className="sk-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="sk sk-card" />
        ))}
      </div>
    </main>
  );
}

function HomePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [photoFailed, setPhotoFailed] = useState(false);
  const debounce = useRef(null);

  useEffect(() => {
    return () => clearTimeout(debounce.current);
  }, []);

  async function handleInput(q) {
    setQuery(q);
    if (!q.trim()) {
      setOpen(false);
      return;
    }
    clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      try {
        const res = await searchCities(q.trim());
        setSuggestions(res);
        setOpen(true);
      } catch {
        setSuggestions([]);
      }
    }, 300);
  }

  function goSearch(value) {
    const q = value.trim();
    if (!q) return;
    setOpen(false);
    navigate(`/search?q=${encodeURIComponent(q)}`);
  }

  function pickCity(city) {
    setQuery(city.name);
    goSearch(city.name);
  }

  function onSearch(e) {
    e.preventDefault();
    goSearch(query);
  }

  return (
    <div className="app home">
      <section className="hero">
        <div className="hero-media" aria-hidden="true">
          {photoFailed ? <div className="hero-media-fallback" /> : (
            <img
              className="hero-photo"
              src={HERO_IMAGE}
              alt=""
              onError={() => setPhotoFailed(true)}
            />
          )}
          <div className="hero-scrim" />
        </div>

        <header className="nav">
          <a className="brand" href="/#/" onClick={(e) => e.preventDefault()}>
            <span className="brand-mark">
              <Icon name="globe" size={17} />
            </span>
            World Explorer
          </a>
        </header>

        <div className="hero-inner">
          <span className="eyebrow">Real places. Richer stories.</span>
          <h1 className="hero-title">
            <span className="title-heavy">Explore the World,</span>
            <span className="title-lite">One Search Away.</span>
          </h1>
          <p className="subtitle">
            Discover cities, landmarks, culture, food, weather and more&nbsp;— all in
            one place. Your next adventure starts here.
          </p>

          <form className="hero-search" onSubmit={onSearch} role="search">
            <span className="hero-search-icon">
              <Icon name="search" size={19} />
            </span>
            <input
              value={query}
              onChange={(e) => handleInput(e.target.value)}
              onFocus={() => query.trim() && setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              placeholder="Search for a city, country or place..."
              aria-label="Search place"
            />
            <button
              className="hero-submit"
              type="submit"
              aria-label="Explore your destination"
            >
              <Icon name="arrow" size={18} />
            </button>
            {open && suggestions.length > 0 && (
              <div className="suggestions">
                {suggestions.map((s) => (
                  <Suggestion key={s.id} item={s} onPick={pickCity} />
                ))}
              </div>
            )}
          </form>
        </div>
      </section>
    </div>
  );
}

function ResultsPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const [query, setQuery] = useState(q);
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [place, setPlace] = useState(null);
  const [country, setCountry] = useState(null);
  const [weather, setWeather] = useState(null);
  const [wiki, setWiki] = useState(null);
  const [landmarks, setLandmarks] = useState([]);
  const [error, setError] = useState("");
  const debounce = useRef(null);
  const resultsRef = useRef(null);
  const run = useRef(0);

  useEffect(() => {
    setQuery(q);
    if (q.trim()) {
      explore(q);
    } else {
      setLoading(false);
      setPlace(null);
      setCountry(null);
      setWeather(null);
      setWiki(null);
      setLandmarks([]);
      setError("");
    }
  }, [q]);

  useEffect(() => {
    return () => clearTimeout(debounce.current);
  }, []);

  useEffect(() => {
    if (!loading && place) {
      const id = requestAnimationFrame(() =>
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      );
      return () => cancelAnimationFrame(id);
    }
  }, [loading, place]);

  async function handleInput(v) {
    setQuery(v);
    if (!v.trim()) {
      setOpen(false);
      return;
    }
    clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      try {
        const res = await searchCities(v.trim());
        setSuggestions(res);
        setOpen(true);
      } catch {
        setSuggestions([]);
      }
    }, 300);
  }

  async function explore(raw) {
    const id = ++run.current;
    setLoading(true);
    setError("");
    setPlace(null);
    setCountry(null);
    setWeather(null);
    setWiki(null);
    setLandmarks([]);
    setOpen(false);

    try {
      const cty = await getCountry(raw);
      if (run.current !== id) return;
      const latlng = cty.latlng;
      const [weatherNow, wikiNow] = await Promise.all([
        getWeather(latlng[0], latlng[1]),
        getWiki(cty.capital || cty.name)
      ]);
      if (run.current !== id) return;
      setCountry(cty);
      setPlace({ type: "country" });
      setWeather(weatherNow);
      setWiki(wikiNow);
      if (cty.capital) {
        const cap = await searchCities(cty.capital);
        const capPt = cap[0]
          ? { lat: cap[0].latitude, lon: cap[0].longitude }
          : { lat: latlng[0], lon: latlng[1] };
        if (run.current !== id) return;
        setLandmarks(
          await getLandmarks(
            [capPt, { lat: latlng[0], lon: latlng[1] }],
            10,
            cty.name
          )
        );
      } else {
        if (run.current !== id) return;
        setLandmarks(
          await getLandmarks([{ lat: latlng[0], lon: latlng[1] }], 10, cty.name)
        );
      }
    } catch {
      try {
        const cities = await searchCities(raw);
        if (!cities.length) throw new Error("not found");
        const city = cities[0];
        let cty = null;
        try {
          cty = await getCountry(city.country);
        } catch {
          cty = null;
        }
        const [weatherNow, wikiNow, ctyTmp] = await Promise.all([
          getWeather(city.latitude, city.longitude),
          getWiki(city.name),
          cty
            ? Promise.resolve(cty)
            : getCountry(city.country_code).catch(() => null)
        ]);
        if (run.current !== id) return;
        setCountry(ctyTmp);
        setPlace({ type: "city", city });
        setWeather(weatherNow);
        setWiki(wikiNow);
        if (run.current !== id) return;
        setLandmarks(
          await getLandmarks(
            [{ lat: city.latitude, lon: city.longitude }],
            10,
            city.name
          )
        );
      } catch {
        if (run.current !== id) return;
        setError(
          "Could not find that place. Try a country like “India” or a city like “London”."
        );
      }
    } finally {
      if (run.current === id) setLoading(false);
    }
  }

  function pickCity(city) {
    setQuery(city.name);
    navigate(`/search?q=${encodeURIComponent(city.name)}`);
  }

  function onNavSearch(e) {
    e.preventDefault();
    const value = query.trim();
    if (!value) return;
    setOpen(false);
    navigate(`/search?q=${encodeURIComponent(value)}`);
  }

  const isCity = place && place.type === "city";
  const isCountry = place && place.type === "country";
  const showResults = country || (isCity && place.city);

  return (
    <div className="app">
      <header className="results-nav">
        <Link className="brand" to="/" aria-label="World Explorer home">
          <span className="brand-mark">
            <Icon name="globe" size={17} />
          </span>
          <span className="brand-text">World Explorer</span>
        </Link>
        <form className="mini-search" onSubmit={onNavSearch} role="search">
          <span className="hero-search-icon">
            <Icon name="search" size={16} />
          </span>
          <input
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            onFocus={() => query.trim() && setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            placeholder="Search another place..."
            aria-label="Search place"
          />
          <button className="mini-search-btn" type="submit" aria-label="Search">
            <Icon name="search" size={16} />
          </button>
          {open && suggestions.length > 0 && (
            <div className="suggestions">
              {suggestions.map((s) => (
                <Suggestion key={s.id} item={s} onPick={pickCity} />
              ))}
            </div>
          )}
        </form>
        <Link className="nav-link" to="/">
          Back to home
        </Link>
      </header>

      {!q.trim() && (
        <main className="content">
          <section className="panel wiki">
            <h3 className="panel-title">
              <span className="pt-icon">
                <Icon name="alert" size={14} />
              </span>
              Nothing to explore yet
            </h3>
            <p>Use the search box above to look up a country or city.</p>
          </section>
        </main>
      )}

      {loading && <ResultsSkeleton />}

      {!loading && error && (
        <main className="content">
          <p className="error">
            <Icon name="alert" size={16} /> {error}
          </p>
          <button className="back-btn" type="button" onClick={() => navigate("/")}>
            ← Back to home
          </button>
        </main>
      )}

      {!loading && showResults && (
        <main className="content" ref={resultsRef}>
          <section className="panel country-hero">
            <div className="flag-wrap">
              {country?.flags?.png && (
                <img
                  className="flag"
                  src={country.flags.png}
                  alt={`${country.name} flag`}
                />
              )}
            </div>
            <div>
              <h2 className="place-name">
                {isCity ? place.city.name : country.name}
                <span className="flag-emoji">{country?.flag ?? ""}</span>
                <span className="place-badge">
                  {isCity ? "City" : "Country"}
                </span>
              </h2>
              <p className="place-sub">
                {isCity
                  ? `${place.city.country}${place.city.admin1 ? ` · ${place.city.admin1}` : ""}`
                  : `${country.region}${country.subregion ? ` · ${country.subregion}` : ""}`}
                {isCity && country ? ` · ${country.name}` : ""}
              </p>
              <div className="place-meta">
                <span>
                  <Icon name="pin" size={14} />
                  {isCity
                    ? `${place.city.latitude.toFixed(2)}°, ${place.city.longitude.toFixed(2)}°`
                    : country.latlng?.[0] && country.latlng?.[1]
                    ? `${country.latlng[0]}°, ${country.latlng[1]}°`
                    : "—"}
                </span>
                {!isCity && country.capital && (
                  <span>
                    <Icon name="flag" size={14} /> {country.capital}
                  </span>
                )}
                {country?.timezones?.[0] && (
                  <span>
                    <Icon name="clock" size={14} /> {country.timezones[0]}
                  </span>
                )}
              </div>
            </div>
          </section>

          <section className="stat-grid">
            {isCity ? (
              <>
                <Stat icon="users" label="City population" value={formatNumber(place.city.population)} />
                <Stat icon="globe" tone="alt" label="Country population" value={country ? formatNumber(country.population) : "—"} />
                <Stat icon="area" tone="alt" label="Country area" value={country ? formatArea(country.area) : "—"} />
                <Stat icon="grid" tone="alt" label="Density" value={country ? `${formatNumber(Math.round(country.populationDensity))}/km²` : "—"} />
              </>
            ) : (
              <>
                <Stat icon="users" label="Population" value={formatNumber(country.population)} />
                <Stat icon="area" label="Area" value={formatArea(country.area)} />
                <Stat icon="grid" label="Density" value={`${formatNumber(Math.round(country.populationDensity))}/km²`} />
                <Stat icon="trend" tone="warm" label="Gini index" value={country.gini ?? "—"} />
              </>
            )}
            <Stat icon="clock" tone="alt" label="Timezone" value={country?.timezones?.[0] ?? "—"} />
            <Stat icon="globe" tone="alt" label="Internet TLD" value={country?.topLevelDomain?.[0] ?? "—"} />
          </section>

          <div className="columns">
            <div className="col">
              {country && (
                <ListCard title="Languages" icon="chat">
                  {country.languages?.map((l) => (
                    <span key={l.iso639_1 || l.name} className="tag" title={l.nativeName}>
                      {l.name} {l.nativeName ? `(${l.nativeName})` : ""}
                    </span>
                  ))}
                </ListCard>
              )}
              {country && (
                <ListCard title="Currency" icon="wallet">
                  {country.currencies?.map((c) => (
                    <span key={c.code} className="tag currency">
                      <b>{c.symbol}</b> {c.name} · {c.code}
                    </span>
                  ))}
                </ListCard>
              )}
              {!isCity && isCountry && country && (
                <ListCard title="Calling codes" icon="phone">
                  {country.callingCodes?.map((c) => (
                    <span key={c} className="tag">
                      +{c}
                    </span>
                  ))}
                </ListCard>
              )}
            </div>

            <div className="col">
              {isCity && place.city && (
                <section className="panel">
                  <h3 className="panel-title">
                    <span className="pt-icon">
                      <Icon name="layers" size={14} />
                    </span>
                    City facts
                  </h3>
                  <div className="city-facts">
                    <p><b>Country</b><span>{place.city.country}</span></p>
                    <p><b>Region</b><span>{place.city.admin1 ?? "—"}</span></p>
                    <p><b>Elevation</b><span>{place.city.elevation != null ? `${place.city.elevation} m` : "—"}</span></p>
                    <p><b>Timezone</b><span>{place.city.timezone}</span></p>
                    <p><b>Feature</b><span>{place.city.feature_code}</span></p>
                  </div>
                </section>
              )}
              {country && (
                <ListCard title="Neighbouring countries" icon="flag">
                  {country.borders?.length
                    ? country.borders.map((b) => (
                        <span key={b} className="tag">
                          {b}
                        </span>
                      ))
                    : <span className="tag">Island nation 🌊</span>}
                </ListCard>
              )}
              {country && (
                <ListCard title="Coordinates" icon="compass">
                  <span className="tag">
                    {country.latlng?.[0]}°, {country.latlng?.[1]}°
                  </span>
                </ListCard>
              )}
            </div>
          </div>

          <section className="panel wiki">
            <h3 className="panel-title">
              <span className="pt-icon">
                <Icon name="book" size={14} />
              </span>
              {isCity ? place.city.name : country.name} in brief
            </h3>
            {wiki ? (
              <>
                <p>{wiki.extract ?? "No description found."}</p>
                {wiki.content_urls?.desktop?.page && (
                  <a
                    className="wiki-link"
                    href={wiki.content_urls.desktop.page}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Read more on Wikipedia <Icon name="arrow" size={14} />
                  </a>
                )}
              </>
            ) : (
              <p>No description found.</p>
            )}
          </section>

          <Weather weather={weather} label={isCity ? place.city.name : country.name} />

          {landmarks.length > 0 && (
            <section className="panel">
              <h3 className="panel-title">
                <span className="pt-icon">
                  <Icon name="map" size={14} />
                </span>
                Famous places {isCity ? `in ${place.city.name}` : `in ${country.name}`}
              </h3>
              <p className="landmark-hint">
                Ranked by popularity — most-viewed Wikipedia articles near this place.
              </p>
              <div className="landmark-grid">
                {landmarks.map((l) => (
                  <LandmarkCard key={l.pageid} place={l} />
                ))}
              </div>
            </section>
          )}
        </main>
      )}

      <footer className="footer">
        <span>World Explorer — built with React & Vite</span>
        <div className="footer-sources">
          <span>Open-Meteo</span>
          <span>REST Countries</span>
          <span>Wikipedia</span>
          <span>Geocoding API</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<ResultsPage />} />
      </Routes>
    </HashRouter>
  );
}