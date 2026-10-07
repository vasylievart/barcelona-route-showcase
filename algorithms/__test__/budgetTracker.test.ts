import { BudgetState, budgetSummary, canAfford, createBudget, spendFromBudget } from "../budgetTracker"

describe('Budget logic', () => {

  describe('createBudget', () => {
    it('should initialize budget correctly', () => {
      const budget = createBudget(100)

      expect(budget).toEqual({
        total: 100,
        spent: 0,
        remaining: 100,
      })
    })
  })

  describe('spendFromBudget', () => {
    it('should increase spent and decrease remaining', () => {
      const initial = createBudget(100)

      const updated = spendFromBudget(initial, 30)

      expect(updated).toEqual({
        total: 100,
        spent: 30,
        remaining: 70,
      })
    })

    it('should accumulate spending correctly', () => {
      const initial = createBudget(100)
      const afterFirst = spendFromBudget(initial, 30)
      const afterSecond = spendFromBudget(afterFirst, 20)

      expect(afterSecond).toEqual({
        total: 100,
        spent: 50,
        remaining: 50,
      })
    })
  })

  describe('canAfford', () => {
    it('should return true if enough budget remains', () => {
      const budget = createBudget(100)

      expect(canAfford(budget, 50)).toBe(true)
    })

    it('should return false if amount exceeds remaining', () => {
      const budget = createBudget(100)
      const updated = spendFromBudget(budget, 80)

      expect(canAfford(updated, 30)).toBe(false)
    })

    it('should return true when amount equals remaining', () => {
      const budget = createBudget(100)

      expect(canAfford(budget, 100)).toBe(true)
    })
  })

  describe('budgetSummary', () => {
    it('should format summary correctly', () => {
      const budget = createBudget(100)
      const updated = spendFromBudget(budget, 25)

      const result = budgetSummary(updated)

      expect(result).toBe('€25 spent of €100 (€75 remaining)')
    })

    it('should round values correctly', () => {
      const budget: BudgetState = {
        total: 100,
        spent: 33.6,
        remaining: 66.4,
      }

      const result = budgetSummary(budget)

      expect(result).toBe('€34 spent of €100 (€66 remaining)')
    })
  })

})
