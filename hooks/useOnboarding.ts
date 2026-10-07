"use client";
import { useState } from "react";
import {
  UserInput,
  BUDGET_PERSONAS,
} from "@/types/userInput";
import { TravelDates } from "@/types/travelDates";
import { Meal } from "@/types/meal";
import { GoldenAnchor } from "@/types/goldenAnchor";
import { Vibe } from "@/types/vibe";

export interface OnboardingState {
  step: number;
  tripDays: number;
  arrivalDate: string;
  arrivalTime: string;
  transportType: 'plane' | 'train' | 'bus' | 'car' | 'other'
  departureTime: string;
  departureDate: string;
  adults: number;
  isTeens: boolean;
  teens: number;
  isChildren: boolean;
  children: number;
  isBaby: boolean;
  babies: number;
  isDisability: boolean,
  disabledPeople: number,
  isPets: boolean,
  pets: number,
  budgetPersona: "budget" | "balanced" | "premium";
  accommodationAddress: string;
  accommodationLat: number | null;
  accommodationLng: number | null;
  includeBreakfast: Meal;
  includeLunch: Meal;
  includeDinner: Meal;
  includeCoffee: Meal;
  interests: string[];
  foodPrefs: string[];
  cuisinePrefs: string[];
  goldenAnchor: GoldenAnchor[];
  tripDate: Date;
  travelDates: TravelDates | null
  placeVibe: Vibe;
}

const INITIAL: OnboardingState = {
  step: 1,
  tripDays: 1,
  arrivalDate: "",
  arrivalTime: "",
  transportType: 'plane',
  departureTime: "",
  departureDate: "",
  adults: 1,
  isTeens: false,
  teens: 0,
  isChildren: false,
  children: 0,
  isBaby: false,
  babies: 0,
  isDisability: false,
  disabledPeople: 0,
  isPets: false,
  pets: 0,
  budgetPersona: "balanced",
  accommodationAddress: "",
  accommodationLat: null,
  accommodationLng: null,
  includeBreakfast: {isMeal: true, mealIn: 'outside'},
  includeLunch: {isMeal: true, mealIn: 'outside'},
  includeDinner: {isMeal: true, mealIn: 'outside'},
  includeCoffee: {isMeal: true, mealIn: 'outside'},
  interests: [],
  foodPrefs: [],
  cuisinePrefs: [],
  goldenAnchor: [],
  tripDate: new Date,
  travelDates: null,
  placeVibe: {rating: [4.5, 5], reviews: [0, 5001], radius: [0, 150]}
};

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>(INITIAL);

  function update(patch: Partial<OnboardingState>) {
    setState((prev) => ({ ...prev, ...patch }));
  }

  function nextStep() {
    setState((prev) => ({ ...prev, step: Math.min(prev.step + 1, 10) }));
  }

  function prevStep() {
    setState((prev) => ({ ...prev, step: Math.max(prev.step - 1, 1) }));
  }

  const group = state.adults + state.teens + state.children + state.babies

  const dailyRate = BUDGET_PERSONAS.find((b) => b.key === state.budgetPersona)
          ?.dailyBudget ?? 120
  const dailyBudget = dailyRate * (state.adults + state.teens) + dailyRate * 0.6 * state.children

  function toggleInterest(key: string) {
    setState((prev) => ({
      ...prev,
      interests: prev.interests.includes(key)
        ? prev.interests.filter((i) => i !== key)
        : prev.interests.length < 3
          ? [...prev.interests, key]
          : prev.interests,
    }));
  }
  

  function toggleFoodPref(key: string) {
    setState((prev) => ({
      ...prev,
      foodPrefs: prev.foodPrefs.includes(key)
        ? prev.foodPrefs.filter((f) => f !== key)
        : [...prev.foodPrefs, key],
    }));
  }

    function toggleCuisinePref(key: string) {
    setState((prev) => ({
      ...prev,
      cuisinePrefs: prev.cuisinePrefs.includes(key)
        ? prev.cuisinePrefs.filter((c) => c !== key)
        : [...prev.cuisinePrefs, key],
    }));
  }



  const dayHasAnchor = (day:number): boolean => {
    const entry = state.goldenAnchor.find(a => a.day === day)
    if (!entry) return false
    return !!entry.anchor?.length
  }

  const daysWithAnchor = (day: number) : boolean => {
    for (let i = 1; i <= day; i++) {
      if (!dayHasAnchor(i)) return false
    }
    return true
  }
  
 
  function toUserInput(): UserInput | null {
    if (!state.accommodationLat || !state.accommodationLng) return null;
    return {
      tripDays: state.tripDays,
      budget: dailyBudget,
      budgetPersona: state.budgetPersona,
      interests: state.interests,
      foodPrefs: state.foodPrefs,
      accommodationAddress: state.accommodationAddress,
      accommodationLat: state.accommodationLat,
      accommodationLng: state.accommodationLng,
      tripDate: state.tripDate,
      arrivalDate: state.arrivalDate,
      arrivalTime: state.arrivalTime,
      transportType: state.transportType,
      departureTime: state.departureTime,
      departureDate: state.departureDate,
      group: group,
      adults: state.adults,
      teens: state.teens,
      isTeens: state.isTeens,
      children: state.children,
      isChildren: state.isChildren,
      isBaby: state.isBaby,
      babies: state.babies,
      isDisability: state.isDisability,
      disabledPeople: state.disabledPeople,
      isPets: state.isPets,
      pets: state.pets,
      includeBreakfast: state.includeBreakfast,
      includeLunch: state.includeLunch,
      includeDinner: state.includeDinner,
      includeCoffee: state.includeCoffee,
      cuisinePrefs: state.cuisinePrefs,
      goldenAnchor: state.goldenAnchor,
      placeVibe: state.placeVibe,
      travelDates: state.travelDates
    };
  }

  const canProceed: boolean = (() => {
    switch (state.step) {
      case 1:
        return (state.travelDates?.fullDays ?? 0) > 0;
      case 2:
        return state.adults > 0;
      case 3:
        return (state.travelDates?.fullDays ?? 0) >= state.tripDays;
      case 4:
        return true;
      case 5:
        return !!state.accommodationLat && !!state.accommodationLng; 
      case 6: 
        return state.interests.length > 0;
      case 7: 
        return true;
      case 8:
        return true;
      case 9: 
        return daysWithAnchor(state.tripDays)
      case 10: 
        return true;
      default:
        return false;
    }
  })();

  return {
    state,
    update,
    nextStep,
    prevStep,
    toggleInterest,
    toggleFoodPref,
    toggleCuisinePref,
    toUserInput,
    canProceed,
  };
}
