import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import {NavController, AlertController, Platform } from '@ionic/angular';
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
import {
    BackgroundGeolocation,
    BackgroundGeolocationConfig,
    BackgroundGeolocationResponse,
    BackgroundGeolocationEvents
} from '@ionic-native/background-geolocation/ngx';

// Services
import { MapsService } from '../../Services/maps/maps.service';
import { SocketService } from '../../Services/socket/socket.service';
import { DeliveryStatusService } from '../../Services/delivery-status/delivery-status.service';

// Models
import { SocketData } from '../../Interfaces/socket-data';
import { OrderStatusData } from '../../Interfaces/order-status-data';

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
    private map: any;
    private marker: Marker;
    private loading: boolean = true;
    private clientData: any = null; // Gotta define this stucture
    private markersAndRouteDisplayed: boolean = false;
    private locationUpdateInterval: any = null;
    private lastTimeStamp: number = null; // To prevent sending the same location more than twice
    private updateLocationFrequenzy: number = 10000; // Milliseconds it will take to make a new location update

    constructor(
        private geolocation: Geolocation,
        private route: ActivatedRoute,
        private geocoder: NativeGeocoder,
        private mapsService: MapsService,
        private navCtrl: NavController,
        private alertCtrl: AlertController,
        private callNumber: CallNumber,
        private zone: NgZone,
        private socket: SocketService,
        private platform: Platform,
        private backgroundGeolocation: BackgroundGeolocation,
        private deliveryStatus: DeliveryStatusService
        ) {}

    ngOnInit() {
        this.backgroundGeolocationInit();
        this.route.queryParams.subscribe((params: any) => {
            this.clientData = params;
        });
        this.getMarkersPosition()
            .then(() => {
                this.loadMap();
            });
    }

    ionViewWillLeave() {
        clearInterval(this.locationUpdateInterval);
        this.socket.disconnect();
        this.backgroundGeolocation.stop();
    }

    getMarkersPosition() {
        return new Promise((resolve) => {
            // Get Deliveryman position
            this.geolocation.getCurrentPosition()
                .then((position: any) => {
                    const { latitude, longitude } = position.coords; // My position
                    this.myLocation = new LatLng(latitude, longitude);
                    this.getClientPosition(0)
                        .then(() => {
                            resolve();
                        });
                });
        });
    }

    // Separated 'cause I need a recursive function
    getClientPosition(tries: number) {
        // Get client position based on the direction
        return new Promise((resolve) => {
            this.geocoder.forwardGeocode(this.clientData.direction)
                .then((data: any) => {
                    console.log('geocoder succesfull response: ', data);
                    const { latitude , longitude } = data[0]; // Client position
                    this.clientLocation = new LatLng(latitude, longitude);
                    resolve();
                })
                .catch(async (error) => {
                    console.log('geocoder error:', error);
                    if (error !== 'Geocoder:getFromLocationName Error: grpc failed') { // Error of the plugin, require asking twice
                        const msg = 'Ha ocurrido un error al intentar obtener la posición del cliente, revisa tu conneción a internet';
                        this.showErrorMessage(msg);
                    } else {
                        // Was not possible to get direction 'cause Geocoder:getFromLocationName Error: grpc failed
                        // This loop could kill the app, just a temporal solution
                        if (tries <= 3) {
                            setTimeout(() => {
                                this.getClientPosition(tries + 1)
                                    .then(() => {
                                        resolve();
                                    });
                            }, 1000);
                        } else {
                            const msg = 'Ocurrió un error inesperado, vuelve a intentar en unos segundos';
                            this.showErrorMessage(msg);
                        }
                    }
                });
        });
    }

    async showErrorMessage(message: string) {
        const alert: any = await this.alertCtrl.create({
            header: '¡Vaya!... ha ocurrido un error',
            message,
            buttons: [
                {
                    text: 'Aceptar',
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

    loadMap() {
        const mapOptions: GoogleMapOptions = {
            camera: {
                target: this.myLocation,
                zoom: 18
            }
        };
        this.map = GoogleMaps.create('map', mapOptions); // Seems like the parameter is the id

        this.map.one( GoogleMapsEvent.MAP_READY ).then( ( data: any ) => {
            this.loading = false;
            // Start socket connection
            const initData: SocketData = {
                order: this.clientData.deliveryId,
                deliveryGuyId: this.clientData.deliveryGuyId, // Delivery guy id
                lat: this.myLocation.lat,
                lng: this.myLocation.lng
            };
            console.log('here', initData);
            this.socket.connect(initData); // Hardcoded id
            // Start watching position
            this.watchUserPosition();
            // this.startPolylineInterval(map);

            // In order to be used in the google API Request
            const originString: string = this.myLocation.lat.toString() + ',' + this.myLocation.lng;
            const destinationString: string = this.clientLocation.lat.toString() + ',' + this.clientLocation.lng;

            this.mapsService.getBoundariesAndDrawInitialPolyline(this.map, originString, destinationString)
                .then((googleResponse: any) => {
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
                    this.map.animateCamera({
                        target: boundsOfRoute,
                        duration: 2000
                    })
                        .then(() => {
                         this.markersAndRouteDisplayed = true;
                        });
                });

            const markerOptions: MarkerOptions = {
                position: this.myLocation,
                icon: 'assets/images/carIcon.png',
                title: 'Tu ubicación'
            };

            this.map.addMarker( markerOptions )
                .then( ( marker: Marker ) => {
                    this.marker = marker;
                    console.log('inside', marker);
                });

            const markerOptions2: MarkerOptions = {
                position: this.clientLocation,
                icon: 'assets/images/marker.png',
                title: 'Cliente'
            };

            this.map.addMarker( markerOptions2 );
        })
        .catch((error) => {
           console.log(error);
        });
    }

    watchUserPosition(): void {
        this.locationUpdateInterval  = setInterval(() => {
            console.log('se ejecuta el intervalo');
            this.geolocation.getCurrentPosition()
                .then((position) => {
                    console.log('la posicion obtenida fue:', position);
                    if (position.timestamp !== this.lastTimeStamp) {
                        this.lastTimeStamp = position.timestamp;
                        const {latitude, longitude} = position.coords;
                        this.myLocation = new LatLng(latitude, longitude);
                        console.log('new location', this.myLocation);
                        const socketData: SocketData = {
                            order: this.clientData.deliveryId,
                            deliveryGuyId: this.clientData.deliveryGuyId, // Delivery guy id
                            lat: latitude,
                            lng: longitude
                        };

                        this.socket.send('position', socketData);
                        if (this.marker) {
                            const originString: string = this.myLocation.lat.toString() + ',' + this.myLocation.lng;
                            const destinationString: string = this.clientLocation.lat.toString() + ',' + this.clientLocation.lng;
                            this.mapsService.drawPolyline(this.map, originString, destinationString)
                                .catch((error) => {
                                    console.log(error);
                                });
                            this.marker.setPosition(this.myLocation);
                        }
                    }
                })
                .catch((error) => {
                    console.log('Interval current position error:', error);
                });
        }, this.updateLocationFrequenzy);
    }

    backgroundGeolocationInit() {

        const config: BackgroundGeolocationConfig = {
            desiredAccuracy: 10,
            stationaryRadius: 1,
            distanceFilter: 30,
            interval: 10000,
            notificationTitle: 'Orfood',
            notificationText: 'Aplicación en segundo plano',
            debug: false, //  enable this hear sounds for background-geolocation life-cycle.
            stopOnTerminate: true, // enable this to clear background location settings when the app terminates
        };

        this.backgroundGeolocation.configure(config)
            .then(() => {

                this.backgroundGeolocation.on(BackgroundGeolocationEvents.location).subscribe((location: BackgroundGeolocationResponse) => {
                    //if (location.time !== this.lastTimeStamp) {
                        this.lastTimeStamp = location.time;
                        const {latitude, longitude} = location;
                        this.myLocation = new LatLng(latitude, longitude);
                        const msg: SocketData = {
                            order: this.clientData.deliveryId,
                            deliveryGuyId: this.clientData.deliveryGuyId, // Delivery guy id
                            lat: latitude,
                            lng: longitude
                        };
                        this.socket.send('position', msg);
                    // }
                });

            });

        this.platform.ready()
            .then(() => {
                this.platform.pause.subscribe(() => {
                    this.backgroundGeolocation.start();
                });
                this.platform.resume.subscribe(() => {
                    this.backgroundGeolocation.stop();
                });
            });
    }

  /*  startPolylineInterval(map: any) {
        const originString: string = this.myLocation.lat.toString() + ',' + this.myLocation.lng;
        const destinationString: string = this.clientLocation.lat.toString() + ',' + this.clientLocation.lng;
        const polylineInterval = setInterval(() => {
            console.log('polyline redrwan');
            this.mapsService.drawPolyline(map, originString, destinationString);
        }, 60000);
    }*/

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
                                const updateData: OrderStatusData = {
                                    orderId: this.clientData.deliveryId,
                                    wcStatus: 'finished'
                                };
                                this.deliveryStatus.updateStatus(updateData)
                                    .then(() => {
                                        this.navCtrl.navigateRoot('/home');
                                    });
                            });
                        }
                    }
                ]
            });
            await alert.present();
        } else {
            const updateData: OrderStatusData = {
                orderId: this.clientData.deliveryId,
                wcStatus: 'finished'
            };
            this.deliveryStatus.updateStatus(updateData)
                .then(() => {
                    this.navCtrl.navigateRoot('/home');
                });
        }
    }

    locateMe() {
        this.map.animateCamera({
            target: this.myLocation,
            duration: 2000
        });
    }

    call() {
        console.log('trynna call');
        this.callNumber.callNumber(this.clientData.phone, true);
    }

}
