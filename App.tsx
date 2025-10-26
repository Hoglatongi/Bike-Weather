
import React, { useState, useCallback, useEffect } from 'react';
import { fetchWeatherForecast, fetchBikeTrails } from './services/geminiService';
import { WeatherData, ForecastInput, BikeTrail } from './types';
import ForecastCard from './components/ForecastCard';
import Loader from './components/Loader';
import ErrorDisplay from './components/ErrorDisplay';
import { LocationIcon, SearchIcon, StarIcon, BikeIcon, MapPinIcon } from './components/icons';

const TrailCard: React.FC<{ trail: BikeTrail }> = ({ trail }) => (
    <div className="bg-slate-800/50 rounded-lg shadow-lg p-4 mb-4 flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex-grow">
            <h3 className="text-lg font-bold text-white">{trail.name}</h3>
            <p className="text-sm text-slate-300 mt-1">{trail.description}</p>
        </div>
        {trail.mapsUri && (
            <a
                href={trail.mapsUri}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded-full inline-flex items-center transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
            >
                <MapPinIcon className="w-5 h-5 mr-2" />
                View on Map
            </a>
        )}
    </div>
);

const App: React.FC = () => {
  const [view, setView] = useState<'weather' | 'trails'>('weather');
  
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [weatherLocationInput, setWeatherLocationInput] = useState('');
  const [searchQuery, setSearchQuery] = useState<string | null>(null);

  const [bikeTrails, setBikeTrails] = useState<BikeTrail[]>([]);
  const [isTrailsLoading, setIsTrailsLoading] = useState(false);
  const [trailsError, setTrailsError] = useState<string | null>(null);
  const [trailLocationInput, setTrailLocationInput] = useState('');
  const [trailSearchQuery, setTrailSearchQuery] = useState<string | null>(null);
  
  const [savedLocation, setSavedLocation] = useState<string | null>(() => {
    return localStorage.getItem('jens-bike-weather-location');
  });

  const [backgroundImage, setBackgroundImage] = useState<string | null>(() => {
    return localStorage.getItem('userBackgroundImage');
  });

  const fetchForecast = useCallback(async (
    fetcher: () => ForecastInput, 
    locationIdentifierForSaving: string | null,
    isInitialLoad: boolean = false,
  ) => {
    setWeatherError(null);
    setWeatherData(null);
    setIsWeatherLoading(true);

    try {
      const data = await fetchWeatherForecast(fetcher());
      setWeatherData(data);
      if (locationIdentifierForSaving) {
        localStorage.setItem('jens-bike-weather-location', locationIdentifierForSaving);
        setSavedLocation(locationIdentifierForSaving);
      } else {
        const resolvedLocation = `${data.location.city}, ${data.location.country}`;
        localStorage.setItem('jens-bike-weather-location', resolvedLocation);
        setSavedLocation(resolvedLocation);
      }
    } catch (apiError: any) {
      const errorMessage = apiError.message || "An unknown error occurred.";
      if (isInitialLoad) {
          setWeatherError(`Could not find weather for your saved location "${savedLocation}". It has been cleared.`);
          localStorage.removeItem('jens-bike-weather-location');
          setSavedLocation(null);
      } else {
          setWeatherError(errorMessage);
      }
    } finally {
      setIsWeatherLoading(false);
    }
  }, [savedLocation]);


  useEffect(() => {
    if (savedLocation && !weatherData && !weatherError && view === 'weather') {
      setSearchQuery(savedLocation);
      fetchForecast(() => ({ location: savedLocation }), savedLocation, true);
    }
  }, [savedLocation, weatherData, weatherError, view, fetchForecast]);

  const handleBackgroundImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            setBackgroundImage(result);
            try {
                localStorage.setItem('userBackgroundImage', result);
            } catch (storageError) {
                console.error("Could not save image to local storage:", storageError);
                setWeatherError("Your image is too large to be saved for next time, but it will be used for this session.");
            }
        };
        reader.readAsDataURL(file);
    } else if (file) {
        setWeatherError("Please select a valid image file.");
    }
  };

  const resetBackgroundImage = () => {
      setBackgroundImage(null);
      localStorage.removeItem('userBackgroundImage');
  };

  const handleClearSavedLocation = () => {
    localStorage.removeItem('jens-bike-weather-location');
    setSavedLocation(null);
    setWeatherData(null);
    setWeatherError(null);
    setWeatherLocationInput('');
    setSearchQuery(null);
  };

  const handleGetForecastByGeolocation = useCallback(() => {
    setWeatherLocationInput('');
    if (!navigator.geolocation) {
      setWeatherError("Geolocation is not supported by your browser. Please use the search bar instead.");
      return;
    }
    setSearchQuery("your current location");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchForecast(() => ({ lat: latitude, lon: longitude }), null);
      },
      (geoError) => {
        let errorMessage = "An unknown error occurred while trying to get your location.";
        if (geoError.code === geoError.PERMISSION_DENIED) {
            errorMessage = "Location access was denied. Please enable it in your browser settings.";
        }
        setWeatherError(errorMessage);
        setIsWeatherLoading(false);
      }
    );
  }, [fetchForecast]);
  
  const handleWeatherSearchSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weatherLocationInput.trim()) {
      setWeatherError("Please enter a location to search.");
      return;
    }
    setSearchQuery(weatherLocationInput);
    fetchForecast(() => ({ location: weatherLocationInput }), weatherLocationInput);
  }, [weatherLocationInput, fetchForecast]);

  const handleTrailSearch = useCallback(async (location: string) => {
    if (!location.trim()) {
        setTrailsError("Please enter a location.");
        return;
    }
    setBikeTrails([]);
    setTrailsError(null);
    setIsTrailsLoading(true);
    setTrailLocationInput(location);
    setTrailSearchQuery(location);
    try {
        if (location.toLowerCase().includes("near me") || location.toLowerCase().includes("current location")) {
            if (!navigator.geolocation) {
                throw new Error("Geolocation is not supported by your browser.");
            }
            const data = await new Promise<BikeTrail[]>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        try {
                            const { latitude, longitude } = position.coords;
                            const trails = await fetchBikeTrails(location, { lat: latitude, lon: longitude });
                            resolve(trails);
                        } catch (e) {
                            reject(e);
                        }
                    },
                    (geoError) => {
                        let message = "Could not get your location. Please allow location access.";
                        if (geoError.code === geoError.PERMISSION_DENIED) {
                            message = "Location access was denied. Please enable it in your browser settings to search for trails near you.";
                        }
                        reject(new Error(message));
                    }
                );
            });
            setBikeTrails(data);
        } else {
            const data = await fetchBikeTrails(location);
            setBikeTrails(data);
        }
    } catch (err: any) {
        setTrailsError(err.message || "An unknown error occurred finding trails.");
    } finally {
        setIsTrailsLoading(false);
    }
  }, []);

  const defaultImageUrl = 'https://images.unsplash.com/photo-1511994293814-3a0a1f05561a?q=80&w=2940&auto=format&fit=crop';
  const imageUrl = backgroundImage || defaultImageUrl;

  const backgroundStyle = {
    backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.85)), url("${imageUrl}")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
  };

  const cardClasses = "bg-slate-900/40 backdrop-blur-sm p-8 md:p-12 rounded-2xl shadow-2xl border border-slate-700/50";
  
  const renderWeatherContent = () => {
    if (isWeatherLoading) return <div className={cardClasses}><Loader message="Fetching your bike-friendly forecast..." /></div>;
    if (weatherError) return <div className={cardClasses}><ErrorDisplay message={weatherError} /><button onClick={() => setWeatherError(null)} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-full transition-colors mt-4">Dismiss</button></div>;
    if (weatherData) {
      return (
        <div className="w-full">
            <div className="text-center">
                <button onClick={() => {
                    setView('trails');
                    if (savedLocation && !trailLocationInput) {
                        setTrailLocationInput(savedLocation);
                    }
                }} className="text-cyan-400 hover:text-cyan-300 transition-colors mb-4 text-sm font-semibold">Switch to Find Bike Trails &rarr;</button>
                <h2 className="text-3xl font-bold mb-2">{weatherData.location.city}</h2>
                <p className="text-center text-slate-400 mb-4">{weatherData.location.country} - 5 Day Forecast</p>
                {searchQuery && <p className="text-xs text-slate-500 mb-4 -mt-2">(Results for: "{searchQuery}")</p>}
                {savedLocation && (
                    <div className="mb-6 inline-flex items-center gap-x-4 bg-slate-800/60 py-1.5 px-4 rounded-full">
                        <div className="flex items-center gap-x-2 text-amber-400"><StarIcon className="w-4 h-4" /><span className="text-xs font-semibold">Saved Location</span></div>
                        <button onClick={handleClearSavedLocation} className="text-xs text-slate-400 hover:text-white transition-colors">Clear</button>
                    </div>
                )}
            </div>
            {weatherData.dailyForecasts.map((day, index) => <ForecastCard key={index} day={day} />)}
        </div>
      );
    }
    return (
        <div className={`text-center ${cardClasses}`}>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Jens Bike Weather</h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8">Get daytime weather conditions perfect for your ride, or find a new trail to explore.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={handleGetForecastByGeolocation} disabled={isWeatherLoading} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-full inline-flex items-center justify-center transition-all duration-300 transform hover:scale-105 disabled:opacity-50"><LocationIcon className="w-6 h-6 mr-3"/>Get Weather</button>
                <button onClick={() => {
                    setView('trails');
                    if (savedLocation) {
                        setTrailLocationInput(savedLocation);
                    }
                }} className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-6 rounded-full inline-flex items-center justify-center transition-all duration-300 transform hover:scale-105"><BikeIcon className="w-6 h-6 mr-3"/>Find Trails</button>
            </div>
            <div className="my-6 text-slate-400 font-semibold flex items-center max-w-md mx-auto"><span className="flex-grow bg-slate-700 h-px"></span><span className="px-4">OR SEARCH WEATHER</span><span className="flex-grow bg-slate-700 h-px"></span></div>
            <form onSubmit={handleWeatherSearchSubmit} className="max-w-md mx-auto">
                <div className="relative">
                    <input type="text" value={weatherLocationInput} onChange={(e) => setWeatherLocationInput(e.target.value)} placeholder="Enter city for weather" className="w-full bg-slate-800 border-2 border-slate-600 rounded-full py-3 pl-5 pr-20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors" />
                    <button type="submit" disabled={isWeatherLoading || !weatherLocationInput.trim()} className="absolute top-1/2 right-2 -translate-y-1/2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold p-2.5 rounded-full inline-flex items-center justify-center transition-all duration-300 disabled:opacity-50"><SearchIcon className="w-5 h-5" /></button>
                </div>
            </form>
        </div>
    );
  };
  
  const renderTrailsContent = () => {
    return (
        <div className="w-full">
            <div className={`text-center mb-6 ${cardClasses}`}>
                 <button onClick={() => { setView('weather'); setTrailsError(null); setBikeTrails([]); setTrailLocationInput(''); setTrailSearchQuery(null); }} className="text-cyan-400 hover:text-cyan-300 transition-colors mb-4 text-sm font-semibold">&larr; Back to Weather</button>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Bike Trails</h1>
                <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8">Discover new bike paths and trails near you or anywhere in the world.</p>
                <form onSubmit={(e) => { e.preventDefault(); handleTrailSearch(trailLocationInput); }} className="max-w-md mx-auto">
                    <div className="relative">
                        <input type="text" value={trailLocationInput} onChange={(e) => setTrailLocationInput(e.target.value)} placeholder="Enter a city or 'near me'" className="w-full bg-slate-800 border-2 border-slate-600 rounded-full py-3 pl-5 pr-20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors" />
                        <button type="submit" disabled={isTrailsLoading || !trailLocationInput.trim()} className="absolute top-1/2 right-2 -translate-y-1/2 bg-sky-600 hover:bg-sky-500 text-white font-bold p-2.5 rounded-full inline-flex items-center justify-center transition-all duration-300 disabled:opacity-50"><SearchIcon className="w-5 h-5" /></button>
                    </div>
                </form>
                 {savedLocation && trailLocationInput.toLowerCase() !== savedLocation.toLowerCase() && (
                    <div className="text-center mt-4">
                        <button
                            onClick={() => handleTrailSearch(savedLocation)}
                            className="text-sm text-slate-400 hover:text-white transition-colors bg-slate-800/60 py-1.5 px-4 rounded-full"
                            aria-label={`Search trails near saved location: ${savedLocation}`}
                        >
                            Or search near <span className="font-bold underline">{savedLocation}</span>
                        </button>
                    </div>
                )}
            </div>
            
            {isTrailsLoading && <div className={cardClasses}><Loader message="Searching for bike trails..." /></div>}
            {trailsError && <div className={cardClasses}><ErrorDisplay message={trailsError} /><button onClick={() => setTrailsError(null)} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-full transition-colors mt-4">Dismiss</button></div>}
            {bikeTrails.length > 0 && trailSearchQuery && (
                <div>
                    <h2 className="text-xl font-bold text-center mb-4 text-slate-200">Showing trails near "{trailSearchQuery}"</h2>
                    {bikeTrails.map((trail, index) => <TrailCard key={index} trail={trail} />)}
                </div>
            )}
        </div>
    );
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans"
      style={backgroundStyle}
    >
        <main className="flex-grow flex items-center justify-center w-full">
            <div className="w-full max-w-4xl mx-auto">
                {view === 'weather' ? renderWeatherContent() : renderTrailsContent()}
            </div>
        </main>
        <footer className="w-full max-w-4xl mx-auto text-center py-4">
            <p className="text-sm text-slate-500">
                Powered by the <a href="https://ai.google.dev/gemini-api" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-400 transition-colors">Google Gemini API</a>
            </p>
            <div className="mt-2 flex justify-center items-center gap-4 text-sm text-slate-500">
                <input type="file" id="bg-upload" accept="image/*" onChange={handleBackgroundImageUpload} className="hidden" aria-hidden="true" />
                <label htmlFor="bg-upload" className="cursor-pointer underline hover:text-slate-400 transition-colors" role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') e.currentTarget.click(); }}>Change Background</label>
                {backgroundImage && (<>
                    <span aria-hidden="true">|</span>
                    <button onClick={resetBackgroundImage} className="underline hover:text-slate-400 transition-colors">Reset Background</button>
                </>)}
            </div>
        </footer>
    </div>
  );
};

export default App;
