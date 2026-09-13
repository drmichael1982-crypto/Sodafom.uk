-- REVIEW ONLY. Not executed by Agent 14 or automatically at application startup.
-- Apply to a backed-up STAGING database before testing the free teacher sign-up.
-- No subscription, parent, licence, payment, or pupil table is changed.
ALTER TABLE teacher_accounts MODIFY COLUMN licence_id INT NULL;
-- Leave the existing foreign key intact. NULL means a standalone free teacher class.
-- Rolling app code back does not require reversing this nullable-column change.
-- Do NOT restore NOT NULL while free teacher rows exist and do NOT delete them.
