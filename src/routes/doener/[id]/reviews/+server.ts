import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { doenerReviews } from '$lib/server/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { getImageUrl } from '$lib/server/backblaze';

export const GET: RequestHandler = async ({ params }) => {
    const restaurantId = parseInt(params.id);
    if (isNaN(restaurantId)) throw error(400, 'Invalid ID');

    const rows = await db.query.doenerReviews.findMany({
        where: eq(doenerReviews.restaurantId, restaurantId),
        orderBy: desc(doenerReviews.createdAt)
    });

    const reviews = await Promise.all(
        rows.map(async (r) => ({
            id: r.id,
            reviewImageUrl: await getImageUrl(r.reviewImage),
            meatRating: r.meatRating,
            breadRating: r.breadRating,
            veggiesRating: r.veggiesRating,
            sauceRating: r.sauceRating,
            overallFlavorRating: r.overallFlavorRating,
            cleanlinessRating: r.cleanlinessRating,
            overallRating: (r.meatRating + r.breadRating + r.veggiesRating + r.sauceRating) / 4,
            meatChicken: r.meatChicken,
            meatBeef: r.meatBeef,
            meatLamb: r.meatLamb,
            meatStyle: r.meatStyle,
            breadShape: r.breadShape,
            breadSesameSeeds: r.breadSesameSeeds,
            hasHerbalSauce: r.hasHerbalSauce,
            hasYoghurtSauce: r.hasYoghurtSauce,
            hasGarlicSauce: r.hasGarlicSauce,
            hasCocktailSauce: r.hasCocktailSauce,
            hasSpicySauce: r.hasSpicySauce,
            doenerSize: r.doenerSize,
            price: r.price,
            upvotes: r.upvotes,
            description: r.description,
            createdAt: r.createdAt.toISOString()
        }))
    );

    return json(reviews);
};

export const POST: RequestHandler = async ({ params, request }) => {
    const restaurantId = parseInt(params.id);
    if (isNaN(restaurantId)) throw error(400, 'Invalid ID');

    const body = await request.json();
    const reviewId = parseInt(body.reviewId);
    if (isNaN(reviewId)) throw error(400, 'Invalid review ID');

    await db
        .update(doenerReviews)
        .set({ upvotes: sql`${doenerReviews.upvotes} + 1` })
        .where(eq(doenerReviews.id, reviewId));

    const updated = await db.query.doenerReviews.findFirst({
        where: eq(doenerReviews.id, reviewId)
    });

    return json({ upvotes: updated?.upvotes ?? 0 });
};
