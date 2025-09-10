import React, { useRef, useEffect } from 'react';

console.log('[GooglePlacesAutocomplete] Component mounted/rendered');

export interface PlaceDetails {
  provider: string;
  provider_place_id: string;
  name: string;
  formatted_address: string;
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
  country?: string;
}

interface GooglePlacesAutocompleteProps {
  apiKey: string;
  onSelect: (place: PlaceDetails) => void;
  placeholder?: string;
}

export const GooglePlacesAutocomplete: React.FC<GooglePlacesAutocompleteProps> = ({ apiKey, onSelect, placeholder }) => {
  console.log('Google Maps API Key:', apiKey); // Debug log
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  useEffect(() => {
    // Debug: check if window.google exists
    const win = window as any;
    console.log('[GooglePlacesAutocomplete] window.google:', !!win.google);
    if (!win.google) {
      console.log('[GooglePlacesAutocomplete] Injecting Google Maps script...');
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.onload = () => {
        console.log('[GooglePlacesAutocomplete] Google Maps script loaded.');
        initAutocomplete();
      };
      script.onerror = (e) => {
        console.error('[GooglePlacesAutocomplete] Google Maps script failed to load:', e);
      };
      document.body.appendChild(script);
    } else {
      console.log('[GooglePlacesAutocomplete] Google Maps already loaded.');
      initAutocomplete();
    }
    // eslint-disable-next-line
  }, []);

  function initAutocomplete() {
    const win = window as any;
    if (!inputRef.current) {
      console.warn('[GooglePlacesAutocomplete] inputRef.current is null.');
      return;
    }
    if (!win.google) {
      console.warn('[GooglePlacesAutocomplete] window.google is not available.');
      return;
    }
    console.log('[GooglePlacesAutocomplete] Initializing Autocomplete...');
    autocompleteRef.current = new win.google.maps.places.Autocomplete(inputRef.current, {
      types: ['establishment', 'geocode'],
      componentRestrictions: { country: 'uk' }, // Change as needed
    });
    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current.getPlace();
      if (!place.geometry) return;
      const details: PlaceDetails = {
        provider: 'google',
        provider_place_id: place.place_id,
        name: place.name || place.formatted_address,
        formatted_address: place.formatted_address || '',
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng(),
        city: place.address_components?.find((c: any) => c.types.includes('locality'))?.long_name,
        region: place.address_components?.find((c: any) => c.types.includes('administrative_area_level_1'))?.long_name,
        country: place.address_components?.find((c: any) => c.types.includes('country'))?.long_name,
      };
      onSelect(details);
    });
  }

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder={placeholder || 'Search for a location...'}
      className="h-12 bg-muted/50 border-border/50 focus:border-event-primary transition-colors w-full px-4 rounded"
      autoComplete="off"
    />
  );
};
