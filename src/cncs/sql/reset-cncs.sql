-- Reset schema for cncs table to match remote all_wca payload
-- Keep only fields needed by scheduling/runtime snapshot.

DROP TABLE IF EXISTS `cncs`;

CREATE TABLE `cncs` (
  `wca_no` int NOT NULL,
  `wca_name` varchar(255) NULL,
  `cnc_name` varchar(255) NULL,
  `active_axes` varchar(64) NULL,
  PRIMARY KEY (`wca_no`),
  KEY `idx_cncs_cnc_name` (`cnc_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
