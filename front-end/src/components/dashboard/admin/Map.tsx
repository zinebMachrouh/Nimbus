import {useCallback, useEffect, useState} from 'react';
import {DirectionsRenderer, GoogleMap, InfoWindow, Marker, Polyline, useJsApiLoader} from '@react-google-maps/api';
import {Vehicle} from '../../../core/entities/vehicle.entity';
import {useRouteService, useSchoolService, useTripService, useVehicleService} from '../../../contexts/ServiceContext';
import './Map.css';
import {School} from '../../../core/entities/school.entity';
import {Trip} from '../../../core/entities/trip.entity';
import {Coordinates} from "../../../core/entities/coordinates.entity.ts";
import {Client} from "@stomp/stompjs";

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '6px'
};

const defaultCenter = {
  lat: 33.5731104,
  lng: -7.5898434
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: true,
  mapTypeControl: true,
  fullscreenControl: true,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
};

const getGoogleMapsApiKey = (): string => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  return apiKey || 'AIzaSyA9JZYQPdYYLMLA96Qc_HYHGG2-qbiDpXA';
};

const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ['places'];

interface VehicleWithRoute extends Vehicle {
  route?: {
    id: number;
    name: string;
    stops: Array<{
      id: number;
      name: string;
      latitude: number;
      longitude: number;
    }>;
  };
}

