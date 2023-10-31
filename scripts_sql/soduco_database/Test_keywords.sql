WITH per_count AS (
			SELECT e.uuid, (length(e.ner_xml) - length(replace(e.ner_xml, '<PER>', '' ))) / length('<PER>') AS count_
			FROM directories_v2.entries AS e
			ORDER BY count_ DESC
		), short_list AS ( --Ne conserve que les entrées avec 0 ou 1 PER (au delà, on aura un produit cartésien de tous les attributs)
			SELECT pc.uuid
			FROM per_count AS pc
			WHERE count_ <=100)
	SELECT DISTINCT e.uuid, e.ner_xml, p.per AS person, act.act AS activity, s.loc AS loc, s.cardinal AS cardinal,
	t.titre AS title, src.code_ouvrage, src.liste_annee, lower((COALESCE(s.loc,'') || ' '::text) || COALESCE(s.cardinal,'')) AS fulladd
	FROM short_list AS l
	INNER JOIN directories_v2.entries AS e ON l.uuid = e.uuid
	INNER JOIN directories_v2.persons AS p ON e.uuid = p.entry_uuid
	INNER JOIN directories_v2.activities AS act ON e.uuid = act.entry_uuid
	INNER JOIN directories_v2.addresses AS s ON e.uuid = s.entry_uuid
	INNER JOIN directories_v2.titles AS t ON e.uuid = t.entry_uuid
	INNER JOIN directories_v2.sources AS src ON e.source_uuid = src.uuid
	WHERE (
	/* ************************************************************* */
        /* Modifier la liste des mots-clés selon les données à extraire  */
        /* ************************************************************* */
		act.act ILIKE '%photo%' OR
		act.act ILIKE '%daguer%' OR
		act.act ILIKE '%opti%'
		)
	ORDER BY src.liste_annee ASC;
