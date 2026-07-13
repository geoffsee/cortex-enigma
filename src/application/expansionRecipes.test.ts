import { describe, it, expect } from 'vitest';
import { EXPANSION_RECIPES, matchExpansionRecipe } from './expansionRecipes';
import {
  EXPANSION_INTENSITY_MIN,
  EXPANSION_INTENSITY_MAX,
} from '../domain/expansionIntensity';

describe('EXPANSION_RECIPES', () => {
  it('exposes a small, non-empty set', () => {
    expect(EXPANSION_RECIPES.length).toBeGreaterThan(0);
    expect(EXPANSION_RECIPES.length).toBeLessThanOrEqual(6);
  });

  it('has unique ids', () => {
    const ids = EXPANSION_RECIPES.map(r => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('bundles only in-range intensity and known bias values', () => {
    for (const recipe of EXPANSION_RECIPES) {
      expect(recipe.intensity).toBeGreaterThanOrEqual(EXPANSION_INTENSITY_MIN);
      expect(recipe.intensity).toBeLessThanOrEqual(EXPANSION_INTENSITY_MAX);
      expect(['uniform', 'history']).toContain(recipe.bias);
    }
  });
});

describe('matchExpansionRecipe', () => {
  it('returns the recipe whose bundled values match', () => {
    const first = EXPANSION_RECIPES[0];
    expect(matchExpansionRecipe(first.intensity, first.bias)?.id).toBe(first.id);
  });

  it('round-trips every recipe', () => {
    for (const recipe of EXPANSION_RECIPES) {
      expect(matchExpansionRecipe(recipe.intensity, recipe.bias)).toBe(recipe);
    }
  });

  it('returns null when no recipe defines the combination', () => {
    expect(matchExpansionRecipe(1, 'history')).toBeNull();
  });
});
