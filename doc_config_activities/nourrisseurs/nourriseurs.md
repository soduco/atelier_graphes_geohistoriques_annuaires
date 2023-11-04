#### Les nourrisseurs dans les listes alphabetiques, toutes dates

## Liage (1ere extraction)
Détail:
* [documentation](https://github.com/soduco/atelier_graphes_geohistoriques_annuaires/blob/main/doc_config_activities/nourrisseurs/nourrisseur_extraction1.md)

## Liage (2eme extraction)
### Filtrage des mots-clefs
```sql
SELECT ...
WHERE (
    (act ILIKE '%nourrisseur%') OR
	(act ILIKE '%noürrisseur%') OR
	(act ILIKE '%nourris%')
)
```

Création DB locale en 35'46'' pour 13 708 entrées.

## Liage (2ème extraction)

### Quelques chiffres
<b>Listes par nom </b>
- 13 708 entrées
- XX ressources

### Paramétrage du liage avec Silk Workbench
:warning: BUG de Silk Workbench... N'ai pas pu l'utiliser. Paramétrage de liage de silk single-machine fondé sur l'évaluation de la 1ere extraction.

### Liage avec Silk single-machine
- NumEntry : (paramétrage par défaut)
	- 17 735 liens
	- Quelques secondes
- Label / Activity (paramétrage de la première extraction): 
	- Quelques secondes
	- 1 145 380 links yielding 347 059 links
	- 0.42-0.59 : 31 924 liens | 0.6-1 : 262 240 liens

## Questions intéressantes 
- Mouvements dans la ville (~ déménagements) vers la périphérie urbaine au fil du temps ?
- Transmission ???