-- Création des deux schémas locaux
DROP SCHEMA IF EXISTS directories_graph;
DROP SCHEMA IF EXISTS directories_v2;
CREATE SCHEMA directories_v2;
CREATE SCHEMA directories_graph;

-- Création d'un type local pour pouvoir "importer" les données distantes
-- DROP TYPE IF EXISTS directories_v2.element_type;
CREATE TYPE directories_v2.element_type AS ENUM
    ('PAGE', 'TITLE_LEVEL_1', 'TITLE_LEVEL_2', 'SECTION_LEVEL_1', 'SECTION_LEVEL_2', 'COLUMN_LEVEL_1', 'COLUMN_LEVEL_2', 'LINE', 'ENTRY');
ALTER TYPE directories_v2.element_type
    OWNER TO postgres;

-- Connexion au serveur distant pour importer les données dans la base locale: les tables distantes sont lisibles dans les ForeignTables du schéma directories_local
CREATE EXTENSION postgres_fdw;
CREATE SERVER acces_soduco FOREIGN DATA WRAPPER postgres_fdw OPTIONS (host 'geohistoricaldata.org', dbname 'soduco', port '5432');
CREATE USER MAPPING FOR postgres SERVER acces_soduco OPTIONS (user 'soduco-ro-all', password 'soduco-ro-all', use_remote_estimate 'true');
IMPORT FOREIGN SCHEMA directories_v2 FROM SERVER acces_soduco INTO directories_v2;
