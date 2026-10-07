import { isOpenAt, OpeningHourRow, timeToMins } from "../openingHoursCheck";

describe("openingHoursCheck test", () => {
  describe("isOpenAt", () => {
    const hours: OpeningHourRow[] = [
      {
        day_of_week: 0,
        open_time: "00:00",
        close_time: "00:00",
        is_closed: true
      },
      {
        day_of_week: 1,
        open_time: "10:00",
        close_time: "19:00",
        is_closed: false
      },
      {
        day_of_week: 2,
        open_time: "10:00",
        close_time: "19:00",
        is_closed: false
      },
      {
        day_of_week: 3,
        open_time: "10:00",
        close_time: "19:00",
        is_closed: false
      },
      {
        day_of_week: 4,
        open_time: "10:00",
        close_time: "19:00",
        is_closed: false
      },
      {
        day_of_week: 5,
        open_time: "10:00",
        close_time: "19:00",
        is_closed: false
      },
      {
        day_of_week: 6,
        open_time: "00:00",
        close_time: "00:00",
        is_closed: true
      },

    ]
    it("Monday, '12:00' is open", () => {
      const result = isOpenAt(hours, 1, "12:44")
      expect(result).toEqual(true);
    });

    it("Sunday, '13:00' is close", () => {
      const result = isOpenAt(hours, 0, "15:30");
      expect(result).toEqual(false);
    });

    it("Wednesday at 18:30, due to 45 minutes gap, it should be clodes", () => {
      const result = isOpenAt(hours, 4, "18:30");
      expect(result).toEqual(false)
    })
      
    
    
  });

 describe("timeToMins test", () => {
    
    it("conver '14:45' correctly to 885 minutes", () => {
      const ttm = timeToMins("14:45");

      expect(ttm).toEqual(885)
    }) 
 })

});