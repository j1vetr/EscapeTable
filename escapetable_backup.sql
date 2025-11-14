--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (415ebe8)
-- Dumped by pg_dump version 16.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.stock_movements DROP CONSTRAINT IF EXISTS stock_movements_product_id_products_id_fk;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_category_id_categories_id_fk;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_region_id_delivery_regions_id_fk;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_delivery_slot_id_delivery_slots_id_fk;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_camping_location_id_camping_locations_id_fk;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_product_id_products_id_fk;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_order_id_orders_id_fk;
ALTER TABLE IF EXISTS ONLY public.delivery_slots DROP CONSTRAINT IF EXISTS delivery_slots_region_id_delivery_regions_id_fk;
ALTER TABLE IF EXISTS ONLY public.camping_locations DROP CONSTRAINT IF EXISTS camping_locations_region_id_delivery_regions_id_fk;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_user_id_users_id_fk;
DROP INDEX IF EXISTS public."IDX_session_expire";
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_unique;
ALTER TABLE IF EXISTS ONLY public.stock_movements DROP CONSTRAINT IF EXISTS stock_movements_pkey;
ALTER TABLE IF EXISTS ONLY public.settings DROP CONSTRAINT IF EXISTS settings_pkey;
ALTER TABLE IF EXISTS ONLY public.sessions DROP CONSTRAINT IF EXISTS sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_pkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_pkey;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_pkey;
ALTER TABLE IF EXISTS ONLY public.delivery_slots DROP CONSTRAINT IF EXISTS delivery_slots_pkey;
ALTER TABLE IF EXISTS ONLY public.delivery_regions DROP CONSTRAINT IF EXISTS delivery_regions_pkey;
ALTER TABLE IF EXISTS ONLY public.delivery_regions DROP CONSTRAINT IF EXISTS delivery_regions_name_unique;
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS categories_pkey;
ALTER TABLE IF EXISTS ONLY public.camping_locations DROP CONSTRAINT IF EXISTS camping_locations_pkey;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_pkey;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.stock_movements;
DROP TABLE IF EXISTS public.settings;
DROP TABLE IF EXISTS public.sessions;
DROP TABLE IF EXISTS public.products;
DROP TABLE IF EXISTS public.orders;
DROP TABLE IF EXISTS public.order_items;
DROP TABLE IF EXISTS public.delivery_slots;
DROP TABLE IF EXISTS public.delivery_regions;
DROP TABLE IF EXISTS public.categories;
DROP TABLE IF EXISTS public.camping_locations;
DROP TABLE IF EXISTS public.audit_logs;
DROP TYPE IF EXISTS public.user_role;
DROP TYPE IF EXISTS public.payment_method;
DROP TYPE IF EXISTS public.order_status;
--
-- Name: order_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.order_status AS ENUM (
    'preparing',
    'on_delivery',
    'delivered',
    'cancelled'
);


--
-- Name: payment_method; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_method AS ENUM (
    'cash',
    'bank_transfer'
);


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'customer',
    'admin',
    'personnel'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    action character varying(255) NOT NULL,
    entity_type character varying(100),
    entity_id character varying,
    changes jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: camping_locations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.camping_locations (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    region_id character varying NOT NULL,
    name character varying(255) NOT NULL,
    address text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    image_url character varying
);


--
-- Name: delivery_regions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.delivery_regions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    min_eta_minutes integer DEFAULT 30 NOT NULL,
    max_eta_minutes integer DEFAULT 120 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: delivery_slots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.delivery_slots (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    region_id character varying NOT NULL,
    start_time character varying(5) NOT NULL,
    end_time character varying(5) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    order_id character varying NOT NULL,
    product_id character varying NOT NULL,
    product_name character varying(255) NOT NULL,
    product_price_in_cents integer NOT NULL,
    quantity integer NOT NULL,
    subtotal_in_cents integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    status public.order_status DEFAULT 'preparing'::public.order_status NOT NULL,
    total_amount_in_cents integer NOT NULL,
    payment_method public.payment_method NOT NULL,
    region_id character varying,
    camping_location_id character varying,
    custom_address text,
    delivery_slot_id character varying,
    estimated_delivery_time character varying(100),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    category_id character varying NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    price_in_cents integer NOT NULL,
    image_url character varying,
    stock integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    sid character varying NOT NULL,
    sess jsonb NOT NULL,
    expire timestamp without time zone NOT NULL
);


