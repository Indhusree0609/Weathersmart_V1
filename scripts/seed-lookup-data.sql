-- Seed data for all lookup tables in the multi-user family wardrobe system

-- Insert Relationships
INSERT INTO public.relationships (id, name, display_order) VALUES
(1, 'Spouse', 1),
(2, 'Partner', 2),
(3, 'Child', 3),
(4, 'Parent', 4),
(5, 'Sibling', 5),
(6, 'Grandparent', 6),
(7, 'Grandchild', 7),
(8, 'Friend', 8),
(9, 'Family Member', 9)
ON CONFLICT (id) DO NOTHING;

-- Insert Genders
INSERT INTO public.genders (id, name, display_order) VALUES
(1, 'Male', 1),
(2, 'Female', 2),
(3, 'Non-binary', 3),
(4, 'Prefer not to say', 4)
ON CONFLICT (id) DO NOTHING;

-- Insert Categories (including child-specific categories)
INSERT INTO public.categories (id, name, display_order, is_child_category) VALUES
(1, 'accessories', 1, FALSE),
(2, 'bottoms', 2, FALSE),
(3, 'dresses', 3, FALSE),
(4, 'outerwear', 4, FALSE),
(5, 'shoes', 5, FALSE),
(6, 'tops', 6, FALSE),
(7, 'traditional', 7, FALSE),
(8, 'tops & shirts', 8, TRUE),
(9, 'underwear', 9, TRUE),
(10, 'sleepwear', 10, TRUE),
(11, 'activewear', 11, TRUE),
(12, 'uniform', 12, TRUE),
(13, 'school uniform', 13, TRUE),
(14, 'play clothes', 14, TRUE),
(15, 'party wear', 15, TRUE),
(16, 'costumes & dress-up', 16, TRUE),
(17, 'rain gear', 17, TRUE),
(18, 'swimwear', 18, TRUE),
(19, 'special occasion', 19, TRUE),
(20, 'art smock/apron', 20, TRUE),
(21, 'bibs', 21, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Insert Colors
INSERT INTO public.colors (id, name, hex_code, display_order) VALUES
(1, 'Black', '#000000', 1),
(2, 'White', '#FFFFFF', 2),
(3, 'Blue', '#0000FF', 3),
(4, 'Red', '#FF0000', 4),
(5, 'Pink', '#FFC0CB', 5),
(6, 'Gray', '#808080', 6),
(7, 'Green', '#008000', 7),
(8, 'Yellow', '#FFFF00', 8),
(9, 'Purple', '#800080', 9),
(10, 'Brown', '#A52A2A', 10),
(11, 'Orange', '#FFA500', 11),
(12, 'Navy', '#000080', 12),
(13, 'Beige', '#F5F5DC', 13),
(14, 'Cream', '#FFFDD0', 14),
(15, 'Maroon', '#800000', 15)
ON CONFLICT (id) DO NOTHING;

-- Insert Conditions
INSERT INTO public.conditions (id, name, description, display_order) VALUES
(1, 'New with tags', 'Brand new item with original tags', 1),
(2, 'Excellent', 'Like new condition', 2),
(3, 'Good', 'Minor signs of wear', 3),
(4, 'Fair', 'Noticeable wear but still usable', 4),
(5, 'Poor', 'Significant wear', 5)
ON CONFLICT (id) DO NOTHING;

-- Insert Safety Features (for children's items)
INSERT INTO public.safety_features (id, name, icon, description, display_order) VALUES
(1, 'reflective_strips', '☀️', 'Has reflective strips for visibility', 1),
(2, 'bright_visible_colors', '🎨', 'Bright/visible colors for safety', 2),
(3, 'non_slip_soles', '👟', 'Non-slip soles for better grip', 3),
(4, 'soft_materials', '🧸', 'Soft materials safe for children', 4),
(5, 'no_small_parts', '🔒', 'No small parts that could be choking hazards', 5),
(6, 'flame_resistant', '🔥', 'Flame resistant materials', 6),
(7, 'easy_fasteners', '✨', 'Easy fasteners (velcro snaps)', 7),
(8, 'machine_washable', '🧺', 'Machine washable for easy care', 8),
(9, 'hypoallergenic_materials', '🌿', 'Hypoallergenic materials', 9),
(10, 'uv_protection', '☀️', 'UV protection for sun safety', 10),
(11, 'breathable_fabric', '🌬️', 'Breathable fabric for comfort', 11),
(12, 'reinforced_knees_elbows', '💪', 'Reinforced knees/elbows for durability', 12),
(13, 'rounded_edges_no_sharp_parts', '🔵', 'Rounded edges/no sharp parts', 13),
(14, 'secure_buttons_no_choking_hazards', '🔘', 'Secure buttons/no choking hazards', 14),
(15, 'tag_free_or_soft_tags', '🏷️', 'Tag-free or soft tags', 15),
(16, 'lead_free_materials', '✅', 'Lead-free materials', 16)
ON CONFLICT (id) DO NOTHING;

-- Insert Activities (for children's items)
INSERT INTO public.activities (id, name, display_order) VALUES
(1, 'school', 1),
(2, 'birthday_party', 2),
(3, 'sports_pe', 3),
(4, 'playdates', 4),
(5, 'art_crafts', 5),
(6, 'messy_play', 6),
(7, 'playground', 7),
(8, 'sleep_bedtime', 8),
(9, 'family_event', 9),
(10, 'outdoor_activities', 10),
(11, 'swimming', 11),
(12, 'field_trips', 12),
(13, 'school_dress_code_compliant', 13),
(14, 'has_room_for_growth', 14)
ON CONFLICT (id) DO NOTHING;

-- Insert Weather Categories
INSERT INTO public.weather_categories (id, name, icon, description, display_order) VALUES
(1, 'Rain Protection', '🌧️', 'Items for rain protection', 1),
(2, 'Winter Protection', '❄️', 'Items for winter weather', 2),
(3, 'Sun Protection', '☀️', 'Items for sun protection', 3),
(4, 'Wind Protection', '💨', 'Items for wind protection', 4),
(5, 'Weather Accessories', '🌦️', 'General weather accessories', 5)
ON CONFLICT (id) DO NOTHING;

-- Insert Weather Item Types
INSERT INTO public.weather_item_types (id, weather_category_id, name, display_order) VALUES
(1, 1, 'Raincoat', 1),
(2, 1, 'Umbrella', 2),
(3, 1, 'Rain Boots', 3),
(4, 1, 'Waterproof Jacket', 4),
(5, 2, 'Winter Jacket', 1),
(6, 2, 'Winter Hat', 2),
(7, 2, 'Gloves', 3),
(8, 2, 'Scarf', 4),
(9, 2, 'Snow Boots', 5),
(10, 3, 'Sun Hat', 1),
(11, 3, 'Sunglasses', 2),
(12, 3, 'UV Shirt', 3),
(13, 3, 'Beach Umbrella', 4),
(14, 4, 'Windbreaker', 1),
(15, 4, 'Wind-resistant Jacket', 2),
(16, 4, 'Fleece', 3),
(17, 5, 'Thermal Underwear', 1),
(18, 5, 'Weather-resistant Bag', 2),
(19, 5, 'Hand Warmers', 3),
(20, 5, 'Neck Gaiter', 4)
ON CONFLICT (id) DO NOTHING;
