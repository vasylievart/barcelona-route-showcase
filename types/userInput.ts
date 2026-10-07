import { GoldenAnchor } from "./goldenAnchor";
import { Meal } from "./meal";
import { TravelDates } from "./travelDates";
import { Vibe } from "./vibe";

export interface UserInput {
  arrivalDate: string;
  arrivalTime: string;
  transportType: 'plane' | 'train' | 'bus' | 'car' | 'other'
  departureTime: string;
  departureDate: string;
  accommodationAddress: string;
  accommodationLat: number;
  accommodationLng: number;

  group: number;
  adults: number;
  teens: number; 
  isTeens: boolean; 
  children: number;
  isChildren: boolean;
  isBaby: boolean;
  babies: number;
  isDisability: boolean;
  disabledPeople: number;
  isPets: boolean;
  pets: number;

  budget: number;
  budgetPersona: "budget" | "balanced" | "premium";

  includeBreakfast: Meal// false = hotel/apartment breakfast included
  includeLunch:     Meal
  includeDinner:    Meal
  includeCoffee:    Meal

  tripDays: number;
  
  interests: string[]; // ['history', 'architecture', 'food']
  foodPrefs: string[]; // ['local', 'asian', 'vegetarian']
  cuisinePrefs: string[];
  goldenAnchor: GoldenAnchor[];
  placeVibe: Vibe;
  tripDate: Date;
  travelDates: TravelDates | null
}

export interface BudgetPersona {
  key: "budget" | "balanced" | "premium";
  label: string;
  emoji: string;
  dailyBudget: number;
  description: string;
}

export const BUDGET_PERSONAS: BudgetPersona[] = [
  {
    key: "budget",
    label: "Budget Explorer",
    emoji: "🎒",
    dailyBudget: 60,
    description: "Free attractions, local markets, affordable eats",
  },
  {
    key: "balanced",
    label: "Balanced Traveller",
    emoji: "🏛️",
    dailyBudget: 120,
    description: "Mix of paid attractions and good restaurants",
  },
  {
    key: "premium",
    label: "Premium Experience",
    emoji: "✨",
    dailyBudget: 200,
    description: "Top restaurants, guided tours, priority entry",
  },
];

export const INTEREST_OPTIONS = [
  { key: "architecture", label: "Architecture", emoji: "🏛️" },
  { key: "history", label: "History", emoji: "📜" },
  { key: "art", label: "Art", emoji: "🎨" },
  { key: "food", label: "Food", emoji: "🍽️" },
  { key: "nature", label: "Nature", emoji: "🌿" },
  { key: "nightlife", label: "Nightlife", emoji: "🎶" },
  { key: "shopping", label: "Shopping", emoji: "🛍️" },
  { key: "local", label: "Local Life", emoji: "🧭" },
] as const;

export const FOOD_OPTIONS = [
  { key: "local", label: "Local Catalan", emoji: "🥘" },
  { key: "international", label: "International", emoji: "🌍" },
  { key: "vegetarian", label: "Vegetarian", emoji: "🥗" },
  { key: "seafood", label: "Seafood", emoji: "🦞" },
] as const;

export interface FoodCategory {
  key: string;
  label: string;
  emoji: string;
  subcategories?: FoodSubcategory[];
}

export interface FoodSubcategory {
  key: string;
  label: string;
  emoji: string;
}

export const FOOD_CATEGORIES: FoodCategory[] = [
  {
    key: "spanish",
    label: "Spanish",
    emoji: "🇪🇸",
    subcategories: [
      { key: "catalan", label: "Catalan", emoji: "🥘" },
      { key: "galician", label: "Galician", emoji: "🐙" },
      { key: "basque", label: "Basque", emoji: "🦀" },
      { key: "tapas", label: "Tapas", emoji: "🫙" },
    ],
  },
  {
    key: "mediterranean",
    label: "Mediterranean",
    emoji: "🫒",
    subcategories: [
      { key: "greek", label: "Greek", emoji: "🇬🇷" },
      { key: "italian", label: "Italian", emoji: "🇮🇹" },
      { key: "pizza", label: "Pizza", emoji: "🍕" },
    ],
  },
  {
    key: "seafood",
    label: "Seafood",
    emoji: "🦞",
  },
  {
    key: "latin-american",
    label: "Latin American",
    emoji: "🌮",
    subcategories: [
      { key: "mexican", label: "Mexican", emoji: "🌮" },
      { key: "peruvian", label: "Peruvian", emoji: "🫑" },
      { key: "argentinian", label: "Argentinian", emoji: "🥩" },
      { key: "brazilian", label: "Brazilian", emoji: "🇧🇷" },
    ],
  },
  {
    key: "asian",
    label: "Asian",
    emoji: "🍜",
    subcategories: [
      { key: "japanese", label: "Japanese", emoji: "🍣" },
      { key: "chinese", label: "Chinese", emoji: "🥡" },
      { key: "ramen", label: "Ramen", emoji: "🍜" },
      { key: "indian", label: "Indian", emoji: "🍛" },
      { key: "thai", label: "Thai", emoji: "🌶️" },
    ],
  },
  {
    key: "middle-eastern",
    label: "Middle Eastern",
    emoji: "🧆",
    subcategories: [
      { key: "turkish", label: "Turkish", emoji: "🇹🇷" },
      { key: "moroccan", label: "Moroccan", emoji: "🇲🇦" },
      { key: "falafel", label: "Falafel", emoji: "🧆" },
      { key: "halal", label: "Halal", emoji: "☪️" },
    ],
  },
  {
    key: "american",
    label: "American",
    emoji: "🍔",
    subcategories: [
      { key: "burger", label: "Burgers", emoji: "🍔" },
      { key: "grill-bar", label: "Grill", emoji: "🔥" },
    ],
  },
  {
    key: "healthy",
    label: "Healthy",
    emoji: "🥗",
    subcategories: [
      { key: "vegan", label: "Vegan", emoji: "🌱" },
      { key: "vegetarian", label: "Vegetarian", emoji: "🥦" },
      { key: "gluten-free", label: "Gluten Free", emoji: "🌾" },
    ],
  },
  {
    key: "fast-food",
    label: "Fast Food",
    emoji: "🍟",
  },
];
