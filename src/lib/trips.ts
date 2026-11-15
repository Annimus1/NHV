import { getCollection, getEntries, type CollectionEntry } from "astro:content";
import type { ImageMetadata } from "astro";
import type { StateSlug } from "./venezuela-states";

export type Trip = CollectionEntry<"trips">;
export type Place = CollectionEntry<"lugares">;

export type TripImage = {
  src: ImageMetadata;
  alt: string;
};

function includeDrafts(): boolean {
  return !import.meta.env.PROD;
}

export async function getTrips(): Promise<Trip[]> {
  const trips = await getCollection(
    "trips",
    ({ data }) => includeDrafts() || !data.draft,
  );

  return trips.sort(
    (a, b) => b.data.startDate.getTime() - a.data.startDate.getTime(),
  );
}

export async function getUpcomingTrips(): Promise<Trip[]> {
  const trips = await getTrips();

  return trips
    .filter(
      ({ data }) => data.status === "upcoming" || data.status === "ongoing",
    )
    .sort((a, b) => a.data.startDate.getTime() - b.data.startDate.getTime());
}

export async function getPlaces(): Promise<Place[]> {
  const places = await getCollection(
    "lugares",
    ({ data }) => includeDrafts() || !data.draft,
  );

  return places.sort((a, b) => a.data.name.localeCompare(b.data.name, "es"));
}

export async function getTripPlaces(trip: Trip): Promise<Place[]> {
  if (trip.data.places.length === 0) return [];

  const entries = await getEntries(trip.data.places);

  return entries.map((entry, index) => {
    if (!entry) {
      const reference = trip.data.places[index];
      throw new Error(
        `Trip "${trip.id}" references missing place "${reference.id}"`,
      );
    }

    return entry as Place;
  });
}

export async function getTripStates(trip: Trip): Promise<StateSlug[]> {
  const places = await getTripPlaces(trip);
  const states = new Set<StateSlug>(trip.data.states);

  for (const place of places) {
    states.add(place.data.state);
  }

  return [...states];
}

export async function getTripsByState(state: StateSlug): Promise<Trip[]> {
  const trips = await getTrips();
  const matches = await Promise.all(
    trips.map(async (trip) => {
      const states = await getTripStates(trip);
      return states.includes(state) ? trip : undefined;
    }),
  );

  return matches.filter((trip): trip is Trip => trip !== undefined);
}

export async function getTripsByPlace(placeId: string): Promise<Trip[]> {
  const trips = await getTrips();

  return trips.filter(({ data }) =>
    data.places.some((reference) => reference.id === placeId),
  );
}

export async function getVisitedStates(): Promise<StateSlug[]> {
  const trips = (await getTrips()).filter(
    ({ data }) => data.status !== "upcoming",
  );
  const states = await Promise.all(trips.map(getTripStates));

  return [...new Set(states.flat())];
}

export function getCover(trip: Trip): TripImage | undefined {
  if (trip.data.cover) {
    return trip.data.cover;
  }

  const firstPhoto = trip.data.photos[0];

  return firstPhoto
    ? { src: firstPhoto.src, alt: firstPhoto.alt }
    : undefined;
}