--
-- Name: settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settings (
    key character varying(255) NOT NULL,
    value jsonb NOT NULL,
    description text,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: stock_movements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_movements (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    product_id character varying NOT NULL,
    quantity_change integer NOT NULL,
    reason character varying(255) NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    email character varying NOT NULL,
    first_name character varying NOT NULL,
    last_name character varying NOT NULL,
    profile_image_url character varying,
    role public.user_role DEFAULT 'customer'::public.user_role NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    phone character varying(20) NOT NULL,
    password character varying(255) NOT NULL
);


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, user_id, action, entity_type, entity_id, changes, created_at) FROM stdin;
\.


--
-- Data for Name: camping_locations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.camping_locations (id, region_id, name, address, is_active, created_at, updated_at) FROM stdin;
2d2b8d88-8c5b-4d3e-a012-6521023fa605	829cf47d-eb8b-475c-93f5-6e4caaaf4e9a	Ormanya Kamp Alanı	Fethiye, Muğla	t	2025-11-14 04:21:37.739703	2025-11-14 04:21:37.739703
06837b27-5800-4bed-b566-cdb55ec0d478	829cf47d-eb8b-475c-93f5-6e4caaaf4e9a	Şimşek Karavan Park	Fethiye, Muğla	t	2025-11-14 04:21:37.739703	2025-11-14 04:21:37.739703
847afb40-fccd-4712-bbe5-a4fbe105d93b	829cf47d-eb8b-475c-93f5-6e4caaaf4e9a	Nilay Karavan Park	Fethiye, Muğla	t	2025-11-14 04:21:37.739703	2025-11-14 04:21:37.739703
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (id, name, description, sort_order, is_active, created_at, updated_at, image_url) FROM stdin;
c0872585-1f83-41dd-afb0-008619ad5451	Yiyecekler	Temel gıda ürünleri ve yiyecekler	1	t	2025-11-14 04:05:24.383359	2025-11-14 04:05:24.383359	/attached_assets/generated_images/Food_category_icon_ce060ebe.webp
465bde5e-68aa-41a8-add9-1df3e63fcdb7	İçecekler	Soğuk ve sıcak içecekler	2	t	2025-11-14 04:05:24.383359	2025-11-14 04:05:24.383359	/attached_assets/generated_images/Beverages_category_icon_e6efcac7.webp
bd7f125f-fcfb-47c5-a241-5b38e3e2973a	Kahvaltılık Ürünler	Kahvaltı için gerekli ürünler	3	t	2025-11-14 04:05:24.383359	2025-11-14 04:05:24.383359	/attached_assets/generated_images/Breakfast_category_icon_87f4303c.webp
2f55fde4-3032-4cb9-b004-fa5bae015e1d	Mangal & Izgara	Mangal ve ızgara ürünleri	4	t	2025-11-14 04:05:24.383359	2025-11-14 04:05:24.383359	/attached_assets/generated_images/BBQ_and_grill_category_150808fb.webp
c8803a38-22d5-46fd-ae8c-bf4527b7a83f	Fırın & Ekmek	Ekmek ve fırın ürünleri	5	t	2025-11-14 04:05:24.383359	2025-11-14 04:05:24.383359	/attached_assets/generated_images/Bakery_category_icon_e558c3eb.webp
25f4d780-88e3-48e3-a535-8b8428e1b965	Atıştırmalıklar	Atıştırmalık ve cipsler	6	t	2025-11-14 04:05:24.383359	2025-11-14 04:05:24.383359	/attached_assets/generated_images/Snacks_category_icon_f34067f2.webp
18d715f1-d79d-4234-bc0d-d4662f792cf3	Temizlik & Hijyen	Temizlik ve hijyen ürünleri	7	t	2025-11-14 04:05:24.383359	2025-11-14 04:05:24.383359	/attached_assets/generated_images/Cleaning_category_icon_30660aed.webp
4b9458fc-5bc7-412c-b2a8-deb5f215f8ac	Kamp Malzemeleri	Kamp için gerekli malzemeler	8	t	2025-11-14 04:05:24.383359	2025-11-14 04:05:24.383359	/attached_assets/generated_images/Camping_gear_category_b36d2ffc.webp
\.


--
-- Data for Name: delivery_regions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.delivery_regions (id, name, min_eta_minutes, max_eta_minutes, is_active, created_at, updated_at) FROM stdin;
829cf47d-eb8b-475c-93f5-6e4caaaf4e9a	Fethiye Bölgesi	30	60	t	2025-11-14 04:21:28.374407	2025-11-14 04:21:28.374407
\.


