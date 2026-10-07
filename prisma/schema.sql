-- ============================================================================
-- UniPlan — PostgreSQL DDL
-- Schema completo con vincoli, CHECK constraints e indici B-Tree
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- Tipi Enumerati
-- ---------------------------------------------------------------------------

CREATE TYPE exam_type AS ENUM (
    'SCRITTO',
    'ORALE',
    'PROGETTO',
    'LABORATORIO',
    'SCRITTO_ORALE'
);

CREATE TYPE study_session_status AS ENUM (
    'PLANNED',
    'COMPLETED',
    'SKIPPED'
);

-- ---------------------------------------------------------------------------
-- courses
-- ---------------------------------------------------------------------------

CREATE TABLE courses (
    id                  TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    codice              VARCHAR(20),
    nome                VARCHAR(200)    NOT NULL,
    cfu                 INTEGER         NOT NULL DEFAULT 6,
    semestre            INTEGER         NOT NULL,
    anno_corso          INTEGER         NOT NULL,
    difficolta_stimata  INTEGER         NOT NULL DEFAULT 3,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    -- Vincoli di dominio
    CONSTRAINT chk_courses_cfu            CHECK (cfu > 0 AND cfu <= 30),
    CONSTRAINT chk_courses_semestre       CHECK (semestre IN (1, 2)),
    CONSTRAINT chk_courses_anno_corso     CHECK (anno_corso >= 1 AND anno_corso <= 5),
    CONSTRAINT chk_courses_difficolta     CHECK (difficolta_stimata >= 1 AND difficolta_stimata <= 5)
);

CREATE INDEX idx_courses_anno_semestre ON courses (anno_corso, semestre);

-- ---------------------------------------------------------------------------
-- prerequisites (tabella di giunzione — archi del DAG)
-- ---------------------------------------------------------------------------

CREATE TABLE prerequisites (
    course_id               TEXT NOT NULL,
    prerequisite_course_id  TEXT NOT NULL,

    -- Chiave primaria composita
    PRIMARY KEY (course_id, prerequisite_course_id),

    -- Foreign keys con CASCADE
    CONSTRAINT fk_prerequisites_course
        FOREIGN KEY (course_id)
        REFERENCES courses (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_prerequisites_prereq
        FOREIGN KEY (prerequisite_course_id)
        REFERENCES courses (id)
        ON DELETE CASCADE,

    -- Impedisce self-loop diretto: un esame non può essere prerequisito di sé stesso
    CONSTRAINT chk_no_self_loop
        CHECK (course_id <> prerequisite_course_id)
);

-- Indice per lookup inverso: "quali esami dipendono da questo prerequisito?"
CREATE INDEX idx_prerequisites_prereq_course ON prerequisites (prerequisite_course_id);

-- ---------------------------------------------------------------------------
-- exam_calls (appelli d'esame)
-- ---------------------------------------------------------------------------

CREATE TABLE exam_calls (
    id          TEXT            PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    course_id   TEXT            NOT NULL,
    data_ora    TIMESTAMPTZ     NOT NULL,
    aula        VARCHAR(100),
    tipo_prova  exam_type       NOT NULL DEFAULT 'SCRITTO',
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_exam_calls_course
        FOREIGN KEY (course_id)
        REFERENCES courses (id)
        ON DELETE CASCADE
);

-- Indice composito per scheduling: trova rapidamente gli appelli di un corso ordinati per data
CREATE INDEX idx_exam_calls_course_date ON exam_calls (course_id, data_ora);

-- Indice per query temporali globali (calendario generale appelli)
CREATE INDEX idx_exam_calls_date ON exam_calls (data_ora);

-- ---------------------------------------------------------------------------
-- study_plans (piani di studio generati dallo scheduler)
-- ---------------------------------------------------------------------------

CREATE TABLE study_plans (
    id                              TEXT            PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    nome_piano                      VARCHAR(200)    NOT NULL,
    ore_studio_giornaliere_target   DOUBLE PRECISION NOT NULL DEFAULT 4.0,
    giorni_buffer_minimi            INTEGER         NOT NULL DEFAULT 3,
    created_at                      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at                      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    -- Vincoli di dominio
    CONSTRAINT chk_plans_ore_target     CHECK (ore_studio_giornaliere_target > 0 AND ore_studio_giornaliere_target <= 16),
    CONSTRAINT chk_plans_buffer         CHECK (giorni_buffer_minimi >= 0)
);

-- ---------------------------------------------------------------------------
-- study_sessions (sessioni di studio sulla timeline)
-- ---------------------------------------------------------------------------

CREATE TABLE study_sessions (
    id              TEXT                    PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    study_plan_id   TEXT                    NOT NULL,
    course_id       TEXT                    NOT NULL,
    exam_call_id    TEXT,
    data            TIMESTAMPTZ             NOT NULL,
    ore_pianificate DOUBLE PRECISION        NOT NULL DEFAULT 2.0,
    stato           study_session_status    NOT NULL DEFAULT 'PLANNED',
    note            TEXT,
    created_at      TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ             NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_sessions_plan
        FOREIGN KEY (study_plan_id)
        REFERENCES study_plans (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_sessions_course
        FOREIGN KEY (course_id)
        REFERENCES courses (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_sessions_exam_call
        FOREIGN KEY (exam_call_id)
        REFERENCES exam_calls (id)
        ON DELETE SET NULL,

    -- Vincoli di dominio
    CONSTRAINT chk_sessions_ore CHECK (ore_pianificate > 0 AND ore_pianificate <= 16)
);

-- Indice per la vista calendario di un piano
CREATE INDEX idx_study_sessions_plan_date ON study_sessions (study_plan_id, data);

-- Indice per cercare sessioni per corso
CREATE INDEX idx_study_sessions_course_date ON study_sessions (course_id, data);

-- Indice per stato (filtrare sessioni completate / skipped)
CREATE INDEX idx_study_sessions_stato ON study_sessions (stato) WHERE stato <> 'PLANNED';

-- ---------------------------------------------------------------------------
-- Trigger per aggiornamento automatico di updated_at
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER trg_study_plans_updated_at
    BEFORE UPDATE ON study_plans
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER trg_study_sessions_updated_at
    BEFORE UPDATE ON study_sessions
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

COMMIT;
