/* Déclaration des schémas*/
SET SEARCH_PATH=directories_v2, public;

INSERT INTO directories_graph.directories_content (uuid, person, activity,loc, cardinal,title,directory,published, fulladd, id_address, entry_id)
	SELECT  entries.uuid, TRANSLATE(per,'.:;\-_\(\)\[\]?!$&*/','') AS person, TRANSLATE(act,'.:;\-_\(\)\[\]?!$&*/','') AS activity, loc, cardinal, titre AS title, sources.code_ouvrage AS directory, sources.liste_annee AS published, trim(concat(cardinal, ' ', loc)) AS fulladd, addresses.uuid as id_address,  gen_random_uuid () 
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
		(act ILIKE '%atlas%' AND act ILIKE '%cart%')OR
		(act ILIKE '%cart%' AND act ILIKE '%géo%')OR
		(act ILIKE '%cart%' AND act ILIKE '%geo%')OR
		(act ILIKE '%cart%' AND act ILIKE '%marin%')OR
		(act ILIKE '%plan%' AND act ILIKE '%topograph%')OR
		(act ILIKE '%cart%' AND act ILIKE '%topograph%')
	)
	AND sources.liste_type = 'ListNoms';
	
	
	
INSERT INTO directories_graph.geocoding 
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
		(act ILIKE '%atlas%' AND act ILIKE '%cart%')OR
		(act ILIKE '%cart%' AND act ILIKE '%géo%')OR
		(act ILIKE '%cart%' AND act ILIKE '%geo%')OR
		(act ILIKE '%cart%' AND act ILIKE '%marin%')OR
		(act ILIKE '%plan%' AND act ILIKE '%topograph%')OR
		(act ILIKE '%cart%' AND act ILIKE '%topograph%')
	)
	AND sources.liste_type = 'ListNoms';

-- Mise à jour des informations sur le nouveau graphe nommé (cad le nouveau jeu de données) ajouté à la base
/* ****************************************************************************************************************************** */
/* Modifier les propriétés du graphe nommmé selon les données extraites: identifiant, titre du jeu de données, date d'extraction  */
/* ****************************************************************************************************************************** */
UPDATE directories_graph.directories_content SET graph_name ='cartes_et_plans' WHERE graph_name ISNULL;
UPDATE directories_graph.geocoding SET graph_name ='cartes_et_plans' WHERE graph_name ISNULL;
INSERT INTO directories_graph.dataset VALUES ('Graveurs et marchands de cartes et plans', '2023-11-01', 'cartes_et_plans', gen_random_uuid ());
