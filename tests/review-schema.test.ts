import { describe, it, expect } from 'vitest';
import * as v from 'valibot';
import { createReviewSchema } from '../src/routes/(authorized)/doener/[id]/review/schema';

const validReview = {
    meatChicken: true,
    meatBeef: false,
    meatLamb: false,
    meatStyle: 'layered' as const,
    meatJuiciness: 3,
    meatCrispiness: 2,
    meatDryFeel: 1,
    meatFatty: 2,
    meatRating: 3,
    breadShape: 'triangle' as const,
    breadThickness: 2,
    breadCrispiness: 3,
    breadFluffy: 2,
    breadSesameSeeds: false,
    breadRating: 3,
    hasTomatoes: true,
    onionType: 'spicy' as const,
    redCabbageType: null,
    hasCabbage: false,
    saladType: null,
    hasRucola: false,
    hasCorn: false,
    hasParsley: false,
    veggiesRating: 2,
    hasHerbalSauce: false,
    hasYoghurtSauce: true,
    hasGarlicSauce: false,
    hasCocktailSauce: false,
    hasSpicySauce: false,
    sauceRating: 3,
    overallFlavorRating: 3,
    doenerSize: 'medium' as const,
    price: 7.5,
    cleanlinessRating: 3,
    description: 'Great doener!'
};

describe('Review Schema Validation', () => {
    it('should accept a fully filled review', () => {
        const result = v.safeParse(createReviewSchema, validReview);
        expect(result.success).toBe(true);
    });

    it('should reject meat rating above 4', () => {
        const result = v.safeParse(createReviewSchema, { ...validReview, meatRating: 5 });
        expect(result.success).toBe(false);
    });

    it('should reject bread rating below 1', () => {
        const result = v.safeParse(createReviewSchema, { ...validReview, breadRating: 0 });
        expect(result.success).toBe(false);
    });

    it('should reject invalid bread shape', () => {
        const result = v.safeParse(createReviewSchema, { ...validReview, breadShape: 'square' });
        expect(result.success).toBe(false);
    });

    it('should reject invalid onion type', () => {
        const result = v.safeParse(createReviewSchema, { ...validReview, onionType: 'bitter' });
        expect(result.success).toBe(false);
    });

    it('should accept null onion type (no onions)', () => {
        const result = v.safeParse(createReviewSchema, { ...validReview, onionType: null });
        expect(result.success).toBe(true);
    });

    it('should reject negative price', () => {
        const result = v.safeParse(createReviewSchema, { ...validReview, price: -1 });
        expect(result.success).toBe(false);
    });

    it('should accept null price (optional)', () => {
        const result = v.safeParse(createReviewSchema, { ...validReview, price: null });
        expect(result.success).toBe(true);
    });

    it('should reject description over 200 chars', () => {
        const result = v.safeParse(createReviewSchema, {
            ...validReview,
            description: 'a'.repeat(201)
        });
        expect(result.success).toBe(false);
    });

    it('should accept valid meat styles', () => {
        for (const style of ['minced', 'layered'] as const) {
            const result = v.safeParse(createReviewSchema, { ...validReview, meatStyle: style });
            expect(result.success).toBe(true);
        }
    });

    it('should accept valid doener sizes', () => {
        for (const size of ['small', 'medium', 'large'] as const) {
            const result = v.safeParse(createReviewSchema, { ...validReview, doenerSize: size });
            expect(result.success).toBe(true);
        }
    });

    it('should reject invalid doener size', () => {
        const result = v.safeParse(createReviewSchema, { ...validReview, doenerSize: 'xl' });
        expect(result.success).toBe(false);
    });

    it('should accept valid red cabbage types', () => {
        for (const type of ['sour', 'natural'] as const) {
            const result = v.safeParse(createReviewSchema, { ...validReview, redCabbageType: type });
            expect(result.success).toBe(true);
        }
    });

    it('should accept null red cabbage type (none)', () => {
        const result = v.safeParse(createReviewSchema, { ...validReview, redCabbageType: null });
        expect(result.success).toBe(true);
    });

    it('should reject price over 100', () => {
        const result = v.safeParse(createReviewSchema, { ...validReview, price: 150 });
        expect(result.success).toBe(false);
    });

    it('should accept all rating values 1-4', () => {
        for (const val of [1, 2, 3, 4]) {
            const result = v.safeParse(createReviewSchema, {
                ...validReview,
                meatRating: val,
                breadRating: val,
                veggiesRating: val,
                sauceRating: val,
                overallFlavorRating: val,
                cleanlinessRating: val
            });
            expect(result.success).toBe(true);
        }
    });

    it('should allow multiselect proteins', () => {
        const result = v.safeParse(createReviewSchema, {
            ...validReview,
            meatChicken: true,
            meatBeef: true,
            meatLamb: true
        });
        expect(result.success).toBe(true);
    });

    it('should accept all sauce combinations', () => {
        const result = v.safeParse(createReviewSchema, {
            ...validReview,
            hasHerbalSauce: true,
            hasYoghurtSauce: true,
            hasGarlicSauce: true,
            hasCocktailSauce: true,
            hasSpicySauce: true
        });
        expect(result.success).toBe(true);
    });

    it('should accept salad type text', () => {
        const result = v.safeParse(createReviewSchema, { ...validReview, saladType: 'iceberg' });
        expect(result.success).toBe(true);
    });

    it('should reject salad type over 50 chars', () => {
        const result = v.safeParse(createReviewSchema, {
            ...validReview,
            saladType: 'a'.repeat(51)
        });
        expect(result.success).toBe(false);
    });
});
