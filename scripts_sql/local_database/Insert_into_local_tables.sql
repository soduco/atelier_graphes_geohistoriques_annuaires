/* Déclaration des schémas*/
SET SEARCH_PATH=directories_v2, public;

INSERT INTO directories_graph.directories_content (uuid, person, activity,loc, cardinal,title,directory,published, fulladd, id_address, geocoded_gazetteer_uuid, entry_id)
	/* Filtrage des activités */
	WITH filtered_activities AS (
    SELECT *
    FROM activities
    WHERE   /* ************************************************************* */
        /* Modifier la liste des mots-clés selon les données à extraire  */
        /* ************************************************************* */
        (act ILIKE '%atlas%' AND act ILIKE '%cart%')OR
        (act ILIKE '%cart%' AND act ILIKE '%géo%')OR
        (act ILIKE '%cart%' AND act ILIKE '%geo%')OR
        (act ILIKE '%cart%' AND act ILIKE '%marin%')OR
        (act ILIKE '%plan%' AND act ILIKE '%topograph%')OR
        (act ILIKE '%cart%' AND act ILIKE '%topograph%')
),
aggregated AS (
    SELECT  entries.uuid,
            ARRAY_AGG(per) OVER (PARTITION BY persons.entry_uuid) AS per,
            ARRAY_AGG(titre) OVER (PARTITION BY titles.entry_uuid) AS titre,
            act,
            trim(concat(cardinal, ' ', loc)) AS fulladd,
            loc,
            cardinal,
			addresses.uuid AS address_id,
			addresses.geocoded_gazetteer_uuid,
            sources.code_ouvrage,
            sources.liste_annee,
            sources.liste_type
    FROM filtered_activities
    JOIN entries
    ON filtered_activities.entry_uuid = entries.uuid
    AND filtered_activities.source = entries.source
    JOIN ( SELECT * FROM sources WHERE liste_type = 'ListNoms' ) AS sources
    ON entries.source_uuid = sources.uuid
    LEFT JOIN persons
    ON persons.entry_uuid = filtered_activities.entry_uuid
    AND persons.source = filtered_activities.source
    LEFT JOIN titles
    ON titles.entry_uuid = filtered_activities.entry_uuid
    AND titles.source = filtered_activities.source
    LEFT JOIN addresses
    ON addresses.entry_uuid = filtered_activities.entry_uuid
    AND addresses.source = filtered_activities.source
)
SELECT  DISTINCT ON(act, fulladd, loc, cardinal, address_id, geocoded_gazetteer_uuid, code_ouvrage, liste_annee)
		uuid,
        STRING_AGG(DISTINCT per, ',') AS person,
		act AS activity,
		loc,
        cardinal,
        STRING_AGG(DISTINCT titre, ',') AS title,
		code_ouvrage  AS directory,
        liste_annee AS published,
        fulladd,
		address_id,
		geocoded_gazetteer_uuid,
	    gen_random_uuid () 
FROM
(
    SELECT  uuid,
            UNNEST(per) AS per,
            UNNEST(titre) AS titre,
            act,
            fulladd,
            loc,
            cardinal,
			address_id,
			geocoded_gazetteer_uuid,
            code_ouvrage,
            liste_annee
    FROM aggregated
) AS sub
GROUP BY uuid, activity, fulladd, loc, cardinal, address_id, geocoded_gazetteer_uuid, directory, published
;

	
	
INSERT INTO directories_graph.geocoding 
SELECT	
	directories_content.uuid as entry_id, 
	id_address ad address_id, 
	geocoded_address_gazetteer.housenumber, 
	geocoded_address_gazetteer.street, 
	geocoded_address_gazetteer.locality, 
	geocoded_address_gazetteer.source, 
	ST_Transform(geocoded_address_gazetteer.geometry,4326) AS precise_geom
FROM directories_graph.directories_content
LEFT JOIN geocoded_address_gazetteer
ON directories_content.geocoded_gazetteer_uuid = geocoded_address_gazetteer.uuid;
	

-- Mise à jour des informations sur le nouveau graphe nommé (cad le nouveau jeu de données) ajouté à la base
/* ****************************************************************************************************************************** */
/* Modifier les propriétés du graphe nommmé selon les données extraites: identifiant, titre du jeu de données, date d'extraction  */
/* ****************************************************************************************************************************** */
UPDATE directories_graph.directories_content SET graph_name ='cartes_et_plans_insert' WHERE graph_name ISNULL;
UPDATE directories_graph.geocoding SET graph_name ='cartes_et_plans_insert' WHERE graph_name ISNULL;
INSERT INTO directories_graph.dataset VALUES ('Graveurs et marchands de cartes et plans - test', '2023-11-01', 'cartes_et_plans_insert', gen_random_uuid ());
