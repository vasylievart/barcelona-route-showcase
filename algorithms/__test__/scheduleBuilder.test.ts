import { UserInput } from "@/types/userInput";
import { PlaceWithContext } from "../filterCandidates";
import { buildDaySchedule, buildDescription } from "../oldScheduleBuilder";
import { Coords } from "../haversine";

describe("schedualBuilder test", () => {
  function parsedCoords(place: PlaceWithContext): Coords {
    return {
      lat: parseFloat(String(place.latitude)),
      lng: parseFloat(String(place.longitude)),
    };
  }

  describe("parsedCoords", () => {
    it("should convert string coordinates to numbers", () => {
      // We cast to "any" then "PlaceWithContext" to mock only what we need
      const mockPlace = {
        latitude: "41.3851",
        longitude: "2.1734",
      } as any as PlaceWithContext;

      const result = parsedCoords(mockPlace);

      expect(result).toEqual({
        lat: 41.3851,
        lng: 2.1734,
      });
      expect(typeof result.lat).toBe("number");
    });

    it("should handle already numeric coordinates", () => {
      const mockPlace = {
        latitude: 41.395,
        longitude: 2.162,
      } as any as PlaceWithContext;

      const result = parsedCoords(mockPlace);

      expect(result).toEqual({
        lat: 41.395,
        lng: 2.162,
      });
    });

    it("should return NaN if coordinates are invalid strings", () => {
      const mockPlace = {
        latitude: "not-a-number",
        longitude: "2.1734",
      } as any as PlaceWithContext;

      const result = parsedCoords(mockPlace);

      expect(result.lat).toBeNaN();
      expect(result.lng).toBe(2.1734);
    });
  });
});
describe("buildDescription", () => {
  it("Build 'Brunch and Cake' description", () => {
    const slot = "breakfast";
    const newPlace = {
      name: "Brunch & Cake",
      rating: 4.4,
    } as PlaceWithContext;
    const wm = 13;
    const result = buildDescription(slot, newPlace, wm);
    expect(result).toEqual(
      "Start your morning at Brunch & Cake, a 4.4★ spot just 13 min from your hotel.",
    );
  });
});

