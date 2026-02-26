-- ============================================================
-- V1: Initial schema for the timekeeping system
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id          VARCHAR(36)  NOT NULL,
    name        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL,
    password    VARCHAR(255) NOT NULL,
    department  VARCHAR(100) NOT NULL DEFAULT 'General',
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uq_users_email UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS time_logs (
    id           VARCHAR(36)   NOT NULL,
    user_id      VARCHAR(36)   NOT NULL,
    date         DATE          NOT NULL,
    time_in      TIMESTAMP,
    time_out     TIMESTAMP,
    hours_worked NUMERIC(5, 2) NOT NULL DEFAULT 0,
    status       VARCHAR(20)   NOT NULL DEFAULT 'PRESENT',
    notes        TEXT,
    created_at   TIMESTAMP     NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_time_logs    PRIMARY KEY (id),
    CONSTRAINT fk_time_logs_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_time_logs_user_date UNIQUE (user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_time_logs_user_id   ON time_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_time_logs_date      ON time_logs (date);
CREATE INDEX IF NOT EXISTS idx_time_logs_user_date ON time_logs (user_id, date);
