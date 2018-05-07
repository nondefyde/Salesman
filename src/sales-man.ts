type TripId = string;

interface Location {
    latitude: number;
    longitude: number;
}

enum WayPointType {
    Pickup = 1,
    DropOff = 2
}

interface WayPoint {
    type: WayPointType;
    location: Location;
}

interface Trip {
    id: TripId;
    pickupWaypoint: WayPoint;
    dropoffWaypoint: WayPoint;
}

interface WaypointOutput {
    tripId: TripId;
}

/** *
 * @param location1 Input location
 * @param location2 Input location
 * @returns Very simple crow distance between 2 points
 */
const distance = (location1: Location, location2: Location): number => {
    const dlat = (location2.latitude - location1.latitude);
    const dlon = (location2.longitude - location1.longitude);
    return Math.sqrt(dlat * dlat + dlon * dlon);
};

const minDistanceIndex = (location: Location, trips: Trip[], type: WayPointType): any => {
    if (!trips || trips.length <= 0) return 0;
    let min = distance(location, (type === WayPointType.Pickup)
        ? trips[0].pickupWaypoint.location
        : trips[0].dropoffWaypoint.location);
    let dist = 0;
    let n = 0;
    for (let i = 1; i < trips.length; i++) {
        dist = distance(location, (type === WayPointType.Pickup)
            ? trips[i].pickupWaypoint.location
            : trips[i].dropoffWaypoint.location);
        if (dist < min) {
            min = dist;
            n = i;
        }
    }
    return {
        min: min,
        index: n,
    };
};

const execute = (trips: Trip[]): WaypointOutput[] => {
    const visited: WaypointOutput[] = [];
    const pickups: Trip[] = [];
    const size = trips.length * 2;
    let currentLocation : Location = <Location>{latitude: 0, longitude: 0};
    while (visited.length < size) {
        if (pickups.length <= 0 && trips.length > 0) {
            currentLocation = doPickup(visited, currentLocation, trips, pickups);
        }
        if (trips.length > 0) {
            const pickUpDistance = minDistanceIndex(currentLocation, trips, WayPointType.Pickup);
            const dropOffDistance = minDistanceIndex(currentLocation, pickups, WayPointType.DropOff);
            if (dropOffDistance.min <= pickUpDistance.min) {
                const visitedIndex = dropOffDistance.index;
                currentLocation = doDropOff(visited, visitedIndex, pickups);
            } else {
                currentLocation = doPickup(visited, currentLocation, trips, pickups);
            }
        } else {
            const dropOffDistance = minDistanceIndex(currentLocation, pickups, WayPointType.DropOff);
            const visitedIndex = dropOffDistance.index;
            currentLocation = doDropOff(visited, visitedIndex, pickups);
        }
    }
    return visited;
};

const doPickup = (visited: any[], currentLocation: Location, trips: Trip[], pickedUpTrips: Trip[]) => {
    const minIndex = minDistanceIndex(currentLocation, trips, WayPointType.Pickup);
    currentLocation = visitLocation(visited, trips[minIndex.index], WayPointType.Pickup);
    pickedUpTrips.push(trips[minIndex.index]);
    trips.splice(minIndex.index, 1);
    return currentLocation;
};

const doDropOff = (visited: any[], index: number, pickedUpTrips: Trip[]) => {
    const currentLocation = visitLocation(visited, pickedUpTrips[index], WayPointType.DropOff);
    pickedUpTrips.splice(index, 1);
    return currentLocation;
};

const visitLocation = (visited: any, trip: Trip, type: number) => {
    visited.push({
        tripId: trip.id,
        type: type,
    });
    return (type === WayPointType.Pickup) ? trip.pickupWaypoint.location : trip.dropoffWaypoint.location;
};

const tripsWithMoreCloserPickups = <Trip[]>[
    {
        id: "1",
        pickupWaypoint: <WayPoint> {type: WayPointType.Pickup, location: <Location>{latitude: 0, longitude: 0}},
        dropoffWaypoint: <WayPoint> {type: WayPointType.DropOff, location: <Location>{latitude: 2, longitude: 2}},
    },
    {
        id: "2",
        pickupWaypoint: <WayPoint> {type: WayPointType.Pickup, location: <Location>{latitude: 3, longitude: 3}},
        dropoffWaypoint: <WayPoint> {type: WayPointType.DropOff, location: <Location>{latitude: 4, longitude: 4}},
    },
    {
        id: "3",
        pickupWaypoint: <WayPoint> {type: WayPointType.Pickup, location: <Location>{latitude: 3, longitude: 3}},
        dropoffWaypoint: <WayPoint> {type: WayPointType.DropOff, location: <Location>{latitude: 5, longitude: 5}},
    },
];
const tripsWithDistinctSpacing = <Trip[]>[
    {
        id: "1",
        pickupWaypoint: <WayPoint> {type: WayPointType.Pickup, location: <Location>{latitude: 10, longitude: 8}},
        dropoffWaypoint: <WayPoint> {type: WayPointType.DropOff, location: <Location>{latitude: 1, longitude: 1}},
    },
    {
        id: "2",
        pickupWaypoint: <WayPoint> {type: WayPointType.Pickup, location: <Location>{latitude: 7, longitude: 3}},
        dropoffWaypoint: <WayPoint> {type: WayPointType.DropOff, location: <Location>{latitude: 9, longitude: 2}},
    },
    {
        id: "3",
        pickupWaypoint: <WayPoint> {type: WayPointType.Pickup, location: <Location>{latitude: 4, longitude: 7}},
        dropoffWaypoint: <WayPoint> {type: WayPointType.DropOff, location: <Location>{latitude: 3, longitude: 3}},
    },
    {
        id: "4",
        pickupWaypoint: <WayPoint> {type: WayPointType.Pickup, location: <Location>{latitude: 2, longitude: 9}},
        dropoffWaypoint: <WayPoint> {type: WayPointType.DropOff, location: <Location>{latitude: 1, longitude: 4}},
    },
    {
        id: "5",
        pickupWaypoint: <WayPoint> {type: WayPointType.Pickup, location: <Location>{latitude: 8, longitude: 11}},
        dropoffWaypoint: <WayPoint> {type: WayPointType.DropOff, location: <Location>{latitude: 6, longitude: 8}},
    },
    {
        id: "6",
        pickupWaypoint: <WayPoint> {type: WayPointType.Pickup, location: <Location>{latitude: 12, longitude: 7}},
        dropoffWaypoint: <WayPoint> {type: WayPointType.DropOff, location: <Location>{latitude: 6, longitude: 8}},
    },
    {
        id: "7",
        pickupWaypoint: <WayPoint> {type: WayPointType.Pickup, location: <Location>{latitude: 8, longitude: 7}},
        dropoffWaypoint: <WayPoint> {type: WayPointType.DropOff, location: <Location>{latitude: 4, longitude: 9}},
    },
    {
        id: "8",
        pickupWaypoint: <WayPoint> {type: WayPointType.Pickup, location: <Location>{latitude: 5, longitude: 5}},
        dropoffWaypoint: <WayPoint> {type: WayPointType.DropOff, location: <Location>{latitude: 10, longitude: 5}},
    },
    {
        id: "9",
        pickupWaypoint: <WayPoint> {type: WayPointType.Pickup, location: <Location>{latitude: 1, longitude: 6}},
        dropoffWaypoint: <WayPoint> {type: WayPointType.DropOff, location: <Location>{latitude: 8, longitude: 4}},
    }
];

console.log('result 1: ', execute(tripsWithMoreCloserPickups));
console.log('result 2: ', execute(tripsWithDistinctSpacing));
