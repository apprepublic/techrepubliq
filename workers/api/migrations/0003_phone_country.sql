-- Migration 0003: Add phone and country fields
-- Description: Add phone, phone_country_code, and country to customers

ALTER TABLE customers ADD COLUMN phone TEXT;
ALTER TABLE customers ADD COLUMN phone_country_code TEXT;
ALTER TABLE customers ADD COLUMN country TEXT;