INSERT INTO directories_graph.directories_content 
(
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
		-- Liste des mots-clés: à adapter!
		act.ner_xml ILIKE '%ébéniste%' OR 
		act.ner_xml ILIKE '%ebeniste%' OR 
		act.ner_xml ILIKE '%ébeniste%' OR 
		act.ner_xml ILIKE '%ebéniste%' 
		)
	ORDER BY e.index, e.published ASC);
	
INSERT INTO directories_graph.geocoding 
(
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
		-- Liste des mots-clés: à adapter!
		act.ner_xml ILIKE '%ébéniste%' OR 
		act.ner_xml ILIKE '%ebeniste%' OR 
		act.ner_xml ILIKE '%ébeniste%' OR 
		act.ner_xml ILIKE '%ebéniste%'))
	ORDER BY e.index);

-- Liste des jeux de données: à adapter!
UPDATE directories_graph.directories_content SET graph_name ='ebenistes' WHERE graph_name ISNULL;
INSERT INTO directories_graph.dataset VALUES ('Ebenistes', '2023-09-27', 'ebenistes');
