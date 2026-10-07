// types/group.ts — output contract for GroupStep, per spec §4.

export interface Group {
  group: number
  adults: number
  teens: number
  isTeens: boolean
  isChildren: boolean
  children: number
  isBaby: boolean
  babies: number
  isDisability: boolean
  disabledPeople: number
  isPets: boolean
  pets: number
}