describe("buildDaySchedule", () => {
  const mockPlaces: PlaceWithContext[] = [
    {
      id: "48bb8d52-6e75-4cb3-ad60-50d4699ed0f2",
      name: "Reial Monestir de Santa Maria de Pedralbes",
      category_id: 5,
      latitude: 41.395741,
      longitude: 2.112686,
      rating: null,
      reviews_count: null,
      price_level: null,
      avg_visit_duration: 60,
      avg_spend: null,
      website: null,
      google_place_id: null,
      requires_booking: false,
      booking_url: null,
      booking_lead_days: null,
      cuisine_type: null,
      meal_types: null,
      historical_desc: null,
      architect: null,
      year_built: null,
      is_active: true,
      created_at: "2026-03-19 08:52:13.204807+00",
      types: null,
      google_types: [],
      is_free: true,
      place_type: "filler",
      hours: [
        {
          day_of_week: 5,
          open_time: "08:00",
          close_time: "12:00",
          is_closed: false,
        },
      ], // Required for PlaceWithContext
      tags: ["history", "culture"], // Required for PlaceWithContext
    },
    {
      id: "e5b58844-0660-476d-80c6-8f5c6b9a56ab",
      name: "Casa de l'Heura",
      category_id: 5,
      latitude: 41.453406,
      longitude: 2.245945,
      rating: null,
      reviews_count: null,
      price_level: null,
      avg_visit_duration: 60,
      avg_spend: null,
      website: null,
      google_place_id: null,
      requires_booking: false,
      booking_url: null,
      booking_lead_days: null,
      cuisine_type: null,
      meal_types: null,
      historical_desc: null,
      architect: null,
      year_built: null,
      is_active: true,
      created_at: "2026-03-19 08:52:19.265438+00",
      types: null,
      google_types: [],
      is_free: true,
      place_type: "filler",
      hours: [
        {
          day_of_week: 5,
          open_time: "08:00",
          close_time: "12:00",
          is_closed: false,
        },
      ],
      tags: ["architecture"],
    },
    {
      id: "79f1ce0f-6acc-4206-ba49-6977ccbb5cd8",
      name: "Casa dels Dofins",
      category_id: 5,
      latitude: 41.453349,
      longitude: 2.245822,
      rating: null,
      reviews_count: null,
      price_level: null,
      avg_visit_duration: 60,
      avg_spend: null,
      website: null,
      google_place_id: null,
      requires_booking: false,
      booking_url: null,
      booking_lead_days: null,
      cuisine_type: null,
      meal_types: null,
      historical_desc: null,
      architect: null,
      year_built: null,
      is_active: true,
      created_at: "2026-03-19 08:52:19.569771+00",
      types: null,
      google_types: [],
      is_free: true,
      place_type: "filler",
      hours: [
        {
          day_of_week: 5,
          open_time: "08:00",
          close_time: "12:00",
          is_closed: false,
        },
      ],
      tags: ["architecture"],
    },
    {
      id: "e57a93d4-5131-4b07-8c79-a2dfc032f501",
      name: "Cases Barates del Districte de Sant Andreu",
      category_id: 5,
      latitude: 41.437256,
      longitude: 2.205893,
      rating: null,
      reviews_count: null,
      price_level: null,
      avg_visit_duration: 60,
      avg_spend: null,
      website: null,
      google_place_id: null,
      requires_booking: false,
      booking_url: null,
      booking_lead_days: null,
      cuisine_type: null,
      meal_types: null,
      historical_desc: null,
      architect: null,
      year_built: null,
      is_active: true,
      created_at: "2026-03-19 08:52:20.780035+00",
      types: null,
      google_types: [],
      is_free: true,
      place_type: "filler",
      hours: [
        {
          day_of_week: 5,
          open_time: "08:00",
          close_time: "12:00",
          is_closed: false,
        },
      ],
      tags: ["history"],
    },
    {
      id: "954a6623-3048-4e9e-bab8-c1effbeda840",
      name: "Centre Martorell d'Exposicions",
      category_id: 5,
      latitude: 41.387132,
      longitude: 2.184365,
      rating: null,
      reviews_count: null,
      price_level: null,
      avg_visit_duration: 60,
      avg_spend: null,
      website: null,
      google_place_id: null,
      requires_booking: false,
      booking_url: null,
      booking_lead_days: null,
      cuisine_type: null,
      meal_types: null,
      historical_desc: null,
      architect: null,
      year_built: null,
      is_active: true,
      created_at: "2026-03-19 08:52:21.034578+00",
      types: null,
      google_types: [],
      is_free: true,
      place_type: "filler",
      hours: [
        {
          day_of_week: 5,
          open_time: "08:00",
          close_time: "12:00",
          is_closed: false,
        },
      ],
      tags: ["museum", "science"],
    },
    {
      id: "d916b161-4079-4c76-a7f4-48d68243f7a7",
      name: "Poble Espanyol",
      category_id: 5,
      latitude: 41.368648,
      longitude: 2.148502,
      rating: null,
      reviews_count: null,
      price_level: null,
      avg_visit_duration: 60,
      avg_spend: null,
      website: null,
      google_place_id: null,
      requires_booking: false,
      booking_url: null,
      booking_lead_days: null,
      cuisine_type: null,
      meal_types: null,
      historical_desc: null,
      architect: null,
      year_built: null,
      is_active: true,
      created_at: "2026-03-19 08:52:21.574689+00",
      types: null,
      google_types: [],
      is_free: true,
      place_type: "filler",
      hours: [
        {
          day_of_week: 5,
          open_time: "08:00",
          close_time: "12:00",
          is_closed: false,
        },
      ],
      tags: ["culture", "attraction"],
    },
    {
      id: "c85fb8c6-8414-43f3-a088-e06a6db93b41",
      name: "Palau Robert",
      category_id: 5,
      latitude: 41.396064,
      longitude: 2.159415,
      rating: null,
      reviews_count: null,
      price_level: null,
      avg_visit_duration: 60,
      avg_spend: null,
      website: null,
      google_place_id: null,
      requires_booking: false,
      booking_url: null,
      booking_lead_days: null,
      cuisine_type: null,
      meal_types: null,
      historical_desc: null,
      architect: null,
      year_built: null,
      is_active: true,
      created_at: "2026-03-19 08:52:22.333191+00",
      types: null,
      google_types: [],
      is_free: true,
      place_type: "filler",
      hours: [
        {
          day_of_week: 5,
          open_time: "08:00",
          close_time: "12:00",
          is_closed: false,
        },
      ],
      tags: ["exhibition", "culture"],
    },
    {
      id: "c8d44f81-fd5b-4d9e-b849-8a2cfc255b83",
      name: "Centre Grau-Garriga d'Art Tèxtil Contemporani",
      category_id: 5,
      latitude: 41.468717,
      longitude: 2.082432,
      rating: null,
      reviews_count: null,
      price_level: null,
      avg_visit_duration: 60,
      avg_spend: null,
      website: null,
      google_place_id: null,
      requires_booking: false,
      booking_url: null,
      booking_lead_days: null,
      cuisine_type: null,
      meal_types: null,
      historical_desc: null,
      architect: null,
      year_built: null,
      is_active: true,
      created_at: "2026-03-19 08:52:22.581658+00",
      types: null,
      google_types: [],
      is_free: true,
      place_type: "filler",
      hours: [
        {
          day_of_week: 5,
          open_time: "08:00",
          close_time: "12:00",
          is_closed: false,
        },
      ],
      tags: ["art"],
    },
    {
      id: "c6fdb03f-ec48-41e6-871f-869c7e169e60",
      name: "Palau de la Virreina",
      category_id: 5,
      latitude: 41.38235,
      longitude: 2.171529,
      rating: null,
      reviews_count: null,
      price_level: null,
      avg_visit_duration: 60,
      avg_spend: null,
      website: null,
      google_place_id: null,
      requires_booking: false,
      booking_url: null,
      booking_lead_days: null,
      cuisine_type: null,
      meal_types: null,
      historical_desc: null,
      architect: null,
      year_built: null,
      is_active: true,
      created_at: "2026-03-19 08:52:23.104599+00",
      types: null,
      google_types: [],
      is_free: true,
      place_type: "filler",
      hours: [
        {
          day_of_week: 5,
          open_time: "08:00",
          close_time: "12:00",
          is_closed: false,
        },
      ],
      tags: ["photography", "culture"],
    },
    {
      id: "fdd55a96-4c30-4427-964c-8b6b202168fe",
      name: "Can Framis",
      category_id: 5,
      latitude: 41.403155,
      longitude: 2.194976,
      rating: null,
      reviews_count: null,
      price_level: null,
      avg_visit_duration: 60,
      avg_spend: null,
      website: null,
      google_place_id: null,
      requires_booking: false,
      booking_url: null,
      booking_lead_days: null,
      cuisine_type: null,
      meal_types: null,
      historical_desc: null,
      architect: null,
      year_built: null,
      is_active: true,
      created_at: "2026-03-19 08:52:24.394892+00",
      types: null,
      google_types: [],
      is_free: true,
      place_type: "filler",
      hours: [
        {
          day_of_week: 5,
          open_time: "08:00",
          close_time: "12:00",
          is_closed: false,
        },
      ],
      tags: ["art", "painting"],
    },
  ];

  const userInput: UserInput = {
    tripDays: 3,
    budget: 400,
    budgetPersona: "balanced",
    interests: ["history", "nature", "food"],
    foodPrefs: ["catalan", "seafood"],
    accommodationAddress:
      "Carrer dels Capellans, 4, Ciutat Vella, 08002 Barcelona",
    accommodationLat: 41.385092823720306,
    accommodationLng: 2.1750766991600443,
    tripDate: new Date("2026-04-10"),
  };
  const day = 5;

  it("Succesful create itinerary for 10 of April 2026", () => {
    const globalUsedIds = new Set<string>();
    const result = buildDaySchedule(mockPlaces, userInput, day, globalUsedIds);
    expect(result.dayNumber).toBe(5);
  });

  it("should generate different itineraries for Day 1 and Day 2", () => {
    const globalUsedIds = new Set<string>();
    const day1 = buildDaySchedule(mockPlaces, userInput, 1, globalUsedIds);
    const day2 = buildDaySchedule(mockPlaces, userInput, 2, globalUsedIds);

    const day1Ids = day1.steps.map((s) => s.place.id);
    const day2Ids = day2.steps.map((s) => s.place.id);

    expect(day1.dayNumber).toBe(1);
    expect(day2.dayNumber).toBe(2);

    expect(day1Ids).toEqual(day2Ids);
    const overlap = day1Ids.filter((id) => day2Ids.includes(id));
    expect(overlap).toHaveLength(0);
  });
});
