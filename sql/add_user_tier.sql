-- Add a plan tier to Better Auth's user table.
-- Run this in Neon SQL Editor.

alter table "user"
  add column if not exists tier text not null default 'free';

