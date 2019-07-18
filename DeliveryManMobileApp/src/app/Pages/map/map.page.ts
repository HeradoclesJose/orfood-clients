import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import {NavController, AlertController, Platform } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

// Providers
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { CallNumber } from '@ionic-native/call-number/ngx';
import {
    GoogleMaps,
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
import { ClientData } from '../../Interfaces/client-data';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {
    @ViewChild('Map') mapElement: ElementRef;
    private platformSubscription: any = null;
    private minDistanceBetweenOriginAndDestination: number = 0.2;
    private myLocation: LatLng;
    private clientLocation; LatLng;
    private map: any;
    private marker: Marker;
    private locationUpdateInterval: any = null;
    private updateLocationFrequenzy: number = 10000; // Milliseconds it will take to make a new location update
    private subscription: any = null;
    loading: boolean = true;
    clientData: ClientData = null;
    markersAndRouteDisplayed: boolean = false;

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
            })
            .catch(async () => {
                const alert: any = await this.alertCtrl.create({
                    header: '¡Vaya!... ha ocurrido un error',
                    message: 'No fue posible determinar tu ubicación, intenta ajustar tu gps a modo de alta presición',
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
            });
    }

    ionViewDidEnter() {
        this.subscription = this.platform.backButton.subscribeWithPriority(0, () => {
            // I should ask first
            this.navCtrl.navigateBack('/home');
        });
    }

    ionViewWillLeave() {
        this.backgroundGeolocation.stop();
        this.platformSubscription.unsubscribe();
        clearInterval(this.locationUpdateInterval);
        this.socket.disconnect();
        this.subscription.unsubscribe();

    }

    getMarkersPosition() {
        return new Promise((res, rej) => {
            // Get Deliveryman position
            this.geolocation.getCurrentPosition({ timeout: 60000 })
                .then((position: any) => {
                    const { latitude, longitude } = position.coords; // My position
                    this.myLocation = new LatLng(latitude, longitude);
                    this.getClientPosition(0)
                        .then(() => {
                            res();
                        });
                })
                .catch((err) => {
                   rej(err);
                });
        });
    }

    // Separated 'cause I need a recursive function
    getClientPosition(tries: number) {
        // Get client position based on the direction
        return new Promise((resolve) => {
            this.geocoder.forwardGeocode(this.clientData.direction)
                .then((data: any) => {
                    const { latitude , longitude } = data[0]; // Client position
                    this.clientLocation = new LatLng(latitude, longitude);
                    resolve();
                })
                .catch(async (error) => {
                    if (error !== 'Geocoder:getFromLocationName Error: grpc failed') { // Error of the plugin, requires asking twice
                        const msg = 'Ha ocurrido un error al intentar obtener la posición del cliente, revisa tu conneción a internet';
                        this.showErrorMessage(msg);
                    } else {
                        // Was not possible to get direction 'cause Geocoder:getFromLocationName Error: grpc failed
                        // This loop is just a temporal solution
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

        this.map.one( GoogleMapsEvent.MAP_READY ).then( () => {
            this.loading = false;
            // Start socket connection
            const initData: SocketData = {
                order: this.clientData.deliveryId,
                deliveryGuyId: this.clientData.deliveryGuyId, // Delivery guy id
                lat: this.myLocation.lat,
                long: this.myLocation.lng,
                latDes: this.clientLocation.lat,
                lngDes: this.clientLocation.lng
            };
            this.socket.connect(initData);
            // Start watching position
            this.watchUserPosition();

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
                })
                .catch(async (error) => {
                    console.log('PolylineError', error);
                    const alert: any = await this.alertCtrl.create({
                        header: 'Error',
                        message: 'Parece que no fue posible hallar una ruta entre los dos puntos',
                        buttons: [
                            {
                                text: 'Aceptar',
                                role: 'cancel',
                                cssClass: 'secondary'
                            }
                        ]
                    });
                    await alert.present();
                    this.markersAndRouteDisplayed = true;
                });

            const markerOptions: MarkerOptions = {
                position: this.myLocation,
                icon: 'assets/images/carIcon.png',
                title: 'Tu ubicación'
            };

            this.map.addMarker( markerOptions )
                .then( ( marker: Marker ) => {
                    this.marker = marker;
                });

            const markerOptions2: MarkerOptions = {
                position: this.clientLocation,
                icon: 'assets/images/marker.png',
                title: 'Cliente'
            };

            this.map.addMarker( markerOptions2 );
        })
        .catch((error) => {
           console.log('ErrorDetectingWhenMapIsReady', error);
        });
    }

    watchUserPosition(): void {
        this.locationUpdateInterval  = setInterval(() => {
            this.geolocation.getCurrentPosition()
                .then((position) => {
                    const {latitude, longitude} = position.coords;
                    if (latitude !== this.myLocation.lat && longitude !== this.myLocation.lng) { // Location Changed
                        this.myLocation = new LatLng(latitude, longitude);
                        const socketData: SocketData = {
                            order: this.clientData.deliveryId,
                            deliveryGuyId: this.clientData.deliveryGuyId, // Delivery guy id
                            lat: latitude,
                            long: longitude,
                            latDes: this.clientLocation.lat,
                            lngDes: this.clientLocation.lng
                        };
                        this.socket.send('position', socketData);
                        if (this.marker) {
                            const originString: string = this.myLocation.lat.toString() + ',' + this.myLocation.lng;
                            const destinationString: string = this.clientLocation.lat.toString() + ',' + this.clientLocation.lng;
                            this.mapsService.drawPolyline(this.map, originString, destinationString)
                                .catch((error) => {
                                    console.log('ReDrawnPolylineError', error);
                                });
                            this.marker.setPosition(this.myLocation);
                        }
                    }
                })
                .catch((error) => {
                    console.log('IntervalCurrentPositionError', error);
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
            debug: false, //  enable this to hear sounds for background-geolocation life-cycle.
            stopOnTerminate: true, // enable this to clear background location settings when the app terminates
        };

        this.backgroundGeolocation.configure(config)
            .then(() => {

                this.backgroundGeolocation.on(BackgroundGeolocationEvents.location).subscribe((location: BackgroundGeolocationResponse) => {
                    const {latitude, longitude} = location;
                    if (latitude !== this.myLocation.lat && longitude !== this.myLocation.lng) {
                        this.myLocation = new LatLng(latitude, longitude);
                        const msg: SocketData = {
                            order: this.clientData.deliveryId,
                            deliveryGuyId: this.clientData.deliveryGuyId, // Delivery guy id
                            lat: latitude,
                            long: longitude,
                            latDes: this.clientLocation.lat,
                            lngDes: this.clientLocation.lng
                        };
                        this.socket.send('position', msg);
                    }
                });

            });

        this.platform.ready()
            .then(() => {
                this.platformSubscription = this.platform.pause.subscribe(() => {
                    this.backgroundGeolocation.start();
                });
                this.platform.resume.subscribe(() => {
                    // Should unsubscribe too, but it's not affecting the app right now
                    this.backgroundGeolocation.stop();
                });
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
        this.callNumber.callNumber(this.clientData.phone, true)
            .catch(async (error) => {
                console.log('CallingError', error);
                const alert: any = await this.alertCtrl.create({
                    header: 'Error',
                    message: 'No fue posible realizar la llamada',
                    buttons: [
                        {
                            text: 'Aceptar',
                            role: 'cancel',
                            cssClass: 'secondary'
                        }
                    ]
                });
                await alert.present();
            });
    }

}
