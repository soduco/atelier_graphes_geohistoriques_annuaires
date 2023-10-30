-- Création des deux schémas locaux
DROP SCHEMA IF EXISTS directories_local;
DROP SCHEMA IF EXISTS directories_graph;
CREATE SCHEMA directories_local;
CREATE SCHEMA directories_graph;

-- Connexion au serveur distant pour importer les données dans la base locale: les tables distantes sont lisibles dans les ForeignTables du schéma directories_local
CREATE EXTENSION postgres_fdw;
CREATE SERVER acces_soduco FOREIGN DATA WRAPPER postgres_fdw OPTIONS (host 'geohistoricaldata.org', dbname 'soduco', port '5432');
CREATE USER MAPPING FOR postgres SERVER acces_soduco OPTIONS (user 'soduco-ro-all', password 'soduco-ro-all');
IMPORT FOREIGN SCHEMA directories_v2 FROM SERVER acces_soduco INTO directories_local;
