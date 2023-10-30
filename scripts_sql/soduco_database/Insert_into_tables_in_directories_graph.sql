INSERT INTO directories_graph.directories_content (uuid, person, activity,loc, cardinal,title,directory,published, fulladd, id_address, entry_id)
(
	--Pour chaque entrée, compte le nombre de '<PER>' dans la chaîne XML retournée par la pipeline NER
	WITH per_count AS (
			SELECT e.uuid, (length(e.ner_xml) - length(replace(e.ner_xml, '<PER>', '' ))) / length('<PER>') AS count_
			FROM directories_v2.entries AS e
			ORDER BY count_ DESC
		), short_list AS ( --Ne conserve que les entrées avec 0 ou 1 PER (au delà, on aura un produit cartésien de tous les attributs)
			SELECT pc.uuid
			FROM per_count AS pc
			WHERE count_ <=1)
	SELECT DISTINCT e.uuid, TRANSLATE(p.per,',.:;\-_\(\)\[\]?!$&*/','') AS person, TRANSLATE(act.act,',.:;\-_\(\)\[\]?!$&*/','') AS activity, s.loc AS loc, s.cardinal AS cardinal,
	t.titre AS title, src.code_ouvrage AS directory, src.liste_annee AS published, TRANSLATE(lower((COALESCE(s.loc,'') || ' '::text) || COALESCE(s.cardinal,'')),',.:;_\(\)\[\]?!$&*/','') AS fulladd, s.uuid AS id_address, gen_random_uuid ()
	FROM short_list AS l
	INNER JOIN directories_v2.entries AS e ON l.uuid = e.uuid
	INNER JOIN directories_v2.persons AS p ON e.uuid = p.entry_uuid
	INNER JOIN directories_v2.activities AS act ON e.uuid = act.entry_uuid
	INNER JOIN directories_v2.addresses AS s ON e.uuid = s.entry_uuid
	INNER JOIN directories_v2.titles AS t ON e.uuid = t.entry_uuid
	INNER JOIN directories_v2.sources AS src ON e.source_uuid = src.uuid
	WHERE (
		-- Sélection des entrées issues des listes par noms
        (src.liste_type ILIKE '%ListNoms%') AND
	/* ************************************************************* */
        /* Modifier la liste des mots-clés selon les données à extraire  */
        /* ************************************************************* */
      (act.act ILIKE '%nouveauté%' 
      OR act.act ILIKE '%nouveaute%' 
      OR act.act ILIKE '%nouvaute%' 
      OR (act.act ILIKE '%march%' AND act.act ILIKE '%nouv%')
      OR (act.act ILIKE '%magasin%' AND act.act ILIKE '%nouv%') 
      OR act.act ILIKE '%nouv.%' )
) ORDER BY src.liste_annee ASC);
	
INSERT INTO directories_graph.geocoding 
(
	--Pour chaque entrée, compte le nombre de '<PER>' dans la chaîne XML retournée par la pipeline NER
	WITH per_count AS (
			SELECT e.uuid, (length(e.ner_xml) - length(replace(e.ner_xml, '<PER>', '' ))) / length('<PER>') AS count_
			FROM directories_v2.entries AS e
			ORDER BY count_ DESC
		), short_list AS ( --Ne conserve que les entrées avec 0 ou 1 PER (au delà, on aura un produit cartésien de tous les attributs)
			SELECT pc.uuid
			FROM per_count AS pc
			WHERE count_ <=1)
	SELECT DISTINCT e.uuid as entry_id, s.uuid as address_id, gcd.housenumber, gcd.street, gcd.locality , gcd.source, ST_Transform(gcd.geometry,4326) AS precise_geom
	FROM short_list AS l
	INNER JOIN directories_v2.entries AS e ON l.uuid = e.uuid
	INNER JOIN directories_v2.addresses AS s ON s.entry_uuid = e.uuid
    INNER JOIN directories_v2.geocoded_address_gazetteer AS gcd ON gcd.uuid = s.geocoded_gazetteer_uuid
    INNER JOIN directories_v2.sources AS src ON e.source_uuid = src.uuid
	INNER JOIN directories_v2.activities AS act ON e.uuid = act.entry_uuid
	WHERE (
		-- Sélection des entrées issues des listes par noms
        (src.liste_type ILIKE '%ListNoms%') AND
		-- Sélection des géocodages non nuls
		(gcd.street not like '') AND
	/* ************************************************************* */
        /* Modifier la liste des mots-clés selon les données à extraire  */
        /* ************************************************************* */
      (act.act ILIKE '%nouveauté%' 
      OR act.act ILIKE '%nouveaute%' 
      OR act.act ILIKE '%nouvaute%' 
      OR (act.act ILIKE '%march%' AND act.act ILIKE '%nouv%')
      OR (act.act ILIKE '%magasin%' AND act.act ILIKE '%nouv%') 
      OR act.act ILIKE '%nouv.%' )
) ORDER BY e.uuid ASC);

-- Mise à jour des informations sur le nouveau graphe nommé (cad le nouveau jeu de données) ajouté à la base
/* ****************************************************************************************************************************** */
/* Modifier les propriétés du graphe nommmé selon les données extraites: identifiant, titre du jeu de données, date d'extraction  */
/* ****************************************************************************************************************************** */
UPDATE directories_graph.directories_content SET graph_name ='nouveautes_test' WHERE graph_name ISNULL;
UPDATE directories_graph.geocoding SET graph_name ='nouveautes_test' WHERE graph_name ISNULL;
INSERT INTO directories_graph.dataset VALUES ('Magasins de nouveautés', '2023-10-29', 'nouveautes_test', gen_random_uuid ());
