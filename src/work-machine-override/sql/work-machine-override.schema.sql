CREATE TABLE `work_machine_override_type` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(64) NOT NULL,
  `name` varchar(120) NOT NULL,
  `effect` enum('OPEN','CLOSE') NOT NULL,
  `color` varchar(32) NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_wmo_type_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `work_machine_override` (
   `id` int unsigned NOT NULL AUTO_INCREMENT,
   `wca_no` int unsigned NOT NULL,
   `type_id` int unsigned NOT NULL,
   `dtstart_utc_ms` bigint NOT NULL,
   `duration_ms` bigint NOT NULL,
   `rrule` text NULL,
   `timezone` varchar(64) NOT NULL DEFAULT 'America/Montreal',
   `is_enabled` tinyint(1) NOT NULL DEFAULT 1,
   `note` text NULL,
   `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
   `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
   PRIMARY KEY (`id`),
   KEY `IDX_wmo_wca_no` (`wca_no`),
   KEY `IDX_wmo_type_id` (`type_id`),
   KEY `IDX_wmo_dtstart_utc_ms` (`dtstart_utc_ms`),
   CONSTRAINT `FK_wmo_type_id` FOREIGN KEY (`type_id`) REFERENCES `work_machine_override_type` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;