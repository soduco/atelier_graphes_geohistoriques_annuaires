#### Les nourrisseurs dans les listes alphabetiques, toutes dates

## Liage (1ere extraction)
Détail:
* [documentation](https://github.com/soduco/atelier_graphes_geohistoriques_annuaires/blob/main/doc_config_activities/nourrisseurs/nourriseurs_extraction1.md)

## Liage (2eme extraction)
### Filtrage des mots-clefs
```sql
SELECT ...
WHERE (
    (act.ner_xml ILIKE '%nourrisseur%') OR
	(act.ner_xml ILIKE '%noürrisseur%') OR
	(act.ner_xml ILIKE '%nourris%')
)
```

Création DB locale en 35'46'' pour 13 708 entrées.

## Liage (2ème extraction)

### Quelques chiffres
<b>Listes par nom </b>
- 13 708 entrées
- XX ressources

### Paramétrage du liage avec Silk Workbench
- Label / Activity : 
    - Transformation : alphaReduce, LowerCase, normalizechars
	- Label : Tokenwise distance (0.15) ; Activity : Tokenwise distance 0.4 (+ inequality des numEntry (identifiant d'extraction) pour accélerer le processus)
	- Aggrégation :
	- Seuil de confiance :

### Liage avec Silk single-machine


## Questions intéressantes 
- Mouvements dans la ville (~ déménagements) vers la périphérie urbaine au fil du temps ?
- Transmission ???