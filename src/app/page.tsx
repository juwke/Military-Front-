'use client';

import { useEffect, useRef, useState } from 'react';

// GeoJSON: Границы зоны контроля (серая/оспариваемая зона)
const sampleFrontlineData = {
  type: "FeatureCollection" as const,
  features: [
    {
      type: "Feature" as const,
      properties: { name: "Оспариваемая территория", status: "contested" },
      geometry: {
        type: "Polygon" as const,
        coordinates: [
          [
            [37.80, 48.00],
            [37.90, 48.05],
            [37.85, 48.15],
            [37.75, 48.10],
            [37.80, 48.00]
          ]
        ]
      }
    }
  ]
};

export default function Home() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [selectedDate, setSelectedDate] = useState('2026-07-24');
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Подключаем CSS карты напрямую из интернета
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Функция отрисовки карты
    const initMap = () => {
      const L = (window as any).L;
      if (!L || !mapRef.current || mapInstance.current) return;

      const map = L.map(mapRef.current).setView([48.0, 37.8], 10);

      // Подложка OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      // Рисуем полигон фронта
      L.geoJSON(sampleFrontlineData, {
        style: {
          color: '#eab308',
          fillColor: '#ca8a04',
          fillOpacity: 0.4,
          weight: 2
        }
      }).addTo(map);

      // Иконка маркера
      const customIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41]
      });

      // Маркер события
      L.marker([48.02, 37.82], { icon: customIcon })
        .addTo(map)
        .bindPopup('<b style="color: black;">Локальные бои</b><br><span style="color: black;">Фиксация активности.</span>');

      mapInstance.current = map;
      setIsMapLoaded(true);
    };

    // 2. Скачиваем библиотеку Leaflet прямо из CDN
    if ((window as any).L) {
      initMap();
    } else {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initMap;
      document.body.appendChild(script);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <main className="flex flex-col h-screen bg-slate-950 text-white font-sans">
      {/* Шапка */}
      <header className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
        <h1 className="text-md font-bold text-red-500 uppercase tracking-wider">
          Military Summary Map
        </h1>
        <span className="text-xs bg-slate-800 px-3 py-1 rounded border border-slate-700">
          День: {selectedDate}
        </span>
      </header>

      {/* Контейнер карты и новостей */}
      <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden">
        <div className="flex-1 h-full relative p-2">
          {!isMapLoaded && (
            <div className="absolute inset-2 flex items-center justify-center bg-slate-900 text-slate-400 rounded-xl z-10 text-sm">
              Загрузка карты...
            </div>
          )}
          <div ref={mapRef} className="h-full w-full rounded-xl z-0" />
        </div>

        {/* Сводка */}
        <aside className="w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-800 p-4 bg-slate-900/90 overflow-y-auto">
          <h2 className="font-semibold text-sm mb-3 text-slate-300">Сводка за день</h2>
          <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700 text-sm mb-3">
            <span className="text-xs text-red-400 block mb-1">10:30 • Центральный сектор</span>
            <p className="text-slate-300">
              Обновлены границы зон контроля на основе подтвержденных геопривязок.
            </p>
          </div>
        </aside>
      </div>

      {/* Таймлайн */}
      <footer className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-2">
        <button
          onClick={() => setSelectedDate('2026-07-23')}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs rounded border border-slate-700"
        >
          ← Пред. день
        </button>

        <span className="text-xs text-slate-400">
          Выбор даты
        </span>

        <button
          onClick={() => setSelectedDate('2026-07-24')}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs rounded border border-slate-700"
        >
          След. день →
        </button>
      </footer>
    </main>
  );
}
