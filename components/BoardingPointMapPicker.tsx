import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import type { WebViewMessageEvent } from 'react-native-webview';

import { searchPlace, type MapCoords } from '@/lib/geocode';

type BoardingPointMapPickerProps = {
  visible: boolean;
  title: string;
  searchHint: string;
  initialCoords?: MapCoords;
  onClose: () => void;
  onConfirm: (coords: MapCoords) => void;
};

function mapHtml(center: MapCoords, zoom: number): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var map = L.map('map').setView([${center.latitude}, ${center.longitude}], ${zoom});
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);
    var marker = L.marker([${center.latitude}, ${center.longitude}], { draggable: true }).addTo(map);
    function send(lat, lng) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ latitude: lat, longitude: lng }));
      }
    }
    send(${center.latitude}, ${center.longitude});
    marker.on('dragend', function () {
      var p = marker.getLatLng();
      send(p.lat, p.lng);
    });
    map.on('click', function (e) {
      marker.setLatLng(e.latlng);
      send(e.latlng.lat, e.latlng.lng);
    });
    window.flyTo = function (lat, lng) {
      map.setView([lat, lng], 17);
      marker.setLatLng([lat, lng]);
      send(lat, lng);
    };
  </script>
</body>
</html>`;
}

const BRAZIL: MapCoords = { latitude: -14.235, longitude: -51.9253 };

export function BoardingPointMapPicker({
  visible,
  title,
  searchHint,
  initialCoords,
  onClose,
  onConfirm,
}: BoardingPointMapPickerProps) {
  const webRef = useRef<WebView>(null);
  const [query, setQuery] = useState(searchHint);
  const [picked, setPicked] = useState<MapCoords | undefined>(initialCoords);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const html = useMemo(
    () => mapHtml(initialCoords ?? BRAZIL, initialCoords ? 16 : 4),
    [initialCoords],
  );

  useEffect(() => {
    if (!visible) {
      return;
    }
    setQuery(searchHint);
    setPicked(initialCoords);
    setSearchError('');
  }, [visible, searchHint, initialCoords]);

  function handleMessage(event: WebViewMessageEvent) {
    try {
      const payload = JSON.parse(event.nativeEvent.data) as MapCoords;
      if (
        typeof payload.latitude === 'number' &&
        typeof payload.longitude === 'number'
      ) {
        setPicked(payload);
      }
    } catch {
      return;
    }
  }

  async function handleSearch() {
    setSearching(true);
    setSearchError('');
    try {
      const result = await searchPlace(query);
      if (!result) {
        setSearchError('Não encontramos esse endereço. Tente outro nome ou toque no mapa.');
        return;
      }
      setPicked(result);
      webRef.current?.injectJavaScript(
        `window.flyTo(${result.latitude}, ${result.longitude}); true;`,
      );
    } catch {
      setSearchError('Não foi possível buscar o endereço agora.');
    } finally {
      setSearching(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-white pt-12">
        <Text className="px-4 text-lg font-bold text-slate-900">{title}</Text>
        <Text className="mt-1 px-4 text-sm text-slate-500">
          Busque o endereço ou toque no mapa para posicionar o pino. Arraste o
          pino para ajustar.
        </Text>
        <View className="mt-3 flex-row items-center gap-2 px-4">
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Rua, bairro, cidade"
            placeholderTextColor="#94A3B8"
            className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900"
          />
          <Pressable
            onPress={handleSearch}
            disabled={searching}
            className="h-12 items-center justify-center rounded-2xl bg-brand px-4">
            {searching ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-sm font-bold text-white">Buscar</Text>
            )}
          </Pressable>
        </View>
        {searchError ? (
          <Text className="mt-2 px-4 text-sm text-amber-800">{searchError}</Text>
        ) : null}
        <WebView
          key={`${visible}-${initialCoords?.latitude ?? 'br'}-${initialCoords?.longitude ?? 'br'}`}
          ref={webRef}
          className="mt-3 flex-1"
          originWhitelist={['*']}
          source={{ html }}
          onMessage={handleMessage}
          javaScriptEnabled
          setSupportMultipleWindows={false}
        />
        <View className="flex-row gap-2 px-4 py-4">
          <Pressable
            onPress={onClose}
            className="flex-1 items-center rounded-2xl border border-slate-300 py-4">
            <Text className="text-base font-bold text-slate-700">Cancelar</Text>
          </Pressable>
          <Pressable
            disabled={!picked}
            onPress={() => {
              if (picked) {
                onConfirm(picked);
              }
            }}
            className={`flex-1 items-center rounded-2xl py-4 ${
              picked ? 'bg-brand' : 'bg-slate-300'
            }`}>
            <Text className="text-base font-bold text-white">Confirmar no mapa</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
