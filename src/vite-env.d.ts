/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** OpenWeather API key (https://home.openweathermap.org/api_keys). */
  readonly VITE_OPENWEATHER_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
