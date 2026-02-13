# Normalised database schema — Covenants Platform

Schema derived from app entities: **Chemistry**, **Accreditation**, **StateLocation**, **Product**, and implicit **Facility** / **Manufacturer**. Designed for a relational DB (e.g. PostgreSQL) with normalised tables and junction tables for many-to-many relationships.

---

## Entity relationship overview

- **Facilities** belong to a **Manufacturer** and one **StateLocation**; they offer **Chemistries** and hold **Accreditations** (M:N).
- **Products** are offered by a **Manufacturer**, in a **StateLocation**, with a **ProductCategory**; they reference **Accreditations** and **PackagingOptions** (M:N).
- **Chemistries**, **Accreditations**, and **StateLocations** use **categories** / **regions** as lookups.

---

## 1. Lookup / dimension tables

### `regions`

| Column   | Type         | Constraints | Description        |
|----------|--------------|-------------|--------------------|
| id       | PK, UUID     | NOT NULL    | Primary key        |
| name     | VARCHAR(50)  | NOT NULL UNIQUE | e.g. North India |

**Values (from app):** north, south, east, west, central, northeast.

---

### `chemistry_categories`

| Column | Type         | Constraints | Description |
|--------|--------------|-------------|-------------|
| id     | PK, UUID     | NOT NULL    | Primary key |
| name   | VARCHAR(100) | NOT NULL UNIQUE | e.g. Synthesis, Fermentation |

**Values:** synthesis, fermentation, extraction, biotechnology, specialty.

---

### `accreditation_categories`

| Column | Type         | Constraints | Description |
|--------|--------------|-------------|-------------|
| id     | PK, UUID     | NOT NULL    | Primary key |
| name   | VARCHAR(50)  | NOT NULL UNIQUE | e.g. Regulatory, Quality |

**Values:** regulatory, quality, environmental, international.

---

### `product_categories`

| Column | Type         | Constraints | Description |
|--------|--------------|-------------|-------------|
| id     | PK, UUID     | NOT NULL    | Primary key |
| name   | VARCHAR(50)  | NOT NULL UNIQUE | e.g. API |

---

### `packaging_options`

| Column | Type         | Constraints | Description |
|--------|--------------|-------------|-------------|
| id     | PK, UUID     | NOT NULL    | Primary key |
| name   | VARCHAR(100) | NOT NULL UNIQUE | e.g. 25kg drums, Bulk |

---

## 2. Geography

### `state_locations`

| Column   | Type         | Constraints | Description              |
|----------|--------------|-------------|--------------------------|
| id       | PK, UUID     | NOT NULL    | Primary key              |
| name     | VARCHAR(100) | NOT NULL UNIQUE | State/UT name (e.g. Maharashtra) |
| region_id| FK → regions | NOT NULL    | North/South/East/etc.    |

**Note:** `facility_count` in the app is derived: `COUNT(facilities.id) WHERE facilities.state_location_id = state_locations.id`. Do not store it as a column if you keep facilities; otherwise it can be a cached/counter column updated by triggers or jobs.

---

## 3. Reference data (filter entities)

### `chemistries`

| Column               | Type           | Constraints | Description |
|----------------------|----------------|-------------|-------------|
| id                   | PK, UUID       | NOT NULL    | Primary key |
| name                 | VARCHAR(150)   | NOT NULL    | e.g. Asymmetric Synthesis |
| chemistry_category_id| FK → chemistry_categories | NOT NULL | Category |

**Note:** `facility_count` = number of facilities offering this chemistry (from `facility_chemistries`). Derive or cache.

---

### `accreditations`

| Column                  | Type           | Constraints | Description |
|-------------------------|----------------|-------------|-------------|
| id                      | PK, UUID       | NOT NULL    | Primary key |
| name                    | VARCHAR(150)   | NOT NULL    | Full name   |
| short_name              | VARCHAR(30)    | NOT NULL    | e.g. FDA, WHO-GMP |
| accreditation_category_id | FK → accreditation_categories | NOT NULL | Category |

**Note:** `facility_count` = number of facilities with this accreditation (from `facility_accreditations`). Derive or cache.

---

## 4. Core entities

### `manufacturers`

| Column    | Type          | Constraints | Description |
|-----------|---------------|-------------|-------------|
| id        | PK, UUID      | NOT NULL    | Primary key |
| name      | VARCHAR(200)  | NOT NULL    | e.g. Cipla Ltd. |
| created_at| TIMESTAMPTZ   | DEFAULT now() | Optional  |
| updated_at| TIMESTAMPTZ   | DEFAULT now() | Optional  |

---

### `facilities`

| Column           | Type           | Constraints | Description        |
|------------------|----------------|-------------|--------------------|
| id               | PK, UUID       | NOT NULL    | Primary key        |
| manufacturer_id  | FK → manufacturers | NOT NULL | Owning manufacturer |
| state_location_id| FK → state_locations | NOT NULL | State/UT           |
| name             | VARCHAR(200)   |             | Optional facility name |
| address          | TEXT           |             | Optional address   |
| created_at       | TIMESTAMPTZ    | DEFAULT now() | Optional         |
| updated_at       | TIMESTAMPTZ    | DEFAULT now() | Optional         |

