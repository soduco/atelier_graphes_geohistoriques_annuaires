-- Création des tables locales utiles et import des données sur une profession, sélectionnées par mots-clés

-- Suppression des tables si elles existent
DROP TABLE IF EXISTS directories_graph.liens;
DROP TABLE IF EXISTS directories_graph.liens_externes;
DROP TABLE IF EXISTS directories_graph.liens_chargement;
DROP TABLE IF EXISTS directories_graph.geocoding;
DROP TABLE IF EXISTS directories_graph.directories_content;
DROP TABLE IF EXISTS directories_graph.dataset;

-- Création de la table directories_content
CREATE TABLE directories_graph.directories_content AS (
	--Pour chaque entrée, compte le nombre de '<PER>' dans la chaîne XML retournée par la pipeline NER
	WITH per_count AS (
			SELECT e.uuid, (length(e.ner_xml) - length(replace(e.ner_xml, '<PER>', '' ))) / length('<PER>') AS count_
			FROM directories_local.entries AS e
			ORDER BY count_ DESC
		), short_list AS ( --Ne conserve que les entrées avec 0 ou 1 PER (au delà, on aura un produit cartésien de tous les attributs)
			SELECT pc.uuid
			FROM per_count AS pc
			WHERE count_ <=1)
	SELECT DISTINCT e.uuid, TRANSLATE(p.per,',.:;\-_\(\)\[\]?!$&*/','') AS person, TRANSLATE(act.act,',.:;\-_\(\)\[\]?!$&*/','') AS activity, s.loc AS loc, s.cardinal AS cardinal,
	t.titre AS title, src.code_ouvrage AS directory, src.liste_annee AS published, TRANSLATE(lower((COALESCE(s.loc,'') || ' '::text) || COALESCE(s.cardinal,'')),',.:;_\(\)\[\]?!$&*/','') AS fulladd, s.uuid AS id_address
	FROM short_list AS l
	INNER JOIN directories_local.entries AS e ON l.uuid = e.uuid
	INNER JOIN directories_local.persons AS p ON e.uuid = p.entry_uuid
	INNER JOIN directories_local.activities AS act ON e.uuid = act.entry_uuid
	INNER JOIN directories_local.addresses AS s ON e.uuid = s.entry_uuid
	INNER JOIN directories_local.titles AS t ON e.uuid = t.entry_uuid
	INNER JOIN directories_local.sources AS src ON e.source_uuid = src.uuid
	WHERE (
		-- Sélection des entrées issues des listes par noms
        (src.liste_type ILIKE '%ListNoms%') AND
		/* ************************************************************* */
        /* Modifier la liste des mots-clés selon les données à extraire  */
        /* ************************************************************* */
		(act.act ILIKE '%atlas%' AND act.act ILIKE '%cart%')OR
		(act.act ILIKE '%cart%' AND act.act ILIKE '%géo%')OR
		(act.act ILIKE '%cart%' AND act.act ILIKE '%geo%')OR
		(act.act ILIKE '%cart%' AND act.act ILIKE '%marin%')OR
		(act.act ILIKE '%plan%' AND act.act ILIKE '%topograph%')OR
		(act.act ILIKE '%cart%' AND act.act ILIKE '%topograph%')
		)
	ORDER BY src.liste_annee ASC);
	

