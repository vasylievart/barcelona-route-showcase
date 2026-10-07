import { ALGORITHM } from '@/constants/algorithm'
import { Coords, haversineDistance, preFilterByDistance, toRad } from '../haversine';

describe("Haversine function work correct", () => {
  describe("Convert degrees to radiants", () => {
    it("Convert 92 degrees to radians", () => {
      const radian = toRad(92);
      expect(radian).toEqual(1.6057029118347832)
    });

    it("Convert 55 degrees to radians", () => {
      const radian = toRad(55);
      expect(radian).toEqual(0.9599310885968813)
    })
  });

  describe("haversineDistance has to be calculate correcct", () => {
    it("Distance from Negroni Cocktail Bar to Faire. Brunch & Drinks", () => {
      const coordA: Coords = {
        lat: 41.382948,
        lng: 2.165496
      }
      const coordB: Coords = {
        lat: 41.395171,
        lng: 2.170288
      }

      const d = haversineDistance(coordA, coordB);
      expect(d).toEqual(1.4167068944759802)
    });

    it("Distance from Monument Barcelona al general Moragues to Faire. Brunch & Cake", () => {
      const coordA: Coords = {
        lat: 41.382365,
        lng: 2.184044
      }
      const coordB: Coords = {
        lat: 41.388280,
        lng: 2.161504
      }

      const d = haversineDistance(coordA, coordB);
      expect(d).toEqual(1.9921588686955864)
    });
  });

  describe("Places filtered by distance", () => {
    it("Filter place array, and find the nearest one", () => {

        const origin : Coords = {
        lat: 41.373348,
        lng: 2.065596
      };

      const candidates = [
         {
          lat: 41.342891,
          lng: 2.073302,
          roughDistanceKm: 3.4471941274742,
        },
       
         {
          lat: 41.387851,
          lng: 2.154320,
          roughDistanceKm: 7.576172566462053
        },
         {
          lat: 41.356098,
          lng: 2.064742,
          roughDistanceKm: 1.9194360766046115,
        },
        {
          lat: 41.446991,
          lng: 2.209374,
          roughDistanceKm: 14.519839830210794,
        }
      ];
      const maxKm = 15.0


    const result = preFilterByDistance(origin, candidates, maxKm)
    expect(result).toEqual([candidates[2], candidates[0], candidates[1], candidates[3]])
    })
  })
})