import React, { useState, useEffect, useRef } from 'react';
import './NewPanel.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from '@icons/icons';
import { faBuilding, faBed, faBriefcaseMedical, faBus, faPlus, faMinus, faCompress, faXmark, faFilter, faTriangleExclamation, faBookOpen, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useThemeContext } from '../../context/ThemeContext';
import SmartCampusCalendar from './SmartCampusCalendar';
const getIconHtml = (faIcon, bgColor, color) => {
  const [width, height, , , svgPath] = faIcon.icon;
  const svg = `<svg viewBox="0 0 ${width} ${height}" width="16" height="16" fill="currentColor"><path d="${svgPath}"></path></svg>`;
  return `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 40px; height: 50px; transition: transform 0.2s ease-in-out;" class="marker-hover-anim">
      <div style="width: 36px; height: 36px; background-color: ${bgColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: ${color}; box-shadow: 0 4px 6px rgba(0,0,0,0.3); transition: background-color 0.2s ease;">
        ${svg}
      </div>
      <div style="width: 8px; height: 8px; background-color: ${bgColor}; border-radius: 50%; margin-top: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>
    </div>
  `;
};

const createCustomIcon = (faIcon, isDark) => {
  const bgColor = isDark ? '#11100F' : '#172A3A';
  const color = isDark ? '#D7D1B0' : '#FFFFFF';
  return new L.DivIcon({
    className: 'custom-leaflet-marker',
    html: getIconHtml(faIcon, bgColor, color),
    iconSize: [40, 50],
    iconAnchor: [20, 50],
    popupAnchor: [0, -32] // Środek kółka markera, żeby pigułka idealnie go przykryła
  });
};

const ciechanowCenter = [52.883, 20.615];
const mlawaCenter = [53.106475, 20.391089];

const ciechanowMarkers = [
  { id: 1, pos: [52.881142, 20.604105], name: "Wydział Inżynierii i Ekonomii PANSIM", details: "ul. Gabriela Narutowicza 9", icon: faBuilding },
  { id: 2, pos: [52.882412, 20.602960], name: "Dom Studenta", details: "ul. Gabriela Narutowicza 4A", icon: faBed },
  { id: 3, pos: [52.886810, 20.626166], name: "Wydział Nauk o Zdrowiu", details: "ul. Wojska Polskiego 51", icon: faBriefcaseMedical },
  { id: 4, pos: [52.88293477, 20.60585100], name: "Przystanek autobusowy", details: "ul. Narutowicza", icon: faBus },
  { id: 5, pos: [52.8835546, 20.6038586], name: "Przystanek autobusowy", details: "ul. Narutowicza", icon: faBus },
  { id: 6, pos: [52.879784, 20.600218], name: "Przystanek autobusowy", details: "ul. 17 Stycznia", icon: faBus },
  { id: 7, pos: [52.878978, 20.601358], name: "Przystanek autobusowy", details: "ul. 17 Stycznia", icon: faBus }
];

const mlawaMarkers = [
  { id: 8, pos: [53.106475, 20.391089], name: "Filia w Mławie PANSIM", details: "Wydział w Mławie", icon: faBuilding },
  { id: 9, pos: [53.1071861, 20.3899015], name: "Przystanek autobusowy", details: "Mława", icon: faBus },
  { id: 10, pos: [53.1073922, 20.3890411], name: "Przystanek autobusowy", details: "Mława", icon: faBus }
];

function MapController({ city }) {
  const map = useMap();
  useEffect(() => {
    // Zamknij ewentualne popupy przy zmianie miasta
    map.closePopup();

    if (city === 'Ciechanów') {
      map.setMaxBounds([
        [52.865, 20.590],
        [52.895, 20.640]
      ]);
      map.flyTo(ciechanowCenter, 15, { duration: 1.5 });
    } else {
      map.setMaxBounds([
        [53.096, 20.371],
        [53.116, 20.411]
      ]);
      map.flyTo(mlawaCenter, 17, { duration: 1.5 });
    }
  }, [city, map]);
  return null;
}

