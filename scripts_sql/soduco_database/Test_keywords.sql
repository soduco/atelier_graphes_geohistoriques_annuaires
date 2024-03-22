SET SEARCH_PATH=directories_v2, public;

SELECT  DISTINCT ON (per, titre, act, loc, cardinal, sources.code_ouvrage, sources.liste_annee, sources.liste_type, entries.ner_xml)
		entries.uuid, 
		entries.ner_xml, 
		per, 
		titre, 
		act, 
		loc, 
		cardinal,  
		trim(concat(cardinal, ' ', loc)) AS fulladd, 
		sources.code_ouvrage, 
		sources.liste_annee, 
		sources.liste_type
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
WHERE ((
	/* ************************************************************* */
        /* Modifier la liste des mots-clés selon les données à extraire  */
        /* ************************************************************* */
	act ILIKE '%photo%' 
	OR act ILIKE '%daguer%' 
	OR act ILIKE '%opti%' 
	
)
AND (sources.liste_type = 'ListNoms')
AND ner_xml like '%<PER>%');