-- Création de la table geocoding
CREATE TABLE directories_graph.geocoding AS (
	--Pour chaque entrée, compte le nombre de '<PER>' dans la chaîne XML retournée par la pipeline NER
	WITH per_count AS (
			SELECT e.uuid, (length(e.ner_xml) - length(replace(e.ner_xml, '<PER>', '' ))) / length('<PER>') AS count_
			FROM directories_local.entries AS e
			ORDER BY count_ DESC
		), short_list AS ( --Ne conserve que les entrées avec 0 ou 1 PER (au delà, on aura un produit cartésien de tous les attributs)
			SELECT pc.uuid
			FROM per_count AS pc
			WHERE count_ <=1)
	SELECT DISTINCT e.uuid as entry_id, s.uuid as address_id, gcd.housenumber, gcd.street, gcd.locality , gcd.source, ST_Transform(gcd.geometry,4326) AS precise_geom
	FROM short_list AS l
	INNER JOIN directories_local.entries AS e ON l.uuid = e.uuid
	INNER JOIN directories_local.addresses AS s ON s.entry_uuid = e.uuid
    INNER JOIN directories_local.geocoded_address_gazetteer AS gcd ON gcd.uuid = s.geocoded_gazetteer_ref_uuid
    INNER JOIN directories_local.sources AS src ON e.source_uuid = src.uuid
	INNER JOIN directories_local.activities AS act ON e.uuid = act.entry_uuid
	WHERE (
		-- Sélection des entrées issues des listes par noms
        (src.liste_type ILIKE '%ListNoms%') AND
		-- Sélection des géocodages non nuls
		(gcd.street not like '') AND
		/* ************************************************************* */
        /* Modifier la liste des mots-clés selon les données à extraire  */
        /* ************************************************************* */
		((act.act ILIKE '%atlas%' AND act.act ILIKE '%cart%')OR
		(act.act ILIKE '%cart%' AND act.act ILIKE '%géo%')OR
		(act.act ILIKE '%cart%' AND act.act ILIKE '%geo%')OR
		(act.act ILIKE '%cart%' AND act.act ILIKE '%marin%')OR
		(act.act ILIKE '%plan%' AND act.act ILIKE '%topograph%')OR
		(act.act ILIKE '%cart%' AND act.act ILIKE '%topograph%')
	))
	ORDER BY e.uuid ASC);

	

-- Ajout d'une clé primaire à la table principale                 
ALTER TABLE directories_graph.directories_content ADD COLUMN entry_id uuid ;
UPDATE directories_graph.directories_content SET entry_id = gen_random_uuid ();
ALTER tABLE directories_graph.directories_content ADD PRIMARY KEY (entry_id);
-- Ajout d'une colonne pour stocker le graphe nommé des données
ALTER TABLE directories_graph.directories_content ADD COLUMN graph_name character varying (50);	
ALTER TABLE directories_graph.geocoding ADD COLUMN graph_name character varying (50);
-- Ajout d'une table pour gérer différents graphes nommés (cad plusieurs jeux de données)
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
CREATE INDEX ON directories_graph.directories_content(entry_id);
CREATE INDEX ON directories_graph.directories_content(uuid);
CREATE INDEX ON directories_graph.directories_content(person);
CREATE INDEX ON directories_graph.directories_content(activity);
CREATE INDEX ON directories_graph.directories_content(loc);
CREATE INDEX ON directories_graph.directories_content(directory);
CREATE INDEX ON directories_graph.directories_content(published);
CREATE INDEX ON directories_graph.directories_content(fulladd);
CREATE INDEX ON directories_graph.directories_content(graph_name);

CREATE INDEX ON directories_graph.dataset(title);
CREATE INDEX ON directories_graph.dataset(issued);
CREATE INDEX ON directories_graph.dataset(dataset_id);
CREATE INDEX ON directories_graph.dataset(graph_name);

CREATE INDEX ON directories_graph.geocoding(entry_id);
CREATE INDEX ON directories_graph.geocoding(address_id);
CREATE INDEX ON directories_graph.geocoding(graph_name);
CREATE INDEX ON directories_graph.geocoding(housenumber);
CREATE INDEX ON directories_graph.geocoding(street);
CREATE INDEX ON directories_graph.geocoding(locality);
CREATE INDEX ON directories_graph.geocoding(source);
CREATE INDEX index_geocoding_geom
ON directories_graph.geocoding
USING gist (precise_geom);

CREATE INDEX ON directories_graph.liens(entry_id1);
CREATE INDEX ON directories_graph.liens(entry_id2);

CREATE INDEX ON directories_graph.liens_externes(entry_id);
CREATE INDEX ON directories_graph.liens_externes(uri);
