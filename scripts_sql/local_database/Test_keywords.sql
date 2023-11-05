SET SEARCH_PATH=directories_v2, public;

WITH filtered_activities AS (
    SELECT *
    FROM activities
    WHERE   
	/* ************************************************************* */
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
SELECT  uuid,
        STRING_AGG(DISTINCT per, ',') AS per,
        STRING_AGG(DISTINCT titre, ',') AS titre,
        MIN(act) act,
        MIN(fulladd) fulladd,
        MIN(loc) loc,
        MIN(cardinal) cardinal,
        MIN(code_ouvrage) code_ouvrage,
        MIN(liste_annee) liste_annee,
        MIN(liste_type) liste_type
FROM
(
    SELECT  uuid,
            UNNEST(per) AS per,
            UNNEST(titre) AS titre,
            act,
            fulladd,
            loc,
            cardinal,
            code_ouvrage,
            liste_annee,
            liste_type
    FROM aggregated
) AS sub
GROUP BY uuid
