import React, { useState, useCallback } from 'react';
import { fetchWeatherForecast } from './services/geminiService';
import { WeatherData } from './types';
import ForecastCard from './components/ForecastCard';
import Loader from './components/Loader';
import ErrorDisplay from './components/ErrorDisplay';
import { LocationIcon, SearchIcon } from './components/icons';

const App: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationInput, setLocationInput] = useState('');
  
  const [backgroundImage, setBackgroundImage] = useState<string | null>(() => {
    return localStorage.getItem('userBackgroundImage');
  });

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
                setError("Your image is too large to be saved for next time, but it will be used for this session.");
            }
        };
        reader.readAsDataURL(file);
    } else if (file) {
        setError("Please select a valid image file.");
    }
  };

  const resetBackgroundImage = () => {
      setBackgroundImage(null);
      localStorage.removeItem('userBackgroundImage');
  };

  const handleGetForecastByGeolocation = useCallback(() => {
    setError(null);
    setWeatherData(null);
    setLocationInput('');
    setIsLoading(true);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser. Please use the search bar instead.");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const data = await fetchWeatherForecast({ lat: latitude, lon: longitude });
          setWeatherData(data);
        } catch (apiError: any) {
          setError(apiError.message || "An unknown error occurred while fetching weather data.");
        } finally {
          setIsLoading(false);
        }
      },
      (geoError) => {
        let errorMessage = "An unknown error occurred while trying to get your location.";
        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            errorMessage = "Could not get your location. Please allow location access in your browser settings. If that doesn't work, geolocation may be blocked in this environment; please try searching manually.";
            break;
          case geoError.POSITION_UNAVAILABLE:
            errorMessage = "Location information is currently unavailable. Please try again or search for a location manually.";
            break;
          case geoError.TIMEOUT:
            errorMessage = "The request to get your location timed out. Please try again or search manually.";
            break;
        }
        setError(errorMessage);
        setIsLoading(false);
      }
    );
  }, []);
  
  const handleSearchSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationInput.trim()) {
      setError("Please enter a location to search.");
      return;
    }
    setError(null);
    setWeatherData(null);
    setIsLoading(true);

    try {
      const data = await fetchWeatherForecast({ location: locationInput });
      setWeatherData(data);
    } catch (apiError: any) {
      setError(apiError.message || `Could not find weather for "${locationInput}".`);
    } finally {
      setIsLoading(false);
    }
  }, [locationInput]);

  const defaultImageUrl = 'https://images.unsplash.com/photo-1511994293814-3a0a1f05561a?q=80&w=2940&auto=format&fit=crop';
  const imageUrl = backgroundImage || defaultImageUrl;

  const backgroundStyle = {
    backgroundImage: `
      linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.85)),
      url("${imageUrl}")
    `,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
  };

  const cardClasses = "bg-slate-900/40 backdrop-blur-sm p-8 md:p-12 rounded-2xl shadow-2xl border border-slate-700/50";


  const renderContent = () => {
    if (isLoading) {
      return (
        <div className={cardClasses}>
          <Loader message="Fetching your bike-friendly forecast..." />
        </div>
      );
    }

    if (error) {
      return (
        <div className={cardClasses}>
          <ErrorDisplay message={error} />
          <div className="text-center mt-4">
              <button
                  onClick={() => { setError(null); }}
                  className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-full transition-colors"
              >
                  Dismiss
              </button>
          </div>
        </div>
      );
    }

    if (weatherData) {
      return (
        <div className="w-full">
            <h2 className="text-3xl font-bold text-center mb-2">
                {weatherData.location.city}
            </h2>
            <p className="text-center text-slate-400 mb-6">{weatherData.location.country} - 5 Day Forecast</p>
            {weatherData.dailyForecasts.map((day, index) => (
                <ForecastCard key={index} day={day} />
            ))}
        </div>
      );
    }
    
    return (
        <div className={`text-center ${cardClasses}`}>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Jens Bike Weather</h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8">
                Get daytime weather conditions perfect for your ride. We'll show you the wind, sun, and chance of rain with easy-to-read graphs.
            </p>
            <button
                onClick={handleGetForecastByGeolocation}
                disabled={isLoading}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-full inline-flex items-center transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <LocationIcon className="w-6 h-6 mr-3"/>
                Get Forecast for My Location
            </button>

            <div className="my-6 text-slate-400 font-semibold flex items-center max-w-md mx-auto">
                <span className="flex-grow bg-slate-700 h-px"></span>
                <span className="px-4">OR</span>
                <span className="flex-grow bg-slate-700 h-px"></span>
            </div>

            <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto">
                <label htmlFor="location-search" className="sr-only">Search by city or zip code</label>
                <div className="relative">
                    <input
                        id="location-search"
                        type="text"
                        value={locationInput}
                        onChange={(e) => setLocationInput(e.target.value)}
                        placeholder="Enter a city or zip code"
                        className="w-full bg-slate-800 border-2 border-slate-600 rounded-full py-3 pl-5 pr-20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors disabled:opacity-60"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !locationInput.trim()}
                        className="absolute top-1/2 right-2 -translate-y-1/2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold p-2.5 rounded-full inline-flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-cyan-600"
                        aria-label="Search"
                    >
                         <SearchIcon className="w-5 h-5" />
                    </button>
                </div>
            </form>
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
                {renderContent()}
            </div>
        </main>
        <footer className="w-full max-w-4xl mx-auto text-center py-4">
            <p className="text-sm text-slate-500">
                Powered by the <a href="https://ai.google.dev/gemini-api" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-400 transition-colors">Google Gemini API</a>
            </p>
            <div className="mt-2 flex justify-center items-center gap-4 text-sm text-slate-500">
                <input
                    type="file"
                    id="bg-upload"
                    accept="image/*"
                    onChange={handleBackgroundImageUpload}
                    className="hidden"
                    aria-hidden="true"
                />
                <label
                    htmlFor="bg-upload"
                    className="cursor-pointer underline hover:text-slate-400 transition-colors"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') e.currentTarget.click(); }}
                >
                    Change Background
                </label>
                {backgroundImage && (
                    <>
                        <span aria-hidden="true">|</span>
                        <button
                            onClick={resetBackgroundImage}
                            className="underline hover:text-slate-400 transition-colors"
                        >
                            Reset Background
                        </button>
                    </>
                )}
            </div>
        </footer>
    </div>
  );
};

export default App;