--
-- Data for Name: delivery_slots; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.delivery_slots (id, region_id, start_time, end_time, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_items (id, order_id, product_id, product_name, product_price_in_cents, quantity, subtotal_in_cents, created_at) FROM stdin;
eb2ed304-7517-46c0-8683-8534977f5aa8	b7db8504-0fd0-46ca-9f5c-25435cd6e8f7	110c9554-05b2-413c-8454-962fb5ba07d2	Beyaz Peynir 500g	36700	1	36700	2025-11-14 07:12:25.153675
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, user_id, status, total_amount_in_cents, payment_method, region_id, camping_location_id, custom_address, delivery_slot_id, estimated_delivery_time, created_at, updated_at) FROM stdin;
90bcbf76-1cbf-4ee6-9dd2-bd81dff6a86d	7cee294f-b096-4dda-a7c8-cf30fd940633	preparing	36700	cash	\N	2d2b8d88-8c5b-4d3e-a012-6521023fa605	teete	\N	14 Kasım 2025 15:00 - 16:00	2025-11-14 07:10:48.748993	2025-11-14 07:10:48.748993
b7db8504-0fd0-46ca-9f5c-25435cd6e8f7	7cee294f-b096-4dda-a7c8-cf30fd940633	preparing	36700	cash	\N	847afb40-fccd-4712-bbe5-a4fbe105d93b	\N	\N	14 Kasım 2025 17:00 - 18:00	2025-11-14 07:12:25.123677	2025-11-14 07:12:25.123677
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, category_id, name, description, price_in_cents, image_url, stock, is_active, is_featured, created_at, updated_at) FROM stdin;
ffb4f9ab-b7ad-4adc-b61f-9c83f55ecbc7	c0872585-1f83-41dd-afb0-008619ad5451	Makarna 500g	Kaliteli makarna	36700	/attached_assets/generated_images/Makarna_package_product_photo_46810de2.webp	50	t	t	2025-11-14 04:05:53.315375	2025-11-14 04:05:53.315375
9bd840e5-c81b-4740-bfda-4588d3ccb558	c0872585-1f83-41dd-afb0-008619ad5451	Pirinç 1kg	Baldo pirinç	36700	/attached_assets/generated_images/Rice_package_product_photo_a06f83ca.webp	40	t	f	2025-11-14 04:05:53.315375	2025-11-14 04:05:53.315375
6a2dbabf-c77e-4f9c-91df-40363334dcd6	c0872585-1f83-41dd-afb0-008619ad5451	Konserve Fasulye	Kuru fasulye konserve	36700	/attached_assets/generated_images/Canned_beans_product_photo_b6b6acb2.webp	60	t	f	2025-11-14 04:05:53.315375	2025-11-14 04:05:53.315375
548e78e1-61da-48ad-a8a3-9b8505ade8dd	465bde5e-68aa-41a8-add9-1df3e63fcdb7	Su 5L	5 litre içme suyu	36700	/attached_assets/generated_images/Water_bottle_product_photo_e0bd2ab4.webp	100	t	t	2025-11-14 04:05:53.315375	2025-11-14 04:05:53.315375
4a2beeff-846b-493e-bff8-200b1609fcad	465bde5e-68aa-41a8-add9-1df3e63fcdb7	Kola 330ml	Soğuk kola	36700	/attached_assets/generated_images/Cola_can_product_photo_486311fc.webp	80	t	f	2025-11-14 04:05:53.315375	2025-11-14 04:05:53.315375
7e8aacb4-101d-41b5-a61d-87b9b7e1ae17	465bde5e-68aa-41a8-add9-1df3e63fcdb7	Meyve Suyu 1L	Portakal suyu	36700	/attached_assets/generated_images/Orange_juice_product_photo_09474738.webp	70	t	f	2025-11-14 04:05:53.315375	2025-11-14 04:05:53.315375
110c9554-05b2-413c-8454-962fb5ba07d2	bd7f125f-fcfb-47c5-a241-5b38e3e2973a	Beyaz Peynir 500g	Taze beyaz peynir	36700	/attached_assets/generated_images/White_cheese_product_photo_f516c740.webp	30	t	t	2025-11-14 04:05:53.315375	2025-11-14 04:05:53.315375
b68b2ba4-1f10-41a9-90f9-aa949e413fe6	bd7f125f-fcfb-47c5-a241-5b38e3e2973a	Zeytin 500g	Siyah zeytin	36700	/attached_assets/generated_images/Olives_jar_product_photo_2ff0cf0b.webp	35	t	f	2025-11-14 04:05:53.315375	2025-11-14 04:05:53.315375
379001c6-c6f1-465a-8949-3646b5d7eab2	bd7f125f-fcfb-47c5-a241-5b38e3e2973a	Bal 450g	Süzme çiçek balı	36700	/attached_assets/generated_images/Honey_jar_product_photo_7a3502f8.webp	25	t	f	2025-11-14 04:05:53.315375	2025-11-14 04:05:53.315375
7ebb9b44-139a-4d64-8a66-07ededa03c5e	2f55fde4-3032-4cb9-b004-fa5bae015e1d	Közde Köfte 1kg	Hazır köfte	36700	/attached_assets/generated_images/Meatballs_product_photo_72d4c4c2.webp	20	t	f	2025-11-14 04:05:53.315375	2025-11-14 04:05:53.315375
a3b22301-9af9-4986-a0b0-d7c7b261623a	2f55fde4-3032-4cb9-b004-fa5bae015e1d	Tavuk Şiş 500g	Marine tavuk şiş	36700	/attached_assets/generated_images/Chicken_skewers_product_photo_e84967c6.webp	25	t	f	2025-11-14 04:05:53.315375	2025-11-14 04:05:53.315375
16dedb2b-2e96-4a6e-b4d0-93bceeef4697	2f55fde4-3032-4cb9-b004-fa5bae015e1d	Mangal Kömürü 3kg	Meşe mangal kömürü	36700	/attached_assets/generated_images/Charcoal_bag_product_photo_36f0616f.webp	40	t	f	2025-11-14 04:05:53.315375	2025-11-14 04:05:53.315375
98457e73-3097-4f5c-a804-0dff4e2fd163	c8803a38-22d5-46fd-ae8c-bf4527b7a83f	Tost Ekmeği	Dilimli tost ekmeği	36700	/attached_assets/generated_images/Toast_bread_product_photo_e8a2a027.webp	50	t	f	2025-11-14 04:05:53.315375	2025-11-14 04:05:53.315375
0471f41b-aff8-4263-bf1f-6d83898b9f79	c8803a38-22d5-46fd-ae8c-bf4527b7a83f	Lavaş	Taze lavaş	36700	/attached_assets/generated_images/Lavash_bread_product_photo_18565d5c.webp	45	t	f	2025-11-14 04:05:53.315375	2025-11-14 04:05:53.315375
90e321f0-c6a5-4766-bb22-cdce1e23f374	c8803a38-22d5-46fd-ae8c-bf4527b7a83f	Simit	Tazelik garantili simit	36700	/attached_assets/generated_images/Simit_product_photo_6532e5ea.webp	60	t	f	2025-11-14 04:05:53.315375	2025-11-14 04:05:53.315375
1db6feb0-d4c3-4e99-9656-22909e07f8c6	25f4d780-88e3-48e3-a535-8b8428e1b965	Cips 150g	Süper boy cips	36700	/attached_assets/generated_images/Chips_bag_product_photo_5db0b37a.webp	100	t	f	2025-11-14 04:05:53.315375	2025-11-14 04:05:53.315375
a883b9e5-c424-4c7b-9c32-a27f1418f05b	25f4d780-88e3-48e3-a535-8b8428e1b965	Çikolata	Sütlü çikolata	36700	/attached_assets/generated_images/Chocolate_bar_product_photo_846241e5.webp	80	t	f	2025-11-14 04:05:53.315375	2025-11-14 04:05:53.315375
7ab9dc04-0115-47df-8fc0-e1f6289ba3bc	25f4d780-88e3-48e3-a535-8b8428e1b965	Kuruyemiş Karışık 200g	Fıstık, fındık, badem karışımı	36700	/attached_assets/generated_images/Mixed_nuts_product_photo_8dee709e.webp	50	t	f	2025-11-14 04:05:53.315375	2025-11-14 04:05:53.315375
fd1b1385-184f-492b-ac66-816935b825af	18d715f1-d79d-4234-bc0d-d4662f792cf3	Islak Mendil 120li	Antibakteriyel ıslak mendil	36700	/attached_assets/generated_images/Wet_wipes_product_photo_392acbe3.webp	70	t	f	2025-11-14 04:05:53.315375	2025-11-14 04:05:53.315375
f4212af4-539d-4fca-a78f-bd2fc14ac136	18d715f1-d79d-4234-bc0d-d4662f792cf3	El Sabunu 500ml	Sıvı el sabunu	36700	/attached_assets/generated_images/Hand_soap_product_photo_5edfe581.webp	60	t	f	2025-11-14 04:05:53.315375	2025-11-14 04:05:53.315375
fbc27d92-b70b-4ec4-a0e8-b9b3d0a7940c	18d715f1-d79d-4234-bc0d-d4662f792cf3	Çöp Torbası 10lu	Battal boy çöp torbası	36700	/attached_assets/generated_images/Garbage_bags_product_photo_f8264364.webp	80	t	f	2025-11-14 04:05:53.315375	2025-11-14 04:05:53.315375
db1276ce-877b-46dc-841d-bd8459e21a17	4b9458fc-5bc7-412c-b2a8-deb5f215f8ac	Fener LED	Şarjlı LED fener	36700	/attached_assets/generated_images/LED_flashlight_product_photo_32048a8f.webp	30	t	f	2025-11-14 04:05:53.315375	2025-11-14 04:05:53.315375
659fb9a6-9c5c-40cf-b3a2-b25f5af30a9e	4b9458fc-5bc7-412c-b2a8-deb5f215f8ac	Çakı Seti	Çok amaçlı çakı	36700	/attached_assets/generated_images/Knife_set_product_photo_337dfc0a.webp	25	t	f	2025-11-14 04:05:53.315375	2025-11-14 04:05:53.315375
0bb5bacd-04f4-419c-8152-110a3799af4e	4b9458fc-5bc7-412c-b2a8-deb5f215f8ac	Battaniye	Polar battaniye	36700	/attached_assets/generated_images/Fleece_blanket_product_photo_822ab96d.webp	20	t	f	2025-11-14 04:05:53.315375	2025-11-14 04:05:53.315375
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sessions (sid, sess, expire) FROM stdin;
5QGRIlKfJtqHa8odivy5Jgsni2_Qjqh6	{"cookie": {"path": "/", "secure": false, "expires": "2025-11-21T06:00:27.176Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": "3dff6131-1fc9-478a-8c06-1f84c0f3a193"}}	2025-11-21 06:00:28
Sm66WTLPLdqmLr-18MxK-Kl9DOmY5c2X	{"cookie": {"path": "/", "secure": false, "expires": "2025-11-21T06:21:10.453Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": "7cee294f-b096-4dda-a7c8-cf30fd940633"}}	2025-11-21 08:08:11
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.settings (key, value, description, updated_at) FROM stdin;
\.