function MapPopupZoomHandler({ city }) {
  const map = useMap();

  useEffect(() => {
    const onPopupOpen = (e) => {
      const marker = e.popup._source;
      if (marker && marker.getLatLng) {
        const latlng = marker.getLatLng();
        // Lekko offsetujemy center żeby dymek był na środku
        map.flyTo([latlng.lat, latlng.lng], 18, { duration: 0.5 });
      }
    };

    const onPopupClose = () => {
      // Nie wracamy do domyślnego przybliżenia po zamknięciu dymka, zostajemy na klikniętym budynku
      // (zgodnie z życzeniem usunięto irytujące oddalanie przy zamykaniu popupu)
    };

    map.on('popupopen', onPopupOpen);
    map.on('popupclose', onPopupClose);

    return () => {
      map.off('popupopen', onPopupOpen);
      map.off('popupclose', onPopupClose);
    };
  }, [map, city]);

  return null;
}

function CustomZoomControl({ isDark }) {
  const map = useMap();
  const controlRef = useRef(null);

  useEffect(() => {
    if (controlRef.current) {
      L.DomEvent.disableClickPropagation(controlRef.current);
      L.DomEvent.disableScrollPropagation(controlRef.current);
    }
  }, []);

  return (
    <div className="map_floating_ui map_bottom_right" ref={controlRef}>
      <div className="custom_zoom_control">
        <button onClick={() => map.zoomIn()} className="glass_panel" style={{ background: isDark ? 'rgba(32, 31, 30, 0.7)' : 'rgba(255, 255, 255, 0.75)', color: isDark ? '#FFFFFF' : '#11100F' }}><FontAwesomeIcon icon={faPlus} /></button>
        <button onClick={() => map.zoomOut()} className="glass_panel" style={{ background: isDark ? 'rgba(32, 31, 30, 0.7)' : 'rgba(255, 255, 255, 0.75)', color: isDark ? '#FFFFFF' : '#11100F' }}><FontAwesomeIcon icon={faMinus} /></button>
      </div>
    </div>
  );
}

function BetaWarning({ isDark }) {
  const controlRef = useRef(null);

  useEffect(() => {
    if (controlRef.current) {
      L.DomEvent.disableClickPropagation(controlRef.current);
      L.DomEvent.disableScrollPropagation(controlRef.current);
    }
  }, []);

  return (
    <div className="map_bottom_left" ref={controlRef}>
      <div 
        className="map_attribution glass_panel"
        style={{ 
          background: isDark ? 'rgba(32, 31, 30, 0.7)' : 'rgba(255, 255, 255, 0.75)', 
          color: isDark ? '#FFFFFF' : '#11100F',
          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)'
        }}
      >
        &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>
      </div>
      <div 
        className="map_beta_warning glass_panel" 
        style={{ 
          background: isDark ? 'rgba(32, 31, 30, 0.7)' : 'rgba(255, 255, 255, 0.75)', 
          color: isDark ? '#FFFFFF' : '#11100F',
          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)'
        }}
      >
        <FontAwesomeIcon icon={faTriangleExclamation} style={{ color: isDark ? '#F59E0B' : '#D97706' }} />
        <span>Mapa w wersji Beta. Możliwe błędy i niedokładności.</span>
      </div>
    </div>
  );
}

function LocationHandler({ trigger, isDark }) {
  const map = useMap();
  const [position, setPosition] = useState(null);

  useEffect(() => {
    if (trigger > 0) {
      map.locate({ setView: true, maxZoom: 17, enableHighAccuracy: true });
    }
  }, [trigger, map]);

  useEffect(() => {
    const onLocationFound = (e) => {
      setPosition(e.latlng);
    };
    const onLocationError = (e) => {
      console.warn("Lokalizacja niedostępna:", e.message);
    };

    map.on('locationfound', onLocationFound);
    map.on('locationerror', onLocationError);

    return () => {
      map.off('locationfound', onLocationFound);
      map.off('locationerror', onLocationError);
    };
  }, [map]);

  return position === null ? null : (
    <Marker position={position}>
      <Popup className={`custom-popup ${isDark ? 'dark' : 'light'}`} closeButton={false}>
        <div style={{ padding: '8px 12px', fontFamily: 'Space Grotesk, sans-serif', color: isDark ? '#FFFFFF' : '#11100F' }}>
          <strong>Tu jesteś!</strong>
        </div>
      </Popup>
    </Marker>
  );
}

