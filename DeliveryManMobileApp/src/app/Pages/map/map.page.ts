import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';


// Providers
import { Geolocation } from '@ionic-native/geolocation/ngx';
import {
    GoogleMaps,
    GoogleMap,
    GoogleMapsEvent,
    LatLng,
    MarkerOptions,
    Marker
} from '@ionic-native/google-maps';
import { NativeGeocoder } from '@ionic-native/native-geocoder/ngx';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {
    @ViewChild('Map') mapElement: ElementRef;
    private myLocation: LatLng;
    private clientLocation; LatLng;
    private marker: Marker;
    private loading: boolean = true;
    private clientData: any = null;

    constructor(
        private geolocation: Geolocation,
        private route: ActivatedRoute,
        private geocoder: NativeGeocoder,
        ) { }

    ngOnInit() {
        this.route.queryParams.subscribe((params: any) => {
            this.clientData = params;
        });
        this.getMarkersPosition()
            .then(() => {
                this.loadMap();
            });
    }

    getMarkersPosition() {
        return new Promise((resolve) => {
            // Get Deliveryman position
            this.geolocation.getCurrentPosition()
                .then((position: any) => {
                    const { latitude, longitude } = position.coords;
                    this.myLocation = new LatLng(latitude, longitude);
                    // Get client position based on the direction
                    this.geocoder.forwardGeocode(this.clientData.direction)
                        .then((data: any) => {
                            console.log('geocoder response: ', data);
                            if (data) {
                                const { latitude , longitude } = data[0];
                                this.clientLocation = new LatLng(latitude, longitude);
                                resolve();
                            } else {
                                // Was not possible to get direction
                                resolve();
                            }
                        });
                });
        });
    }

    loadMap() {
        const map = GoogleMaps.create('map'); // Seems like the parameter is the id

        map.one( GoogleMapsEvent.MAP_READY ).then( ( data: any ) => {
            this.loading = false;
            // Start watching position
            this.watchUserPosition(map);
            const position = {
                target: this.myLocation,
                zoom: 16
            };
            map.animateCamera( position );

            const markerOptions: MarkerOptions = {
                position: this.myLocation,
                icon: 'assets/images/marker.png',
                title: 'Me'
            };

            map.addMarker( markerOptions )
                .then( ( marker: Marker ) => {
                    this.marker = marker;
                    console.log('inside', marker);
                });

            const markerOptions2: MarkerOptions = {
                position: this.clientLocation,
                icon: 'assets/images/marker.png',
                title: 'Client'
            };

            map.addMarker( markerOptions2 );

            const originString: string = this.myLocation.lat.toString() + ',' + this.myLocation.lng;
            // this.polylineService.drawPolyline(map, originString, '3.3681527,-76.5195325');
            /* map.addPolyline({
                 points: [
                     { lat: this.myLocation.lat, lng: this.myLocation.lng },
                     { lat: this.myLocation.lat + 0.001, lng: this.myLocation.lng + 0.001 }
                 ],
                 geodesic: true,
                 strokeColor: '#000',
                 strokeWeight: 2
             });*/
        });
    }
    watchUserPosition(map: any): void {
        const watch = this.geolocation.watchPosition();
        watch.subscribe((data) => {
            const { latitude, longitude } = data.coords;
            // data can be a set of coordinates, or an error (if an error occurred).
            // data.coords.latitude
            // data.coords.longitude
            const tempMyLocation = this.myLocation;
            this.myLocation = new LatLng(latitude, longitude);
            console.log(Math.abs(this.myLocation.lat - tempMyLocation.lat));
            console.log(Math.abs(this.myLocation.lng - tempMyLocation.lng));
            // This should not be implemented
           /* if (Math.abs(this.myLocation.lat - tempMyLocation.lat) > 0.0009
                || Math.abs(this.myLocation.lng - tempMyLocation.lng) > 0.0009) {
                const originString: string = this.myLocation.lat.toString() + ',' + this.myLocation.lng;
                this.polylineService.drawPolyline(map, originString, '3.3681527,-76.5195325');
            }*/
            console.log(data);
            if (this.marker) {
                this.marker.setPosition(this.myLocation);
            }
        });
    }

}