--
-- Data for Name: stock_movements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stock_movements (id, product_id, quantity_change, reason, notes, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, first_name, last_name, profile_image_url, role, created_at, updated_at, phone, password) FROM stdin;
3dff6131-1fc9-478a-8c06-1f84c0f3a193	ahzGf8@test.com	Test	User	\N	customer	2025-11-14 06:00:26.932766	2025-11-14 06:00:26.932766	5000000000	$2b$10$MNhW9qSitzZIcYTM.e6m0.S/fhd.5fmH2uRw1jV8OH2MVggEfuOFa
7cee294f-b096-4dda-a7c8-cf30fd940633	emirsimseekk@gmail.com	Emir	Şimşek	\N	customer	2025-11-14 06:21:10.364169	2025-11-14 06:21:10.364169	5308616785	$2b$10$8kqKFRefEeikpzj767yPf.a1Vjq/Pkp5UneFUQtzk75evf.jMAbFq
\.


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: camping_locations camping_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.camping_locations
    ADD CONSTRAINT camping_locations_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: delivery_regions delivery_regions_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_regions
    ADD CONSTRAINT delivery_regions_name_unique UNIQUE (name);


--
-- Name: delivery_regions delivery_regions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_regions
    ADD CONSTRAINT delivery_regions_pkey PRIMARY KEY (id);


