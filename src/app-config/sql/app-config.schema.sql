CREATE TABLE IF NOT EXISTS app_config (
    config_key VARCHAR(100) NOT NULL,
    config_value JSON NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (config_key)
);

INSERT INTO app_config (config_key, config_value)
VALUES (
    'scheduler',
    JSON_OBJECT(
        'lineOrder', JSON_ARRAY(
            JSON_OBJECT('wcaNo', 10077, 'wcaName', 'CTX_1', 'cncName', 'CTX'),
            JSON_OBJECT('wcaNo', 10073, 'wcaName', 'WT1_1', 'cncName', 'WT 1'),
            JSON_OBJECT('wcaNo', 10074, 'wcaName', 'WT2_1', 'cncName', 'WT 2'),
            JSON_OBJECT('wcaNo', 10075, 'wcaName', 'WT3_1', 'cncName', 'WT 3'),
            JSON_OBJECT('wcaNo', 10087, 'wcaName', 'WT4_1', 'cncName', 'WT 4'),
            JSON_OBJECT('wcaNo', 10076, 'wcaName', 'PUMA_1', 'cncName', 'PUMA'),
            JSON_OBJECT('wcaNo', 10072, 'wcaName', 'LYNX2_1', 'cncName', 'LYNX 2'),
            JSON_OBJECT('wcaNo', 10078, 'wcaName', 'DMC_1', 'cncName', 'DMC'),
            JSON_OBJECT('wcaNo', 10079, 'wcaName', 'DNM_1', 'cncName', 'DNM'),
            JSON_OBJECT('wcaNo', 10086, 'wcaName', 'LYNX3_1', 'cncName', 'LYNX 3'),
            JSON_OBJECT('wcaNo', 10071, 'wcaName', 'LYNX1_1', 'cncName', 'LYNX 1')
        )
    )
)
ON DUPLICATE KEY UPDATE
    config_value = VALUES(config_value);
