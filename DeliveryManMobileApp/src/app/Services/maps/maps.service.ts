import { Injectable } from '@angular/core';

// Providers
import { GoogleMaps, LatLng, Polyline, Encoding } from '@ionic-native/google-maps';
import { HTTP } from '@ionic-native/http/ngx';


// Models And Interfaces
import { DIRECTIONS_API_KEY } from '../../API/APIKeys';


@Injectable({
  providedIn: 'root'
})
export class MapsService {
    private baseUrl = 'https://maps.googleapis.com/maps/api/directions/json';
    private polyline: Polyline = null;

    constructor(private http: HTTP) { }

    getBoundariesAndDrawInitialPolyline(map: any, origin: string, destination: string) {
        return new Promise((resolve) => {
            // Set te points
            let url = this.baseUrl + '?origin=' + origin + '&destination=' + destination;
            // Set the key
            url = url + '&key=' + DIRECTIONS_API_KEY;
            // set Mode
            // Put a switch here
            url = url + '&mode=driving'; // Hardcoded by now
            // Some Hardcoded options
            url = url + '&language=es&units=metric';
            this.http.get(url, {}, {})
                .then((data: any) => {
                    const json: any = JSON.parse(data.data);
                    console.log(json);
                    const routeDrawing = json.routes[0].overview_polyline;
                    console.log(this.polyline);
                    if (this.polyline !== null) {
                        this.polyline.remove();
                    }
                    map.addPolyline({
                        points: Encoding.decodePath(routeDrawing.points),
                        geodesic: true,
                        color: '#000',
                        width: 2
                    }).then((polyline: any) => {
                        this.polyline = polyline;
                        resolve(json);
                    });
                });
        });
    }

    drawPolyline(map: any, origin: string, destination: string) {
        return new Promise((resolve) => {
            // Set te points
            let url = this.baseUrl + '?origin=' + origin + '&destination=' + destination;
            // Set the key
            url = url + '&key=' + DIRECTIONS_API_KEY;
            // set Mode
            // Put a switch here
            url = url + '&mode=driving'; // Hardcoded by now
            // Some Hardcoded options
            url = url + '&language=es&units=metric';
            this.http.get(url, {}, {})
                .then((data: any) => {
                    const json: any = JSON.parse(data.data);
                    const routeDrawing = json.routes[0].overview_polyline;
                    console.log(this.polyline);
                    if (this.polyline !== null) {
                        this.polyline.remove();
                    }
                    map.addPolyline({
                        points: Encoding.decodePath(routeDrawing.points),
                        geodesic: true,
                        color: '#000',
                        width: 2
                    }).then((polyline: any) => {
                        this.polyline = polyline;
                        resolve();
                    });
                });
        });
    }

    private degreesToRadians(degrees) {
        return degrees * Math.PI / 180;
    }

    // This Calculates the distance between the 2 points, it does not take in count the streets
    distanceBetweenCoordinates(origin, destination) {
        const earthRadiusKm = 6371;

        const dLat = this.degreesToRadians(destination.lat - origin.lat);
        const dLon = this.degreesToRadians(destination.lng - origin.lng);

        const originLatInDegrees = this.degreesToRadians(origin.lat);
        const destinationLatInDegrees = this.degreesToRadians(destination.lat);

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(originLatInDegrees) * Math.cos(destinationLatInDegrees);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadiusKm * c;
    }
}