--
-- Name: delivery_slots delivery_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_slots
    ADD CONSTRAINT delivery_slots_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (key);


--
-- Name: stock_movements stock_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_session_expire" ON public.sessions USING btree (expire);


--
-- Name: audit_logs audit_logs_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: camping_locations camping_locations_region_id_delivery_regions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.camping_locations
    ADD CONSTRAINT camping_locations_region_id_delivery_regions_id_fk FOREIGN KEY (region_id) REFERENCES public.delivery_regions(id) ON DELETE CASCADE;


--
-- Name: delivery_slots delivery_slots_region_id_delivery_regions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_slots
    ADD CONSTRAINT delivery_slots_region_id_delivery_regions_id_fk FOREIGN KEY (region_id) REFERENCES public.delivery_regions(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_order_id_orders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_orders_id_fk FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: orders orders_camping_location_id_camping_locations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_camping_location_id_camping_locations_id_fk FOREIGN KEY (camping_location_id) REFERENCES public.camping_locations(id);


--
-- Name: orders orders_delivery_slot_id_delivery_slots_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_delivery_slot_id_delivery_slots_id_fk FOREIGN KEY (delivery_slot_id) REFERENCES public.delivery_slots(id);


--
-- Name: orders orders_region_id_delivery_regions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_region_id_delivery_regions_id_fk FOREIGN KEY (region_id) REFERENCES public.delivery_regions(id);


--
-- Name: orders orders_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: products products_category_id_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: stock_movements stock_movements_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

