SET SEARCH_PATH=directories_v2, public;

SELECT  entries.uuid, 
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
WHERE (
	/* ************************************************************* */
        /* Modifier la liste des mots-clés selon les données à extraire  */
        /* ************************************************************* */
	act ILIKE '%nouveauté%' 
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
AND sources.liste_type = 'ListNoms'
