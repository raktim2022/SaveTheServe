-- Initialize SaveTheServe database with required extensions

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS public;

-- Set default permissions
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Create initial admin user (optional)
-- This will be handled by the application