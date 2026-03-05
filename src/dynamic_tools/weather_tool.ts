import { SchemaType } from '@google/generative-ai';

// NOTA IMPORTANTE: Reemplaza 'TU_API_KEY_AQUI' con tu clave API real de OpenWeatherMap.
// Es recomendable usar variables de entorno para claves API en un entorno de producción.
const OPENWEATHER_API_KEY = 'sk-a9f571d837984e14add8f763f58676c7'; 

export const tool = {
    name: "get_current_weather",
    description: "Obtiene la información meteorológica actual para una ciudad específica. Puedes especificar un código de país opcional para refinar la búsqueda. La temperatura se devuelve en grados Celsius.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            city: { 
                type: SchemaType.STRING, 
                description: "El nombre de la ciudad para la cual se desea obtener el clima. Ej: 'Madrid', 'New York'."
            },
            country_code: { 
                type: SchemaType.STRING, 
                description: "El código de país de dos letras (ISO 3166) para refinar la búsqueda de la ciudad. Ej: 'ES' para España, 'US' para Estados Unidos. Opcional."
            }
        },
        required: ["city"]
    },
    execute: async (args: { city: string; country_code?: string }): Promise<string> => {
        const { city, country_code } = args;

        if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === 'sk-a9f571d837984e14add8f763f58676c7') {
            return "Error: La clave API de OpenWeatherMap no está configurada. Por favor, reemplaza 'TU_API_KEY_AQUI' con tu clave real.";
        }

        let url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}`;
        if (country_code) {
            url += `,${encodeURIComponent(country_code)}`;
        }
        url += `&appid=${OPENWEATHER_API_KEY}&units=metric&lang=es`;

        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                if (response.status === 404) {
                    return `No se encontró información meteorológica para la ciudad: ${city}${country_code ? ' (' + country_code + ')' : ''}. Por favor, verifica el nombre de la ciudad o el código de país.`;
                } else if (response.status === 401) {
                    return "Error de autenticación con la API de OpenWeatherMap. Verifica tu clave API.";
                } else {
                    return `Error al obtener el clima: ${response.status} ${response.statusText}. Detalles: ${errorData.message || 'No hay detalles adicionales.'}`;
                }
            }

            const data = await response.json();

            if (data.cod && data.cod !== 200) {
                return `Error de la API de OpenWeatherMap: ${data.message || 'Error desconocido'}`;
            }

            const weatherDescription = data.weather[0]?.description || 'desconocido';
            const temperature = data.main?.temp;
            const feelsLike = data.main?.feels_like;
            const humidity = data.main?.humidity;
            const windSpeed = data.wind?.speed;
            const cityName = data.name;
            const country = data.sys?.country;

            if (temperature === undefined) {
                return `No se pudo obtener la temperatura para ${cityName || city}.`;
            }

            let result = `El clima actual en ${cityName}, ${country} es: ${weatherDescription}.`;
            result += ` La temperatura es de ${temperature.toFixed(1)}°C (sensación térmica de ${feelsLike.toFixed(1)}°C).`;
            result += ` La humedad es del ${humidity}% y la velocidad del viento es de ${windSpeed} m/s.`;

            return result;

        } catch (error: any) {
            console.error("Error en la función get_current_weather:", error);
            return `Ocurrió un error al intentar obtener el clima: ${error.message || 'Error de red o desconocido'}.`;
        }
    }
};