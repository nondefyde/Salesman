"use strict";
var WayPointType;
(function (WayPointType) {
    WayPointType[WayPointType["Pickup"] = 1] = "Pickup";
    WayPointType[WayPointType["DropOff"] = 2] = "DropOff";
})(WayPointType || (WayPointType = {}));
/** *
 * @param location1 Input location
 * @param location2 Input location
 * @returns Very simple crow distance between 2 points
 */
var distance = function (location1, location2) {
    var dlat = (location2.latitude - location1.latitude);
    var dlon = (location2.longitude - location1.longitude);
    return Math.sqrt(dlat * dlat + dlon * dlon);
};
var minDistanceIndex = function (location, trips, type) {
    if (!trips || trips.length <= 0)
        return 0;
    var min = distance(location, (type === WayPointType.Pickup)
        ? trips[0].pickupWaypoint.location
        : trips[0].dropoffWaypoint.location);
    var dist = 0;
    var n = 0;
    for (var i = 1; i < trips.length; i++) {
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
var execute = function (trips) {
    var visited = [];
    var pickups = [];
    var size = trips.length * 2;
    var currentLocation = { latitude: 0, longitude: 0 };
    while (visited.length < size) {
        if (pickups.length <= 0 && trips.length > 0) {
            currentLocation = doPickup(visited, currentLocation, trips, pickups);
        }
        if (trips.length > 0) {
            var pickUpDistance = minDistanceIndex(currentLocation, trips, WayPointType.Pickup);
            var dropOffDistance = minDistanceIndex(currentLocation, pickups, WayPointType.DropOff);
            if (dropOffDistance.min <= pickUpDistance.min) {
                var visitedIndex = dropOffDistance.index;
                currentLocation = doDropOff(visited, visitedIndex, pickups);
            }
            else {
                currentLocation = doPickup(visited, currentLocation, trips, pickups);
            }
        }
        else {
            var dropOffDistance = minDistanceIndex(currentLocation, pickups, WayPointType.DropOff);
            var visitedIndex = dropOffDistance.index;
            currentLocation = doDropOff(visited, visitedIndex, pickups);
        }
    }
    return visited;
};
var doPickup = function (visited, currentLocation, trips, pickedUpTrips) {
    var minIndex = minDistanceIndex(currentLocation, trips, WayPointType.Pickup);
    currentLocation = visitLocation(visited, trips[minIndex.index], WayPointType.Pickup);
    pickedUpTrips.push(trips[minIndex.index]);
    trips.splice(minIndex.index, 1);
    return currentLocation;
};
var doDropOff = function (visited, index, pickedUpTrips) {
    var currentLocation = visitLocation(visited, pickedUpTrips[index], WayPointType.DropOff);
    pickedUpTrips.splice(index, 1);
    return currentLocation;
};
var visitLocation = function (visited, trip, type) {
    visited.push({
        tripId: trip.id,
        type: type,
    });
    return (type === WayPointType.Pickup) ? trip.pickupWaypoint.location : trip.dropoffWaypoint.location;
};
var tripsWithMoreCloserPickups = [
    {
        id: "1",
        pickupWaypoint: { type: WayPointType.Pickup, location: { latitude: 0, longitude: 0 } },
        dropoffWaypoint: { type: WayPointType.DropOff, location: { latitude: 2, longitude: 2 } },
    },
    {
        id: "2",
        pickupWaypoint: { type: WayPointType.Pickup, location: { latitude: 3, longitude: 3 } },
        dropoffWaypoint: { type: WayPointType.DropOff, location: { latitude: 4, longitude: 4 } },
    },
    {
        id: "3",
        pickupWaypoint: { type: WayPointType.Pickup, location: { latitude: 3, longitude: 3 } },
        dropoffWaypoint: { type: WayPointType.DropOff, location: { latitude: 5, longitude: 5 } },
    },
];
var tripsWithDistinctSpacing = [
    {
        id: "1",
        pickupWaypoint: { type: WayPointType.Pickup, location: { latitude: 10, longitude: 8 } },
        dropoffWaypoint: { type: WayPointType.DropOff, location: { latitude: 1, longitude: 1 } },
    },
    {
        id: "2",
        pickupWaypoint: { type: WayPointType.Pickup, location: { latitude: 7, longitude: 3 } },
        dropoffWaypoint: { type: WayPointType.DropOff, location: { latitude: 9, longitude: 2 } },
    },
    {
        id: "3",
        pickupWaypoint: { type: WayPointType.Pickup, location: { latitude: 4, longitude: 7 } },
        dropoffWaypoint: { type: WayPointType.DropOff, location: { latitude: 3, longitude: 3 } },
    },
    {
        id: "4",
        pickupWaypoint: { type: WayPointType.Pickup, location: { latitude: 2, longitude: 9 } },
        dropoffWaypoint: { type: WayPointType.DropOff, location: { latitude: 1, longitude: 4 } },
    },
    {
        id: "5",
        pickupWaypoint: { type: WayPointType.Pickup, location: { latitude: 8, longitude: 11 } },
        dropoffWaypoint: { type: WayPointType.DropOff, location: { latitude: 6, longitude: 8 } },
    },
    {
        id: "6",
        pickupWaypoint: { type: WayPointType.Pickup, location: { latitude: 12, longitude: 7 } },
        dropoffWaypoint: { type: WayPointType.DropOff, location: { latitude: 6, longitude: 8 } },
    },
    {
        id: "7",
        pickupWaypoint: { type: WayPointType.Pickup, location: { latitude: 8, longitude: 7 } },
        dropoffWaypoint: { type: WayPointType.DropOff, location: { latitude: 4, longitude: 9 } },
    },
    {
        id: "8",
        pickupWaypoint: { type: WayPointType.Pickup, location: { latitude: 5, longitude: 5 } },
        dropoffWaypoint: { type: WayPointType.DropOff, location: { latitude: 10, longitude: 5 } },
    },
    {
        id: "9",
        pickupWaypoint: { type: WayPointType.Pickup, location: { latitude: 1, longitude: 6 } },
        dropoffWaypoint: { type: WayPointType.DropOff, location: { latitude: 8, longitude: 4 } },
    }
];
console.log('result 1: ', execute(tripsWithMoreCloserPickups));
console.log('result 2: ', execute(tripsWithDistinctSpacing));