const Map = () => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: getGoogleMapsApiKey(),
    libraries
  });

  const vehicleService = useVehicleService();
  const schoolService = useSchoolService();
  const routeService = useRouteService();
  const tripService = useTripService();
  
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [vehicles, setVehicles] = useState<VehicleWithRoute[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleWithRoute | null>(null);
  const [schoolId, setSchoolId] = useState<number>(0);
  const [schoolLocation, setSchoolLocation] = useState(defaultCenter);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [routeColors, setRouteColors] = useState<{[key: number]: string}>({});
  const [noLocationVehicles, setNoLocationVehicles] = useState<number[]>([]);
  const [school, setSchool] = useState<School | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [geometries, setGeometries] = useState<{ [tripId: string]: Coordinates[] }>({});
  const [showDebug, setShowDebug] = useState<boolean>(true);

  const routeColorPalette = [
    '#3366CC', '#DC3912', '#FF9900', '#109618', '#990099',
    '#0099C6', '#DD4477', '#66AA00', '#B82E2E', '#316395'
  ];

  useEffect(() => {
    try {
      const storedSchoolStr = localStorage.getItem("school");
      if (!storedSchoolStr) {
        console.log("No school found in localStorage, using default location");
        return;
      }
      
      const storedSchool = JSON.parse(storedSchoolStr);
      console.log("Found school in localStorage:", storedSchool);
      
      if (storedSchool && storedSchool.id) {
        setSchoolId(storedSchool.id);
        
        if (storedSchool.latitude && storedSchool.longitude) {
          const location = {
            lat: typeof storedSchool.latitude === 'string' ? parseFloat(storedSchool.latitude) : storedSchool.latitude,
            lng: typeof storedSchool.longitude === 'string' ? parseFloat(storedSchool.longitude) : storedSchool.longitude
          };
          console.log("Setting school location from localStorage:", location);
          setSchoolLocation(location);
        }
        
        schoolService.findById(storedSchool.id).then(schoolData => {
          if (schoolData) {
            console.log("Fetched school data:", schoolData);
            setSchool(schoolData);
            
            if (schoolData.latitude && schoolData.longitude) {
              const location = {
                lat: typeof schoolData.latitude === 'string' ? parseFloat(schoolData.latitude) : schoolData.latitude,
                lng: typeof schoolData.longitude === 'string' ? parseFloat(schoolData.longitude) : schoolData.longitude
              };
              console.log("Setting school location from API:", location);
              setSchoolLocation(location);
            }
          }
        }).catch(error => {
          console.error("Error fetching school:", error);
        });
      }
    } catch (error) {
      console.error("Error parsing school from localStorage:", error);
    }
  }, [schoolService]);

  useEffect(() => {
    if (isLoaded && !directionsService) {
      setDirectionsService(new window.google.maps.DirectionsService());
    }
  }, [isLoaded, directionsService]);

  useEffect(() => {
    if (schoolId) {
      console.log("Fetching data for school ID:", schoolId);
      
      tripService.findBySchoolId(schoolId).then(tripsData => {
        console.log("Fetched trips:", tripsData);
        setTrips(tripsData || []);
        
        vehicleService.findVehiclesBySchool(schoolId).then(vehiclesData => {
          console.log("Fetched vehicles:", vehiclesData);
          
          routeService.findBySchoolId(schoolId).then(routes => {
            console.log("Fetched routes:", routes);
            
            if (!vehiclesData || !vehiclesData.length) {
              console.log("No vehicles data available");
              setVehicles([]);
              return;
            }
            
            const vehiclesWithRoutes: VehicleWithRoute[] = vehiclesData.map(vehicle => {
              const vehicleTrip = (tripsData || []).find(trip => trip.vehicle?.id === vehicle.id);
              const vehicleRoute = vehicleTrip?.route || 
                (routes && routes.find(route => 
                  (tripsData || []).some(trip => trip.vehicle?.id === vehicle.id && trip.route?.id === route.id)
                ));
              
              return {
                ...vehicle,
                route: vehicleRoute
              } as VehicleWithRoute;
            });
            
            console.log("Processed vehicles with routes:", vehiclesWithRoutes);
            setVehicles(vehiclesWithRoutes);
            
            const missingLocations: number[] = [];
            vehiclesWithRoutes.forEach(vehicle => {
              if (!vehicle.currentLatitude && !vehicle.currentLongitude) {
                missingLocations.push(vehicle.id);
              }
            });
            console.log("Vehicles missing location data:", missingLocations);
            setNoLocationVehicles(missingLocations);
            
            const colors: {[key: number]: string} = {};
            vehiclesWithRoutes.forEach((vehicle, index) => {
              colors[vehicle.id] = routeColorPalette[index % routeColorPalette.length];
            });
            setRouteColors(colors);
          });
        });
      });
      
      // const interval = setInterval(() => {
        vehicleService.findVehiclesBySchool(schoolId).then(updatedVehicles => {
          if (!updatedVehicles || updatedVehicles.length === 0) {
            console.log("No updated vehicles data available");
            return;
          }

          setVehicles(prev => {
            const updated = updatedVehicles.map(vehicle => {
              const existingVehicle = prev.find(v => v.id === vehicle.id);
              return {
                ...vehicle,
                route: existingVehicle?.route
              } as VehicleWithRoute;
            });
            console.log("Updated vehicles:", updated);
            return updated;
          });

          const missingLocations: number[] = [];
          updatedVehicles.forEach(vehicle => {
            if (!vehicle.currentLatitude && !vehicle.currentLongitude) {
              missingLocations.push(vehicle.id);
            }
          });
          setNoLocationVehicles(missingLocations);
        });
      // }, 10000);
      
      // return () => clearInterval(interval);
    }
  }, [schoolId, schoolLocation, vehicleService, routeService, tripService]);

  useEffect(() => {
    if (directionsService && schoolLocation && vehicles.length > 0 && selectedVehicle) {
      if (noLocationVehicles.includes(selectedVehicle.id)) {
        setDirections(null);
        return;
      }
      
      const vehiclePosition = getVehiclePosition(selectedVehicle);
      if (!vehiclePosition) return;
      
      if (selectedVehicle.route && selectedVehicle.route.stops && selectedVehicle.route.stops.length > 0) {
        const waypoints = selectedVehicle.route.stops.map(stop => ({
          location: new google.maps.LatLng(stop.latitude, stop.longitude),
          stopover: true
        }));
        
        directionsService.route(
          {
            origin: vehiclePosition,
            destination: schoolLocation,
            waypoints: waypoints,
            optimizeWaypoints: false,
            travelMode: google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
              setDirections(result);
            } else {
              console.error(`Directions request failed: ${status}`);
              
              // Fallback to direct route if waypoints fail
              directionsService.route(
                {
                  origin: vehiclePosition,
                  destination: schoolLocation,
                  travelMode: google.maps.TravelMode.DRIVING,
                },
                (result, status) => {
                  if (status === google.maps.DirectionsStatus.OK) {
                    setDirections(result);
                  } else {
                    console.error(`Direct route request failed: ${status}`);
                    setDirections(null);
                  }
                }
              );
            }
          }
        );
      } else {
        directionsService.route(
          {
            origin: vehiclePosition,
            destination: schoolLocation,
            travelMode: google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
              setDirections(result);
            } else {
              console.error(`Directions request failed: ${status}`);
              setDirections(null);
            }
          }
        );
      }
    } else if (!selectedVehicle) {
      setDirections(null);
    }
  }, [directionsService, schoolLocation, selectedVehicle, noLocationVehicles]);

  // WebSocket connection setup
  useEffect(() => {
    // Create a new STOMP client
    const stompClient = new Client({
      // Use SockJS as the WebSocket transport
      brokerURL: "ws://localhost:8080/ws",
      // Reconnect delay in milliseconds
      reconnectDelay: 5000,
      // Heartbeat configuration
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      // Debug mode
      debug: (str) => {
        if (showDebug) {
          console.log(str)
        }
      },
    })

    // Connection established handler
    stompClient.onConnect = (frame) => {
      console.log("Connected to WebSocket:", frame)

      // Subscribe to vehicle updates topic
      stompClient.subscribe(`/topic/vehicle-locations`, (message) => {
        try {
          const position: any = JSON.parse(message.body)
          console.log("Received vehicle position update:", position)

          // Update vehicles with new position data
          setVehicles((prev) =>
              prev.map((vehicle) => {
                if (vehicle.id === position.vehicleId) {
                  return {
                    ...vehicle,
                    currentLatitude: position.coordinates.lat,
                    currentLongitude: position.coordinates.lng,
                  }
                }
                return vehicle
              }),
          )

          // Remove from noLocationVehicles if we now have a position
          setNoLocationVehicles((prev) => prev.filter((id) => id !== position.vehicleId))
        } catch (error) {
          console.error("Error processing WebSocket message:", error)
        }
      })
    }

    // Connection error handler
    stompClient.onStompError = (frame) => {
      console.error("STOMP error:", frame.headers, frame.body)
    }

    // Start the connection
    stompClient.activate()

    // Cleanup function
    return () => {
      if (stompClient.connected) {
        console.log("Disconnecting WebSocket")
        stompClient.deactivate()
      }
    }
  }, [showDebug])


  useEffect(() => {
    const fetchAllGeometries = async () => {
      const geometriesMap: { [tripId: string]: Coordinates[] } = {};
      for (const trip of trips) {
        try {
          geometriesMap[trip.id] = await tripService.fetchRouteGeometriesFromApi(trip.id);
        } catch (error) {
          console.error(`Failed to fetch geometries for trip ${trip.id}:`, error);
        }
      }

      setGeometries(geometriesMap);
    };

    fetchAllGeometries();
  }, [trips]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMarkerClick = (vehicle: VehicleWithRoute) => {
    setSelectedVehicle(vehicle);
  };
  
  const handleInfoWindowClose = () => {
    setSelectedVehicle(null);
  };

  const getVehiclePosition = (vehicle: VehicleWithRoute) => {
    if (!vehicle.currentLatitude || !vehicle.currentLongitude) {
      return null;
    }
    
    return {
      lat: typeof vehicle.currentLatitude === 'string' ? parseFloat(vehicle.currentLatitude) : vehicle.currentLatitude,
      lng: typeof vehicle.currentLongitude === 'string' ? parseFloat(vehicle.currentLongitude) : vehicle.currentLongitude
    };
  };

  const getVehicleIcon = (vehicle: VehicleWithRoute) => {
    const isSelected = selectedVehicle && selectedVehicle.id === vehicle.id;
    
    return {
      url: isSelected 
        ? 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
        : 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      scaledSize: new window.google.maps.Size(isSelected ? 50 : 40, isSelected ? 50 : 40)
    };
  };

  if (!isLoaded) return <div className="map-loading">Loading maps...</div>;

  return (
    <div className="map-wrapper">      
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={schoolLocation}
        zoom={13}
        options={mapOptions}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {trips && trips.map(trip => (
            geometries[trip.id] && (
                <Polyline
                    key={trip.id}
                    path={geometries[trip.id]}
                    options={{
                      strokeColor: selectedVehicle ? routeColors[selectedVehicle.id] : '#3366CC',
                      strokeWeight: 5,
                      strokeOpacity: 0.7,
                      geodesic: true
                    }}
                />
            )
        ))}
        {/* School marker */}
        <Marker
          position={schoolLocation}
          icon={{
            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
            scaledSize: new window.google.maps.Size(40, 40)
          }}
          title={school?.name || "School"}
        />
        
        {vehicles.filter(v => !noLocationVehicles.includes(v.id)).map(vehicle => {
          const position = getVehiclePosition(vehicle);
          if (!position) return null;
          
          return (
            <Marker
              key={vehicle.id}
              position={position}
              icon={getVehicleIcon(vehicle)}
              onClick={() => handleMarkerClick(vehicle)}
              title={`${vehicle.make} ${vehicle.model}`}
            />
          );
        })}
        
        {/* Display directions */}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              polylineOptions: {
                strokeColor: selectedVehicle ? routeColors[selectedVehicle.id] : '#3366CC',
                strokeWeight: 5,
                strokeOpacity: 0.7
              },
              suppressMarkers: true
            }}
          />
        )}
        
        {selectedVehicle && getVehiclePosition(selectedVehicle) && (
          <InfoWindow
            position={getVehiclePosition(selectedVehicle)!}
            onCloseClick={handleInfoWindowClose}
          >
            <div className="vehicle-info">
              <h4>{selectedVehicle.make} {selectedVehicle.model}</h4>
              <p>License: {selectedVehicle.licensePlate}</p>
              <p>Status: {selectedVehicle.status}</p>
              {selectedVehicle.route && (
                <p>Route: {selectedVehicle.route.name}</p>
              )}
              {directions?.routes[0]?.legs[0]?.distance?.text && (
                <p>Distance to school: {directions.routes[0].legs[0].distance.text}</p>
              )}
              {directions?.routes[0]?.legs[0]?.duration?.text && (
                <p>ETA: {directions.routes[0].legs[0].duration.text}</p>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default Map;