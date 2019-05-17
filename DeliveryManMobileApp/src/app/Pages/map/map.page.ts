import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

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

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {
    @ViewChild('Map') mapElement: ElementRef;
    private myLocation: LatLng;
    private marker: Marker;
    private loading: boolean = true;

    constructor(
        private geolocation: Geolocation,
        ) { }

    ngOnInit() {
        this.geolocation.getCurrentPosition()
            .then((position: any) => {
                const { latitude, longitude } = position.coords
                this.myLocation = new LatLng(latitude, longitude);
                this.loadMap();
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
