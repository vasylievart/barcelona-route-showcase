// types/goldenAnchor.ts — output contract for GoldenAnchorStep, per spec §4.

import { Place } from "./place"


export interface GoldenAnchor {
  day: number
  anchor?: Place []
}