**Unique:** `(manufacturer_id, state_location_id)` or `(manufacturer_id, name)` depending on whether one manufacturer can have multiple facilities in the same state.

---

### `facility_chemistries` (M:N)

| Column       | Type   | Constraints | Description |
|--------------|--------|-------------|-------------|
| facility_id  | FK → facilities   | NOT NULL | |
| chemistry_id | FK → chemistries  | NOT NULL | |
| PRIMARY KEY (facility_id, chemistry_id) | | | |

---

### `facility_accreditations` (M:N)

| Column          | Type   | Constraints | Description |
|-----------------|--------|-------------|-------------|
| facility_id     | FK → facilities    | NOT NULL | |
| accreditation_id| FK → accreditations | NOT NULL | |
| PRIMARY KEY (facility_id, accreditation_id) | | | |

---

### `products`

| Column             | Type           | Constraints | Description        |
|--------------------|----------------|-------------|--------------------|
| id                 | PK, UUID       | NOT NULL    | Primary key        |
| name               | VARCHAR(200)   | NOT NULL    | Product name       |
| cas_number         | VARCHAR(30)    |             | CAS registry number|
| manufacturer_id    | FK → manufacturers | NOT NULL | Supplier           |
| state_location_id  | FK → state_locations | NOT NULL | State where offered/produced |
| product_category_id| FK → product_categories | NOT NULL | e.g. API   |
| purity             | VARCHAR(20)    |             | e.g. 99.5%         |
| created_at         | TIMESTAMPTZ    | DEFAULT now() | Optional         |
| updated_at         | TIMESTAMPTZ    | DEFAULT now() | Optional         |

**Indexes:** `cas_number`, `manufacturer_id`, `state_location_id`, `product_category_id` for search/filters.

---

### `product_accreditations` (M:N)

| Column          | Type   | Constraints | Description |
|-----------------|--------|-------------|-------------|
| product_id      | FK → products       | NOT NULL | |
| accreditation_id| FK → accreditations | NOT NULL | |
| PRIMARY KEY (product_id, accreditation_id) | | | |

---

### `product_packaging` (M:N)

| Column              | Type   | Constraints | Description |
|---------------------|--------|-------------|-------------|
| product_id          | FK → products         | NOT NULL | |
| packaging_option_id | FK → packaging_options| NOT NULL | |
| PRIMARY KEY (product_id, packaging_option_id) | | | |

---

## 5. Optional: RFQ / requests

If you persist “request for quote” from the UI:

### `rfqs` (optional)

| Column       | Type        | Constraints | Description |
|--------------|-------------|-------------|-------------|
| id           | PK, UUID    | NOT NULL    | Primary key |
| product_id   | FK → products | NOT NULL  | |
| quantity     | VARCHAR(50) |             | e.g. 100 |
| unit         | VARCHAR(20) |             | e.g. kg   |
| delivery_location | VARCHAR(200) |         | |
| notes        | TEXT        |             | |
| created_at   | TIMESTAMPTZ | DEFAULT now() | |

---

## 6. SQL (PostgreSQL) creation order

Create in this order to satisfy foreign keys:

1. `regions`
2. `chemistry_categories`
3. `accreditation_categories`
4. `product_categories`
5. `packaging_options`
6. `state_locations` (depends on `regions`)
7. `chemistries` (depends on `chemistry_categories`)
8. `accreditations` (depends on `accreditation_categories`)
9. `manufacturers`
10. `facilities` (depends on `manufacturers`, `state_locations`)
11. `facility_chemistries` (depends on `facilities`, `chemistries`)
12. `facility_accreditations` (depends on `facilities`, `accreditations`)
13. `products` (depends on `manufacturers`, `state_locations`, `product_categories`)
14. `product_accreditations` (depends on `products`, `accreditations`)
15. `product_packaging` (depends on `products`, `packaging_options`)
16. (Optional) `rfqs`

---

## 7. Mapping from current app

| App concept        | Table(s) / columns |
|--------------------|--------------------|
| Chemistry          | `chemistries` + `chemistry_categories` |
| Accreditation      | `accreditations` + `accreditation_categories` |
| StateLocation      | `state_locations` + `regions` |
| Product.manufacturer | `manufacturers` + `products.manufacturer_id` |
| Product.location   | `state_locations` + `products.state_location_id` |
| Product.accreditations | `product_accreditations` + `accreditations` |
| Product.category   | `product_categories` + `products.product_category_id` |
| Product.packagingOptions | `packaging_options` + `product_packaging` |
| Facility count by chemistry/location/accreditation | Count from `facilities` + `facility_chemistries` / `facility_accreditations` and `facilities.state_location_id` |

This schema removes repeated strings (manufacturer names, state names, accreditation names, packaging options) and supports filters and product search via joins and indexes.
