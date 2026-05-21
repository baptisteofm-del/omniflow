-- Referral Tracking Enhancement
-- Add columns to track referrals properly

alter table referrals add column if not exists referrer_code text;
alter table agencies add column if not exists referred_by text;
