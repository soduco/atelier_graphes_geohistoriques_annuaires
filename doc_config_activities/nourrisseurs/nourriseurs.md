#### Les ebenistes entre 1845 et 1885 dans les listes alphabetiques
Config de Julie.

##### init query: creation du graphe
Specification de recherche, avec transformation dans le graphe de certains patterns (regex):
```SQL
WITH per_count AS (
			SELECT e.index, (length(e.ner_xml) - length(replace(e.ner_xml, '<PER>', '' ))) / length('<PER>') AS count_
			FROM directories.elements AS e
			ORDER BY count_ DESC
		), short_list AS ( --Ne conserve que les entrées avec 0 ou 1 PER (au delà, on aura un produit cartésien de tous les attributs)
			SELECT pc.index
			FROM per_count AS pc
			WHERE count_ <=1)
	SELECT DISTINCT e.index, TRANSLATE(p.ner_xml,'éëèêàçôö,.:;\-_\(\)\[\]?!$&','eeeeacoo') AS person, TRANSLATE(act.ner_xml,'éëèêàçôö,.:;\-_\(\)\[\]?!$&','eeeeacoo') AS activity, s.loc AS loc, s.cardinal AS cardinal,
	-- change TRANSLATE in unaccent()
	t.ner_xml AS title, e.directory, e.published, TRANSLATE(lower((COALESCE(s.loc,'') || ' '::text) || COALESCE(s.cardinal,'')),'éëèêàçôö,.:;\-_\(\)\[\]?!$&','eeeeacoo') AS fulladd, s.index AS id_address
	FROM short_list AS l
	INNER JOIN directories.elements AS e ON l.index = e.index
	INNER JOIN directories.persons AS p ON e.index = p.entry_id
	INNER JOIN directories.activities AS act ON e.index = act.entry_id
	INNER JOIN directories.addresses AS s ON e.index = s.entry_id
	INNER JOIN directories.titles AS t ON e.index = t.entry_id
	INNER JOIN directories.sources AS w ON e.directory = w.code_fichier
	WHERE (
		-- Liste des mots-clés: à adapter!
		(e.view BETWEEN w.npage_pdf_d AND w.npage_pdf_f) AND
        (w.liste_type ILIKE '%ListNoms%') AND
		((act.ner_xml ILIKE '%nourrisseur%') OR
		(act.ner_xml ILIKE '%noürrisseur%') OR
		(act.ner_xml ILIKE '%nourris%'))
		)
	ORDER BY e.index, e.published ASC);
```

##### configuration silk-workbench
Sans personnes/adresses car l'objectif est de travailler uniquement sur les nourriseurs et non les transformations d'activites des personnes ayant ete a un moment donne ebenistes.

###### personnes et activites
![](https://raw.githubusercontent.com/soduco/atelier_graphes_geohistoriques_annuaires/main/doc_config_activities/img/nourriseurs_activity_name.png)

###### activites et adresses
Meme config que pour les ebenistes:
![](https://raw.githubusercontent.com/soduco/atelier_graphes_geohistoriques_annuaires/main/doc_config_activities/img/ebenistes_activity_adress.png)