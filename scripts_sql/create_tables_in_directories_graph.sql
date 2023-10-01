DROP TABLE IF EXISTS directories_graph.directories_content;

CREATE TABLE directories_graph.directories_content AS (
	--Pour chaque entrée, compte le nombre de '<PER>' dans la chaîne XML retournée par la pipeline NER
	WITH per_count AS (
			SELECT e.index, (length(e.ner_xml) - length(replace(e.ner_xml, '<PER>', '' ))) / length('<PER>') AS count_
			FROM directories.elements AS e
			ORDER BY count_ DESC
		), short_list AS ( --Ne conserve que les entrées avec 0 ou 1 PER (au delà, on aura un produit cartésien de tous les attributs)
			SELECT pc.index
			FROM per_count AS pc
			WHERE count_ <=1)
	SELECT DISTINCT e.index, p.ner_xml AS person, act.ner_xml AS activity, s.loc AS loc, s.cardinal AS cardinal,
	t.ner_xml AS title, e.directory, e.published, lower((COALESCE(s.loc,'') || ' '::text) || COALESCE(s.cardinal,'')) AS fulladd
	FROM short_list AS l
	INNER JOIN directories.elements AS e ON l.index = e.index
	INNER JOIN directories.persons AS p ON e.index = p.entry_id
	INNER JOIN directories.activities AS act ON e.index = act.entry_id
	INNER JOIN directories.addresses AS s ON e.index = s.entry_id
	INNER JOIN directories.titles AS t ON e.index = t.entry_id
	WHERE (
		-- Liste des mots-clés
		act.ner_xml ILIKE '%atlas%' OR 
		act.ner_xml ILIKE '%cartes géograph%' OR 
		act.ner_xml ILIKE '%lithogra%' OR 
		(act.ner_xml ILIKE '%grav%' AND act.ner_xml ILIKE '%douce%') OR 
		(act.ner_xml ILIKE '%grav%' AND act.ner_xml ILIKE '%méta%')
		)
	ORDER BY e.index, e.published ASC);
	


/*Création de la table geocoding*/
DROP TABLE IF EXISTS directories_graph.geocoding;

CREATE TABLE directories_graph.geocoding AS (
	--Pour chaque entrée, compte le nombre de '<PER>' dans la chaîne XML retournée par la pipeline NER
	WITH per_count AS (
			SELECT e.index, (length(e.ner_xml) - length(replace(e.ner_xml, '<PER>', '' ))) / length('<PER>') AS count_
			FROM directories.elements AS e
			ORDER BY count_ DESC
		), short_list AS ( --Ne conserve que les entrées avec 0 ou 1 PER (au delà, on aura un produit cartésien de tous les attributs)
			SELECT pc.index
			FROM per_count AS pc
			WHERE count_ <=1)
	SELECT DISTINCT e.index as entry_id, g.index as id_address, g."precise.geo_response" AS precise_geo_response, ST_Transform(ST_GeomFromText(g."precise.geom",2154),4326) AS precise_geom
	FROM short_list AS l
	INNER JOIN directories.elements AS e ON l.index = e.index
	INNER JOIN directories.activities AS act ON e.index = act.entry_id
	INNER JOIN directories.geocoding AS g ON e.index = g.entry_id
	WHERE (
		(g."precise.geo_response" not like '')
		AND(
		-- Liste des mots-clés
		act.ner_xml ILIKE '%atlas%' OR 
		act.ner_xml ILIKE '%cartes géograph%' OR 
		act.ner_xml ILIKE '%lithogra%' OR 
		(act.ner_xml ILIKE '%grav%' AND act.ner_xml ILIKE '%douce%') OR 
		(act.ner_xml ILIKE '%grav%' AND act.ner_xml ILIKE '%méta%')
		))
	ORDER BY e.index);

	
/* ********************************************************* */
/*    Ajout d'une clé primaire à la table principale                               */
/* ******************************************************** */
ALTER TABLE directories_graph.directories_content ADD COLUMN entry_id serial PRIMARY KEY;
/* ********************************************************* */
/*    Ajout d'une colonne pour stocker le graphe nommé des données                               */
/* ******************************************************** */
ALTER TABLE directories_graph.directories_content ADD COLUMN graph_name character varying (50);	
UPDATE directories_graph.directories_content SET graph_name ='graveurs_de_cartes';
ALTER TABLE directories_graph.geocoding ADD COLUMN graph_name character varying (50);	
UPDATE directories_graph.geocoding SET graph_name ='graveurs_de_cartes';

/* ********************************************************* */
/*    On complète la table des graphes nommés                */
/* ******************************************************** */
DROP TABLE directories_graph.dataset;
CREATE TABLE directories_graph.dataset(title character varying(100), issued date, graph_name character varying(100));
ALTER TABLE directories_graph.dataset ADD COLUMN dataset_id serial PRIMARY KEY;
INSERT INTO directories_graph.dataset VALUES ('Graveurs et imprimeurs de cartes', '2023-09-27', 'graveurs_de_cartes');


/* ********************************************************* */
/*    Ajout des tables de liens                */
/* ******************************************************** */

DROP TABLE IF EXISTS directories_graph.liens;

CREATE TABLE IF NOT EXISTS directories_graph.liens
(
    entry_id1 bigint,
    entry_id2 bigint,
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

DROP TABLE IF EXISTS directories_graph.liens_externes;

CREATE TABLE IF NOT EXISTS directories_graph.liens_externes
(
    entry_id bigint,
    uri text COLLATE pg_catalog."default",
    CONSTRAINT entry_id_fk FOREIGN KEY (entry_id)
        REFERENCES directories_graph.directories_content (entry_id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
        NOT VALID
);

/* ********************************************************* */
/*    Ajout des index               */
/* ******************************************************** */
create index on directories_graph.directories_content(index);
create index on directories_graph.directories_content(person);
create index on directories_graph.directories_content(activity);
create index on directories_graph.directories_content(loc);
create index on directories_graph.directories_content(directory);
create index on directories_graph.directories_content(fulladd);
create index on directories_graph.directories_content(entry_id);
create index on directories_graph.directories_content(graph_name);

create index on directories_graph.dataset(title);
create index on directories_graph.dataset(issued);
create index on directories_graph.dataset(dataset_id);
create index on directories_graph.dataset(graph_name);

create index on directories_graph.geocoding(entry_id);
create index on directories_graph.geocoding(id_address);
create index on directories_graph.geocoding(graph_name);
create index on directories_graph.geocoding(precise_geo_response);
CREATE INDEX index_geocoding_geom
ON directories_graph.geocoding
USING gist (precise_geom);

create index on directories_graph.liens(entry_id1);
create index on directories_graph.liens(entry_id2);

create index on directories_graph.liens_externes(entry_id);
create index on directories_graph.liens_externes(uri);