function MapSelectionHandler({ selectedMarker, markerRefs }) {
  const map = useMap();
  useEffect(() => {
    if (selectedMarker) {
      map.flyTo(selectedMarker.pos, 18, { duration: 0.5 });
      // Poczekaj chwilę, aż skończy się animacja "flyTo" i otwórz popup
      const timer = setTimeout(() => {
        const markerObj = markerRefs.current[selectedMarker.id];
        if (markerObj) {
          markerObj.openPopup();
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [selectedMarker, map, markerRefs]);
  return null;
}

const getBuildingPolygon = (id, center) => {
  const customPolygons = {
    1: [
      [52.8811097, 20.6031334], [52.8809623, 20.6035722], [52.8809773, 20.6035864], [52.8809698, 20.603611], [52.8811108, 20.6037365], [52.8811884, 20.6035017], [52.8812594, 20.6035659], [52.8812116, 20.6037162], [52.8811864, 20.6036959], [52.8810966, 20.6039697], [52.8810558, 20.6039321], [52.8810317, 20.6039528], [52.8810132, 20.6039881], [52.8810049, 20.6040342], [52.8810072, 20.6040841], [52.8810484, 20.6041232], [52.8809091, 20.6045422], [52.8809222, 20.6045532], [52.8808773, 20.6046886], [52.8809987, 20.6047941], [52.8811818, 20.6042391], [52.8812036, 20.604259], [52.8812202, 20.6042483], [52.8812351, 20.6042314], [52.8812554, 20.6041716], [52.8812566, 20.6041416], [52.8812536, 20.6041117], [52.8812313, 20.6040902], [52.8813202, 20.6038193], [52.8813088, 20.6038065], [52.8813596, 20.6036559], [52.8813902, 20.6036847], [52.8814673, 20.6034539], [52.8811097, 20.6031334]
    ],
    2: [
      [[52.8824681, 20.6027009], [52.8825602, 20.6027877], [52.8825141, 20.6029221], [52.8824467, 20.6031184], [52.8822643, 20.6036513], [52.8821737, 20.6035701], [52.8824681, 20.6027009]],
      [[52.8826568, 20.6028667], [52.8826891, 20.6028971], [52.8827565, 20.6029607], [52.8825819, 20.6034695], [52.8824822, 20.6033756], [52.8825402, 20.6032065], [52.8826076, 20.6030102], [52.8826568, 20.6028667]],
      [[52.8825402, 20.6032065], [52.8824467, 20.6031184], [52.8825141, 20.6029221], [52.8826076, 20.6030102], [52.8825402, 20.6032065]],
      [[52.8827565, 20.6029607], [52.8827921, 20.6028571], [52.8827246, 20.6027935], [52.8826891, 20.6028971], [52.8827565, 20.6029607]]
    ],
    3: [
      [52.8869951, 20.6255596], [52.8869642, 20.6255621], [52.8869174, 20.6258052], [52.8869367, 20.6258168], [52.8868835, 20.6260579], [52.8867373, 20.6259692], [52.8867566, 20.6258819], [52.8867611, 20.6258848], [52.8868215, 20.6256192], [52.886736, 20.6255675], [52.8866759, 20.6258318], [52.8866805, 20.6258348], [52.8866595, 20.625922], [52.8866545, 20.625919], [52.8866025, 20.6261531], [52.8869822, 20.6263832], [52.8870349, 20.6261496], [52.8870007, 20.6261289], [52.8870547, 20.6258882], [52.8870733, 20.6258994], [52.8871319, 20.6256624], [52.8870934, 20.6256059], [52.8870491, 20.6255766], [52.887023, 20.6255653], [52.8869951, 20.6255596]
    ],
    8: [
      [53.1064247, 20.3911991], [53.1064814, 20.391222], [53.1064731, 20.3912762], [53.1067561, 20.3913951], [53.1067566, 20.3913914], [53.1068263, 20.3914207], [53.106857, 20.3912193], [53.1067872, 20.39119], [53.1067877, 20.3911862], [53.1065053, 20.3910664], [53.1065074, 20.3910529], [53.1064493, 20.3910286], [53.1064477, 20.3910388], [53.1063499, 20.3909982], [53.1063373, 20.3909929], [53.1062975, 20.3912549], [53.1061942, 20.391212], [53.1061667, 20.3913931], [53.1062702, 20.3914364], [53.1062513, 20.3915604], [53.106278, 20.3915716], [53.1063627, 20.391607], [53.1063815, 20.3914832], [53.1063855, 20.3914847], [53.1064009, 20.3913829], [53.1063971, 20.3913811], [53.1064247, 20.3911991]
    ]
  };

  if (customPolygons[id]) {
    return customPolygons[id];
  }

  return null; // Zwracamy null dla budynków bez precyzyjnego obrysu, by nie rysować brzydkich kwadratów
};

function NewPanel() {
  const { theme } = useThemeContext();
  const [activeBuilding, setActiveBuilding] = useState(null);
  const [city, setCity] = useState('Ciechanów');
  const [locateTrigger, setLocateTrigger] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [filterType, setFilterType] = useState('Wszystkie');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const mapContainerRef = useRef(null);
  const markerRefs = useRef({});
  const filterRef = useRef(null);

  const isDark = theme === 'dark' || theme === 'halloween';

  // Optymalizacja: Zapamiętujemy ikony dla danego motywu, żeby Leaflet nie przeładowywał DOM markera przy każdym hoverze
  const markerIcons = React.useMemo(() => {
    const cache = new Map();
    return (faIcon) => {
      if (!cache.has(faIcon.iconName)) {
        cache.set(faIcon.iconName, createCustomIcon(faIcon, isDark));
      }
      return cache.get(faIcon.iconName);
    };
  }, [isDark]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };
    
    if (isFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterOpen]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (mapContainerRef.current) {
        mapContainerRef.current.requestFullscreen().catch(err => {
          console.warn(`Error attempting to enable fullscreen: ${err.message}`);
        });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const currentMarkers = city === 'Ciechanów' ? ciechanowMarkers : mlawaMarkers;

  // Znaczniki na mapie (tylko dla aktywnego miasta)
  const filteredMarkers = currentMarkers.filter(m => {
    // 1. Filtr kategorii
    if (filterType === 'Budynki uczelni' && m.icon === faBus) return false;
    if (filterType === 'Przystanki' && m.icon !== faBus) return false;

    // 2. Filtr wyszukiwania tekstowego
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return m.name.toLowerCase().includes(q) || m.details.toLowerCase().includes(q);
    }
    return true;
  });

  // Globalne wyniki wyszukiwania dla dropdowna (z obu miast!)
  const allMarkers = [
    ...ciechanowMarkers.map(m => ({ ...m, _city: 'Ciechanów' })),
    ...mlawaMarkers.map(m => ({ ...m, _city: 'Mława' }))
  ];

  const searchResults = allMarkers.filter(m => {
    if (filterType === 'Budynki uczelni' && m.icon === faBus) return false;
    if (filterType === 'Przystanki' && m.icon !== faBus) return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return m.name.toLowerCase().includes(q) || m.details.toLowerCase().includes(q);
    }
    return true;
  });

  const cartoKey = "cb1_41u0_1_18393e286d954e357e0c45ac";
  const tileUrl = isDark
    ? `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=${cartoKey}`
    : `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png?key=${cartoKey}`;

  return (
    <div className="new_panel_dashboard">

      {/* Left Sidebar */}
      <div className="new_panel_sidebar">
        
        {/* Kalendarz */}
        <SmartCampusCalendar isDark={isDark} />

        {/* Classes Card (Figma Design) */}
        <div className="new_panel_card" style={{ padding: '0', background: 'transparent', border: 'none', gap: '0' }}>
          <div className="new_panel_card_header" style={{ alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '500', color: 'var(--color-text)' }}>Dzisiejsze zajęcia</h3>
            <button className="today_plan_btn">Plan lekcji <FontAwesomeIcon icon={faChevronRight} style={{marginLeft: '6px', fontSize: '10px'}}/></button>
          </div>

          <div className="today_class_item active">
            <div className="today_class_title">Nazwa Przedmiotu • Sala</div>
            <div className="today_class_teacher">Imię Nazwisko</div>
            <div className="today_class_bottom_row">
              <div className="today_class_time">9:30 - 11:00</div>
              <div className="today_class_badge">
                <FontAwesomeIcon icon={faBookOpen} style={{marginRight: '6px', fontSize: '12px'}}/> Wykład
              </div>
            </div>
          </div>
          
          <h4 style={{ fontSize: '15px', margin: '8px 0 16px 0', color: 'var(--color-text)', fontWeight: 500 }}>Następnie</h4>
          
          <div className="today_class_item">
            <div className="today_class_title">Nazwa Przedmiotu • Sala</div>
            <div className="today_class_teacher">Imię Nazwisko</div>
            <div className="today_class_bottom_row">
              <div className="today_class_time">9:30 - 11:00</div>
              <div className="today_class_badge">
                <FontAwesomeIcon icon={faBookOpen} style={{marginRight: '6px', fontSize: '12px'}}/> Wykład
              </div>
            </div>
          </div>
          
          <div className="today_class_item">
            <div className="today_class_title">Nazwa Przedmiotu • Sala</div>
            <div className="today_class_teacher">Imię Nazwisko</div>
            <div className="today_class_bottom_row">
              <div className="today_class_time">9:30 - 11:00</div>
              <div className="today_class_badge">
                <FontAwesomeIcon icon={faBookOpen} style={{marginRight: '6px', fontSize: '12px'}}/> Wykład
              </div>
            </div>
          </div>
        </div>

        {/* Grades Card */}
        <div className="new_panel_card" style={{ visibility: 'hidden' }}>
        </div>
      </div>

      {/* Main Content Area (Map) */}
      <div className="new_panel_main">
        <div className="new_panel_map_container" ref={mapContainerRef}>

          {/* Unified Map Toolbar */}
          <div className="map_toolbar">
            {/* Search */}
            <div style={{ position: 'relative' }} className="map_toolbar_search_wrapper">
              <div className={`map_search_pill glass_panel ${isDark ? '' : 'light'} ${isSearchExpanded ? 'expanded' : ''}`} style={{ background: isDark ? 'rgba(32, 31, 30, 0.7)' : 'rgba(255, 255, 255, 0.75)', color: isDark ? 'inherit' : '#11100F' }}>
                <FontAwesomeIcon
                  icon={Icons.faSearch}
                  className="icon_dim map_search_icon_btn"
                  style={{ color: isDark ? 'var(--color-text-muted)' : '#666', cursor: 'pointer' }}
                  onClick={() => setIsSearchExpanded(prev => !prev)}
                />
                <input
                  type="text"
                  className={`map_search_input ${searchQuery.trim().length > 0 ? 'has-value' : ''}`}
                  placeholder="Szukaj na mapie..."
                  style={{ color: isDark ? 'inherit' : '#11100F' }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                />
                {searchQuery.trim().length > 0 && (
                  <FontAwesomeIcon
                    icon={faXmark}
                    className="icon_dim map_search_clear"
                    style={{ color: isDark ? 'var(--color-text-muted)' : '#666', cursor: 'pointer', padding: '0 4px' }}
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedMarker(null);
                    }}
                  />
                )}
              </div>

              {isSearchFocused && searchQuery.trim() !== '' && searchResults.length > 0 && (
                <div className="map_filter_dropdown glass_panel" style={{ background: isDark ? 'rgba(32, 31, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)', color: isDark ? '#FFF' : '#11100F', width: '100%' }}>
                  {searchResults.slice(0, 5).map(m => (
                    <div
                      key={`search-${m._city}-${m.id}`}
                      className="map_filter_option"
                      onClick={() => {
                        if (city !== m._city) {
                          setCity(m._city);
                        }
                        setTimeout(() => {
                          setSelectedMarker(m);
                        }, 50);
                        setSearchQuery(m.name);
                        setIsSearchFocused(false);
                      }}
                      style={{ padding: '8px 12px' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FontAwesomeIcon icon={m.icon} style={{ color: isDark ? 'var(--color-accent)' : 'var(--color-text-muted)', fontSize: '12px' }} />
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '13px', fontWeight: '500' }}>{m.name}</span>
                            <span style={{ fontSize: '11px', color: isDark ? '#A1A1AA' : '#666' }}>{m.details}</span>
                          </div>
                        </div>
                        <div style={{
                          fontSize: '10px',
                          padding: '2px 6px',
                          borderRadius: '10px',
                          background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                          color: isDark ? '#A1A1AA' : '#666',
                          whiteSpace: 'nowrap'
                        }}>
                          {m._city}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Filter */}
            <div style={{ position: 'relative' }} className="map_toolbar_filter_wrapper" ref={filterRef}>
              <div
                className="map_filter_pill glass_panel"
                style={{ background: isDark ? 'rgba(32, 31, 30, 0.7)' : 'rgba(255, 255, 255, 0.75)', color: isDark ? 'inherit' : '#11100F' }}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <FontAwesomeIcon icon={faFilter} className="map_filter_icon_only" style={{ color: isDark ? 'var(--color-text-muted)' : '#666' }} />
                <span className="map_filter_label">Filtruj wg: {filterType}</span>
                <FontAwesomeIcon icon={Icons.faChevronDown} className="icon_dim map_filter_chevron" style={{ color: isDark ? 'var(--color-text-muted)' : '#666', transform: isFilterOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </div>

              {isFilterOpen && (
                <div className="map_filter_dropdown glass_panel" style={{ background: isDark ? 'rgba(32, 31, 30, 0.9)' : 'rgba(255, 255, 255, 0.95)', color: isDark ? '#FFF' : '#11100F' }}>
                  {['Wszystkie', 'Budynki uczelni', 'Przystanki'].map(option => (
                    <div
                      key={option}
                      className={`map_filter_option ${filterType === option ? 'active' : ''}`}
                      onClick={() => {
                        setFilterType(option);
                        setIsFilterOpen(false);
                      }}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Spacer */}
            <div className="map_toolbar_spacer" />

            {/* City Toggle */}
            <div className="city_toggle glass_panel" style={{ background: isDark ? 'rgba(32, 31, 30, 0.7)' : 'rgba(255, 255, 255, 0.75)', color: isDark ? '#FFFFFF' : '#11100F' }}>
              <div className={`city_toggle_bg ${city === 'Mława' ? 'right' : ''}`} style={{ background: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)' }} />
              <button className={`city_toggle_btn ${city === 'Ciechanów' ? 'active' : ''}`} onClick={() => setCity('Ciechanów')}>Ciechanów</button>
              <button className={`city_toggle_btn ${city === 'Mława' ? 'active' : ''}`} onClick={() => setCity('Mława')}>Mława</button>
            </div>

            {/* Action Buttons */}
            <button className="map_action_btn glass_panel" onClick={toggleFullscreen} style={{ background: isDark ? 'rgba(32, 31, 30, 0.7)' : 'rgba(255, 255, 255, 0.75)', color: isDark ? '#FFFFFF' : '#11100F' }}>
              <FontAwesomeIcon icon={isFullscreen ? faCompress : Icons.faExpand} />
            </button>
            <button className="map_action_btn glass_panel" onClick={() => setLocateTrigger(prev => prev + 1)} style={{ background: isDark ? 'rgba(32, 31, 30, 0.7)' : 'rgba(255, 255, 255, 0.75)', color: isDark ? '#FFFFFF' : '#11100F' }}>
              <FontAwesomeIcon icon={Icons.faLocationCrosshairs} />
            </button>
          </div>

          <div className="new_panel_map_visual" style={{ zIndex: 1 }}>
            {/* klucz `tileUrl` wymusza przeładowanie komponentu Leaflet przy zmianie kafelków (motywu) */}
            <MapContainer
              key={tileUrl}
              center={ciechanowCenter}
              zoom={15}
              minZoom={14}
              maxBoundsViscosity={1.0}
              style={{ width: '100%', height: '100%', background: isDark ? '#11100F' : '#E3E8E1' }}
              zoomControl={false}
              attributionControl={false}
            >
              <LocationHandler trigger={locateTrigger} isDark={isDark} />
              <MapController city={city} />
              <MapPopupZoomHandler city={city} />
              <CustomZoomControl isDark={isDark} />
              <BetaWarning isDark={isDark} />
              <MapSelectionHandler selectedMarker={selectedMarker} markerRefs={markerRefs} />
              <TileLayer
                url={tileUrl}
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              {filteredMarkers.map(m => (
                <React.Fragment key={m.id}>
                  {/* Building Polygon (if exact polygon exists) */}
                  {getBuildingPolygon(m.id, m.pos) && (
                    <Polygon
                      positions={getBuildingPolygon(m.id, m.pos)}
                      pathOptions={{
                        stroke: false, /* Wyłącza obramowanie */
                        fillColor: activeBuilding === m.id ? '#1A4971' : '#90C3E6',
                        fillOpacity: 0.8
                      }}
                      eventHandlers={{
                        mouseover: () => setActiveBuilding(m.id),
                        mouseout: () => setActiveBuilding(null)
                      }}
                    />
                  )}

                  {/* Marker */}
                  <Marker
                    ref={(r) => markerRefs.current[m.id] = r}
                    position={m.pos}
                    icon={markerIcons(m.icon)}
                    eventHandlers={{
                      click: () => {
                        setSelectedMarker(m);
                      },
                      mouseover: () => setActiveBuilding(m.id),
                      mouseout: () => setActiveBuilding(null)
                    }}
                  >
                    <Popup className={`custom-popup ${isDark ? 'dark' : 'light'}`} closeButton={false}>
                      <div
                        style={{ display: 'flex', alignItems: 'center', height: '48px', paddingRight: '24px', cursor: 'pointer' }}
                        onClick={() => alert(`Otwierasz szczegóły dla: ${m.name}`)}
                      >
                        <div style={{
                          width: '48px', height: '48px',
                          backgroundColor: isDark ? '#11100F' : '#172A3A',
                          borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: isDark ? '#D7D1B0' : '#FFFFFF',
                          flexShrink: 0
                        }}>
                          <FontAwesomeIcon icon={m.icon} style={{ fontSize: '20px' }} />
                        </div>
                        <div style={{ paddingLeft: '12px', fontFamily: 'Space Grotesk, sans-serif', textAlign: 'left', lineHeight: '1.2' }}>
                          <strong style={{ fontSize: '14px', color: isDark ? '#FFFFFF' : '#11100F' }}>{m.name}</strong><br />
                          <span style={{ fontSize: '12px', color: isDark ? '#A1A1AA' : '#666' }}>{city} • {m.details}</span>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                </React.Fragment>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Bottom Panel */}
        <div className="new_panel_bottom_row">
          <div className="new_panel_card flex_grow" style={{ visibility: 'hidden' }}>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewPanel;
