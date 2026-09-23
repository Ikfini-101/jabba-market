ALTER TABLE `products` ADD `sku` text;--> statement-breakpoint
ALTER TABLE `products` ADD `short_description` text;--> statement-breakpoint
ALTER TABLE `products` ADD `promo_price` real;--> statement-breakpoint
ALTER TABLE `products` ADD `unit` text;--> statement-breakpoint
ALTER TABLE `products` ADD `stock_quantity` integer;--> statement-breakpoint
ALTER TABLE `products` ADD `stock_unit` text;--> statement-breakpoint
CREATE UNIQUE INDEX `products_sku_unique` ON `products` (`sku`);