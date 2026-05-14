-- Add granular review columns to doener_reviews
-- Photo
ALTER TABLE "doener_reviews" ADD COLUMN "review_image" text REFERENCES "files"("id") ON DELETE SET NULL;

-- Meat details
ALTER TABLE "doener_reviews" ADD COLUMN "meat_chicken" boolean NOT NULL DEFAULT false;
ALTER TABLE "doener_reviews" ADD COLUMN "meat_beef" boolean NOT NULL DEFAULT false;
ALTER TABLE "doener_reviews" ADD COLUMN "meat_lamb" boolean NOT NULL DEFAULT false;
ALTER TABLE "doener_reviews" ADD COLUMN "meat_style" varchar(20);
ALTER TABLE "doener_reviews" ADD COLUMN "meat_juiciness" integer;
ALTER TABLE "doener_reviews" ADD COLUMN "meat_crispiness" integer;
ALTER TABLE "doener_reviews" ADD COLUMN "meat_dry_feel" integer;
ALTER TABLE "doener_reviews" ADD COLUMN "meat_fatty" integer;

-- Bread details
ALTER TABLE "doener_reviews" ADD COLUMN "review_bread_shape" varchar(20);
ALTER TABLE "doener_reviews" ADD COLUMN "bread_thickness" integer;
ALTER TABLE "doener_reviews" ADD COLUMN "bread_crispiness" integer;
ALTER TABLE "doener_reviews" ADD COLUMN "bread_fluffy" integer;
ALTER TABLE "doener_reviews" ADD COLUMN "bread_sesame_seeds" boolean NOT NULL DEFAULT false;

-- Veggies details
ALTER TABLE "doener_reviews" ADD COLUMN "has_tomatoes" boolean NOT NULL DEFAULT false;
ALTER TABLE "doener_reviews" ADD COLUMN "onion_type" varchar(20);
ALTER TABLE "doener_reviews" ADD COLUMN "red_cabbage_type" varchar(20);
ALTER TABLE "doener_reviews" ADD COLUMN "has_cabbage" boolean NOT NULL DEFAULT false;
ALTER TABLE "doener_reviews" ADD COLUMN "salad_type" varchar(50);
ALTER TABLE "doener_reviews" ADD COLUMN "has_rucola" boolean NOT NULL DEFAULT false;
ALTER TABLE "doener_reviews" ADD COLUMN "has_corn" boolean NOT NULL DEFAULT false;
ALTER TABLE "doener_reviews" ADD COLUMN "has_parsley" boolean NOT NULL DEFAULT false;

-- Sauce details
ALTER TABLE "doener_reviews" ADD COLUMN "has_herbal_sauce" boolean NOT NULL DEFAULT false;
ALTER TABLE "doener_reviews" ADD COLUMN "has_yoghurt_sauce" boolean NOT NULL DEFAULT false;
ALTER TABLE "doener_reviews" ADD COLUMN "has_garlic_sauce" boolean NOT NULL DEFAULT false;
ALTER TABLE "doener_reviews" ADD COLUMN "has_cocktail_sauce" boolean NOT NULL DEFAULT false;
ALTER TABLE "doener_reviews" ADD COLUMN "has_spicy_sauce" boolean NOT NULL DEFAULT false;

-- Overall details
ALTER TABLE "doener_reviews" ADD COLUMN "overall_flavor_rating" integer;
ALTER TABLE "doener_reviews" ADD COLUMN "doener_size" varchar(20);
ALTER TABLE "doener_reviews" ADD COLUMN "price" double precision;
ALTER TABLE "doener_reviews" ADD COLUMN "cleanliness_rating" integer;
