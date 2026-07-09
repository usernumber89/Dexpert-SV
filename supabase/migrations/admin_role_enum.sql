-- Step 1: Add ADMIN to role enum (must be separate transaction)
ALTER TYPE role ADD VALUE IF NOT EXISTS 'ADMIN';
