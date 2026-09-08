-- Migration 0002: Email verification
-- Description: Add email_verified and verification_token to customers

ALTER TABLE customers ADD COLUMN email_verified INTEGER DEFAULT 0;
ALTER TABLE customers ADD COLUMN verification_token TEXT;