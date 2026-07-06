CREATE TABLE IF NOT EXISTS scheduling_task_state (
    task_id VARCHAR(64) NOT NULL,
    urgency_level TINYINT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (task_id),
    INDEX idx_scheduling_task_state_urgency_level (urgency_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Optional: run this only if the old tasks.urgency_level column exists
-- and you want to copy existing values into the new scheduler-owned table.
-- INSERT INTO scheduling_task_state (task_id, urgency_level)
-- SELECT id, COALESCE(urgency_level, 0)
-- FROM tasks
-- WHERE COALESCE(urgency_level, 0) <> 0
-- ON DUPLICATE KEY UPDATE urgency_level = VALUES(urgency_level);
