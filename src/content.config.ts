import { defineCollection, reference, z } from "astro:content";
import { glob } from "astro/loaders";
import { STATE_SLUGS } from "./lib/venezuela-states";

const stateSlug = z.enum(STATE_SLUGS);

const lugares = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/lugares" }),
  schema: z.object({
    name: z.string().min(1),
    state: stateSlug,
    coordinates: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    }),
    kind: z
      .enum(["beach", "city", "mountain", "park", "landmark", "other"])
      .default("other"),
    summary: z.string().max(160).optional(),
    draft: z.boolean().default(false),
  }),
});

const trips = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/trips" }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string().min(1),
        summary: z.string().min(1).max(280),
        status: z.enum(["upcoming", "ongoing", "completed"]),
        startDate: z.coerce.date(),
        endDate: z.coerce.date().optional(),
        states: z.array(stateSlug).default([]),
        places: z.array(reference("lugares")).default([]),
        cover: z
          .object({
            src: image(),
            alt: z.string().min(1),
          })
          .optional(),
        photos: z
          .array(
            z.object({
              src: image(),
              alt: z.string().min(1),
              caption: z.string().optional(),
              place: reference("lugares").optional(),
              credit: z.string().optional(),
            }),
          )
          .default([]),
        featured: z.boolean().default(false),
        draft: z.boolean().default(false),
      })
      .refine((data) => !data.endDate || data.endDate >= data.startDate, {
        message: "endDate must be on or after startDate",
        path: ["endDate"],
      })
      .refine((data) => data.states.length > 0 || data.places.length > 0, {
        message: "a trip must include at least one state or place",
        path: ["places"],
      }),
});

export const collections = { trips, lugares };
