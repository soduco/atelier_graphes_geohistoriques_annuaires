/* Déclaration des schéma*/
SET SEARCH_PATH=directories_v2, public;

/* Suppression des tables de liens */
DROP TABLE IF EXISTS directories_graph.liens;
DROP TABLE IF EXISTS directories_graph.liens_externes;
DROP TABLE IF EXISTS directories_graph.liens_chargement;
DROP TABLE IF EXISTS directories_graph.geocoding;
DROP TABLE IF EXISTS directories_graph.directories_content;
DROP TABLE IF EXISTS directories_graph.dataset;

/*Création de la table directories_content*/
CREATE TABLE directories_graph.directories_content AS (
	SELECT  entries.uuid, TRANSLATE(per,'.:;\-_\(\)\[\]?!$&*/','') AS person, TRANSLATE(act,'.:;\-_\(\)\[\]?!$&*/','') AS activity, loc, cardinal, titre AS title, sources.code_ouvrage AS directory, sources.liste_annee AS published, trim(concat(cardinal, ' ', loc)) AS fulladd, addresses.uuid as id_address 
	FROM activities 
	JOIN entries
		ON activities.entry_uuid = entries.uuid
		AND activities.source = entries.source
	JOIN sources
		ON entries.source_uuid = sources.uuid
	JOIN addresses
		ON addresses.entry_uuid = activities.entry_uuid
		AND addresses.source = activities.source
	LEFT JOIN LATERAL (
		SELECT string_agg(per, ',') AS per
		FROM persons
		WHERE persons.entry_uuid = activities.entry_uuid
			AND persons.source = activities.source
			AND per IS NOT NULL
		GROUP BY entry_uuid
	) AS persons
	ON True
	LEFT JOIN LATERAL (
		SELECT string_agg(titre, ',') AS titre
		FROM titles
		WHERE titles.entry_uuid = activities.entry_uuid
			AND titles.source = activities.source
			AND titre IS NOT NULL
		GROUP BY entry_uuid
	) AS titles
	ON True
	WHERE (
	/* ************************************************************* */
        /* Modifier la liste des mots-clés selon les données à extraire  */
        /* ************************************************************* */
		(act ILIKE '%nouveauté%' 
		OR act ILIKE '%nouveaute%' 
		OR act ILIKE '%nouvaute%' 
		OR act ILIKE '%nouv.%'
		OR (
			act ILIKE '%march%' 
			AND act ILIKE '%nouv%'
		)
		OR (act ILIKE '%magasin%'
			AND act ILIKE '%nouv%'
   		)
	)
	AND (sources.liste_type = 'ListNoms')
	AND ((length(entries.ner_xml) - length(replace(entries.ner_xml, '<PER>', '' ))) / length('<PER>') <= 1));

/*Création de la table geocoding*/
CREATE TABLE directories_graph.geocoding AS (
	SELECT  entries.uuid as entry_id, addresses.uuid as address_id, geocoded_address_gazetteer.housenumber, geocoded_address_gazetteer.street, geocoded_address_gazetteer.locality, geocoded_address_gazetteer.source, ST_Transform(geocoded_address_gazetteer.geometry,4326) AS precise_geom
	FROM activities 
	JOIN entries
		ON activities.entry_uuid = entries.uuid
		AND activities.source = entries.source
	JOIN sources
		ON entries.source_uuid = sources.uuid
	JOIN addresses
		ON addresses.entry_uuid = activities.entry_uuid
		AND addresses.source = activities.source
	JOIN geocoded_address_gazetteer
		ON addresses.geocoded_gazetteer_uuid = geocoded_address_gazetteer.uuid
	LEFT JOIN LATERAL (
		SELECT string_agg(per, ',') AS per
		FROM persons
		WHERE persons.entry_uuid = activities.entry_uuid
			AND persons.source = activities.source
			AND per IS NOT NULL
		GROUP BY entry_uuid
	) AS persons
	ON True
	LEFT JOIN LATERAL (
		SELECT string_agg(titre, ',') AS titre
		FROM titles
		WHERE titles.entry_uuid = activities.entry_uuid
			AND titles.source = activities.source
			AND titre IS NOT NULL
		GROUP BY entry_uuid
	) AS titles
	ON True
	WHERE (
	/* ************************************************************* */
        /* Modifier la liste des mots-clés selon les données à extraire  */
        /* ************************************************************* */
		(act ILIKE '%nouveauté%' 
		OR act ILIKE '%nouveaute%' 
		OR act ILIKE '%nouvaute%' 
		OR act ILIKE '%nouv.%'
		OR (
			act ILIKE '%march%' 
			AND act ILIKE '%nouv%'
		)
		OR (act ILIKE '%magasin%'
			AND act ILIKE '%nouv%'
   		)
	)
	AND (sources.liste_type = 'ListNoms')
	AND ((length(entries.ner_xml) - length(replace(entries.ner_xml, '<PER>', '' ))) / length('<PER>') <= 1));
	
-- Ajout d'une clé primaire à la table principale 
ALTER TABLE directories_graph.directories_content ADD COLUMN entry_id uuid ;
UPDATE directories_graph.directories_content SET entry_id = gen_random_uuid ();
ALTER tABLE directories_graph.directories_content ADD PRIMARY KEY (entry_id);
--  Ajout d'une colonne pour stocker le graphe nommé des données 
ALTER TABLE directories_graph.directories_content ADD COLUMN graph_name character varying (50);	
ALTER TABLE directories_graph.geocoding ADD COLUMN graph_name character varying (50);
-- Ajout de la table de gestion des jeux de données / graphes nommés
CREATE TABLE directories_graph.dataset(title character varying(100), issued date, graph_name character varying(100));
ALTER TABLE directories_graph.dataset ADD COLUMN dataset_id uuid PRIMARY KEY;
/* ****************************************************************************************************************************** */
/* Modifier les propriétés du graphe nommmé selon les données extraites: identifiant, titre du jeu de données, date d'extraction  */
/* ****************************************************************************************************************************** */
UPDATE directories_graph.directories_content SET graph_name ='cartes_et_plans';
UPDATE directories_graph.geocoding SET graph_name ='cartes_et_plans';
INSERT INTO directories_graph.dataset VALUES ('Graveurs et marchands de cartes et plans', '2023-10-29', 'cartes_et_plans', gen_random_uuid ());

-- Ajout des tables de liens
CREATE TABLE IF NOT EXISTS directories_graph.liens
(
    entry_id1 uuid,
    entry_id2 uuid,
    CONSTRAINT entry_id1_fk FOREIGN KEY (entry_id1)
        REFERENCES directories_graph.directories_content (entry_id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
        NOT VALID,
    CONSTRAINT entry_id2_fk FOREIGN KEY (entry_id2)
        REFERENCES directories_graph.directories_content (entry_id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
        NOT VALID
);

CREATE TABLE IF NOT EXISTS directories_graph.liens_externes
(
    entry_id uuid,
    uri text COLLATE pg_catalog."default",
    CONSTRAINT entry_id_fk FOREIGN KEY (entry_id)
        REFERENCES directories_graph.directories_content (entry_id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
        NOT VALID
);

-- Ajout des index  
create index on directories_graph.directories_content(entry_id);
create index on directories_graph.directories_content(uuid);
create index on directories_graph.directories_content(person);
create index on directories_graph.directories_content(activity);
create index on directories_graph.directories_content(loc);
create index on directories_graph.directories_content(directory);
create index on directories_graph.directories_content(published);
create index on directories_graph.directories_content(fulladd);
create index on directories_graph.directories_content(graph_name);

create index on directories_graph.dataset(title);
create index on directories_graph.dataset(issued);
create index on directories_graph.dataset(dataset_id);
create index on directories_graph.dataset(graph_name);

create index on directories_graph.geocoding(entry_id);
create index on directories_graph.geocoding(address_id);
create index on directories_graph.geocoding(graph_name);
create index on directories_graph.geocoding(housenumber);
create index on directories_graph.geocoding(street);
create index on directories_graph.geocoding(locality);
create index on directories_graph.geocoding(source);
CREATE INDEX index_geocoding_geom
ON directories_graph.geocoding
USING gist (precise_geom);

create index on directories_graph.liens(entry_id1);
create index on directories_graph.liens(entry_id2);

create index on directories_graph.liens_externes(entry_id);
create index on directories_graph.liens_externes(uri);
