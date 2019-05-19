import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';


// Providers
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { CallNumber } from '@ionic-native/call-number/ngx';
import {
    GoogleMaps,
    GoogleMap,
    GoogleMapsEvent,
    LatLng,
    MarkerOptions,
    Marker, GoogleMapOptions
} from '@ionic-native/google-maps';
import { NativeGeocoder } from '@ionic-native/native-geocoder/ngx';

// Services
import { MapsService } from '../../Services/maps/maps.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {
    @ViewChild('Map') mapElement: ElementRef;
    private minDistanceBetweenOriginAndDestination: number = 0.2;
    private myLocation: LatLng;
    private clientLocation; LatLng;
    private marker: Marker;
    private loading: boolean = true;
    private clientData: any = null; // Gotta define this stucture
    private markersAndRouteDisplayed: boolean = false;

    constructor(
        private geolocation: Geolocation,
        private route: ActivatedRoute,
        private geocoder: NativeGeocoder,
        private mapsService: MapsService,
        private navCtrl: NavController,
        private alertCtrl: AlertController,
        private callNumber: CallNumber,
        private zone: NgZone
        ) { }

    ngOnInit() {
        this.route.queryParams.subscribe((params: any) => {
            this.clientData = params;
        });
        this.getMarkersPosition()
            .then(() => {
                console.log(this.clientLocation);
                this.loadMap();
            });
    }

    getMarkersPosition() {
        return new Promise((resolve) => {
            // Get Deliveryman position
            this.geolocation.getCurrentPosition()
                .then((position: any) => {
                    const { latitude, longitude } = position.coords; // My position
                    this.myLocation = new LatLng(latitude, longitude);
                    this.getClientPosition()
                        .then(() => {
                            resolve();
                        });
                });
        });
    }

    getClientPosition() {
        // Get client position based on the direction
        return new Promise((resolve) => {
            this.geocoder.forwardGeocode(this.clientData.direction)
                .then((data: any) => {
                    console.log('geocoder response: ', data);
                    if (data.length) {
                        console.log('si hubo respuesta');
                        const { latitude , longitude } = data[0]; // Client position
                        this.clientLocation = new LatLng(latitude, longitude);
                        resolve();
                    } else {
                        // Was not possible to get direction
                        // This loop could kill the app, just a temporal solution
                        console.log('no hubo');
                        this.getClientPosition()
                            .then(() => {
                                resolve();
                            });
                    }
                });
        });
    }

    loadMap() {
        const mapOptions: GoogleMapOptions = {
            camera: {
                target: this.myLocation,
                zoom: 18
            }
        };
        const map = GoogleMaps.create('map', mapOptions); // Seems like the parameter is the id

        map.one( GoogleMapsEvent.MAP_READY ).then( ( data: any ) => {
            this.loading = false;
            // Start watching position
            this.watchUserPosition(map);

            // In order to be used in the google API Request
            const originString: string = this.myLocation.lat.toString() + ',' + this.myLocation.lng;
            const destinationString: string = this.clientLocation.lat.toString() + ',' + this.clientLocation.lng;

            this.mapsService.getBoundariesAndDrawInitialPolyline(map, originString, destinationString)
                .then((googleResponse: any) => {
                    console.log('goog', googleResponse);
                    const boundsOfRoute: Array<LatLng> = [];
                    boundsOfRoute.push(googleResponse.routes[0].bounds.northeast);
                    boundsOfRoute.push(googleResponse.routes[0].bounds.southwest);

                    // So it fix better to the screen
                    // Still gotta find better values
                    const offSetValue: number = 0.001;
                    boundsOfRoute[0].lat += offSetValue + 0.007;
                    boundsOfRoute[0].lng += offSetValue;
                    boundsOfRoute[1].lat -= offSetValue + 0.003;
                    boundsOfRoute[1].lng -= offSetValue;

                    // Set Camera too look the route
                    map.animateCamera({
                        target: boundsOfRoute,
                        duration: 2000
                    })
                        .then(() => {
                         this.markersAndRouteDisplayed = true;
                        });
                });

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

    async finishDelivery() {
        const distance = this.mapsService.distanceBetweenCoordinates(this.myLocation, this.clientLocation);
        if (distance > this.minDistanceBetweenOriginAndDestination) {
            const alert: any = await this.alertCtrl.create({
                header: '¿Estás seguro de finalizar el pedido?',
                message: 'Parece que no estás en la ubicación indicada por el cliente',
                buttons: [
                    {
                        text: 'Cancelar',
                        role: 'cancel',
                        cssClass: 'secondary'
                    },
                    {
                        text: 'Confirmar',
                        handler: () => {
                            this.zone.run(() => {
                                this.navCtrl.navigateRoot('/home');
                            });
                        }
                    }
                ]
            });
            await alert.present();
        }
    }

    call() {
        console.log('trynna call');
        this.callNumber.callNumber(this.clientData.phone, true);
    }

}
