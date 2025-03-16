import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from "@angular/core"
import { Subscription, interval } from "rxjs"
import { CommonModule } from "@angular/common"
import { MapService } from "../../services/map.service"

declare var google: any

@Component({
  selector: "app-map",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.scss"],
  standalone: true,
  imports: [CommonModule],
})
export class MapComponent {
  /*
  implements OnInit, AfterViewInit, OnDestroy
  @ViewChild("mapContainer") mapContainer!: ElementRef

  @Input() tripId!: number
  @Input() routeId!: number
  @Input() showStudentLocation = false
  @Input() studentId!: number

  map!: google.maps.Map
  busMarker!: google.maps.Marker
  studentMarker!: google.maps.Marker
  routePath!: google.maps.Polyline
  stopMarkers: google.maps.Marker[] = []

  private locationSubscription!: Subscription

  constructor(private mapService: MapService) {}

  ngOnInit(): void {
    if (this.tripId) {
      this.locationSubscription = interval(5000).subscribe(() => {
        this.updateBusLocation()
      })
    }
  }

  ngAfterViewInit(): void {
    this.initMap()
  }

  ngOnDestroy(): void {
    if (this.locationSubscription) {
      this.locationSubscription.unsubscribe()
    }
  }

  initMap(): void {
    const mapOptions: google.maps.MapOptions = {
      center: { lat: 40.7128, lng: -74.006 },
      zoom: 12,
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
    }

    this.map = new google.maps.Map(this.mapContainer.nativeElement, mapOptions)
    this.loadRouteData()
    this.updateBusLocation()
  }

  loadRouteData(): void {
    this.mapService.getRouteDetails(this.routeId).subscribe((route) => {
      if (route?.stops?.length) {
        const routeCoordinates = route.stops.map((stop: { latitude: any; longitude: any }) => ({
          lat: stop.latitude,
          lng: stop.longitude,
        }))

        this.routePath = new google.maps.Polyline({
          path: routeCoordinates,
          geodesic: true,
          strokeColor: "#3f51b5",
          strokeOpacity: 1.0,
          strokeWeight: 3,
        })

        this.routePath.setMap(this.map)

        route.stops.forEach((stop: { latitude: any; longitude: any; name: any }) => {
          const marker = new google.maps.Marker({
            position: { lat: stop.latitude, lng: stop.longitude },
            map: this.map,
            title: stop.name,
            icon: {
              url: "assets/images/bus-stop.png",
              scaledSize: new google.maps.Size(24, 24),
            },
          })
          this.stopMarkers.push(marker)
        })

        const bounds = new google.maps.LatLngBounds()
        //@ts-ignore
        routeCoordinates.forEach((coord) => bounds.extend(coord))
        this.map.fitBounds(bounds)
      }
    })
  }

  updateBusLocation(): void {
    this.mapService.getTripLocation(this.tripId).subscribe((location) => {
      if (location?.latitude && location?.longitude) {
        const position = { lat: location.latitude, lng: location.longitude }

        if (!this.busMarker) {
          this.busMarker = new google.maps.Marker({
            position,
            map: this.map,
            title: "Bus",
            icon: {
              url: "assets/images/bus.png",
              scaledSize: new google.maps.Size(32, 32),
            },
          })
        } else {
          this.busMarker.setPosition(position)
        }

        if (this.showStudentLocation && this.studentId) {
          this.mapService.getStudentAttendance(this.tripId, this.studentId).subscribe((attendance) => {
            if (attendance?.present && attendance?.boardingLocation) {
              const [lat, lng] = attendance.boardingLocation.split(",").map(Number)
              const studentPosition = { lat, lng }

              if (!this.studentMarker) {
                this.studentMarker = new google.maps.Marker({
                  position: studentPosition,
                  map: this.map,
                  title: "Student",
                  icon: {
                    url: "assets/images/student.png",
                    scaledSize: new google.maps.Size(24, 24),
                  },
                })
              }
            }
          })
        }
      }
    })
  }

   */
}
