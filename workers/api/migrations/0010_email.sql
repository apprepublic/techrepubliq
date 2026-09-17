-- PR 7 part 2 — §13 Email Center.
--
-- Two small additions, both because the existing schema can't answer a question the
-- feature needs to ask:
--
--   project_services.service_key   "Is the Email add-on active on this project?" The tab
--                                  appears only when it is, and inbound mail is refused
--                                  for projects without it. The row used to carry the
--                                  add-on's display label and nothing else, which makes
--                                  that question a string comparison against copy that
--                                  belongs to the marketing side. The key is the stable
--                                  id; existing rows are backfilled from the label they
--                                  were created with.
--
--   email_messages.read_at         An inbox without read state isn't an inbox. NULL is
--                                  unread, which also means rows that predate this
--                                  column read as unread rather than as read.

ALTER TABLE project_services ADD COLUMN service_key TEXT;

UPDATE project_services SET service_key = 'google' WHERE kind = 'addon' AND name = 'Google-powered services';
UPDATE project_services SET service_key = 'email'  WHERE kind = 'addon' AND name = 'Email Center';
UPDATE project_services SET service_key = 'ai'     WHERE kind = 'addon' AND name = 'AI feature add-on';

CREATE INDEX IF NOT EXISTS idx_project_services_key ON project_services(project_id, service_key, status);

ALTER TABLE email_messages ADD COLUMN read_at TEXT;

CREATE INDEX IF NOT EXISTS idx_email_messages_folder ON email_messages(project_id, direction, sent_at);
