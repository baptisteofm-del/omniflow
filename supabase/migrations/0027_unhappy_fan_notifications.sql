-- Owner request: "je veux avoir des notif sur les opportunité manqué
-- détecté par l'IA aussi, les fans mécontents etc" — agency_notifications
-- already had 'missed_opportunity' (Full AI's own decision loop only, see
-- fullAi.ts). Adding 'unhappy_fan' so the same table also covers a high
-- churn-risk signal from the regular Fan Intelligence analysis, which runs
-- after every message in every AI mode (not just Full AI conversations).
alter table agency_notifications drop constraint if exists agency_notifications_type_check;
alter table agency_notifications add constraint agency_notifications_type_check
  check (type in ('escalation', 'missed_opportunity', 'unhappy_fan'));
