# Notaires

## Filtrage des entrées

```sql
SELECT ...
WHERE (
		(act.ner_xml ILIKE '%notaire%' OR 
		act.ner_xml ILIKE '%etude%' OR
		(act.ner_xml ILIKE '%etu%' AND act.ner_xml ILIKE '%nota%'))
)
```
Soit : 
- 21 229 lignes/ressources
- 18 016 entrées

## Liage (2ème extraction)

### Paramétrage Silk single-machine
#### Transformations sur les chaînes de caractères
- lowerCase : minuscules
- alphaReduce : supprime les caractères spéciaux
- normalizeChars : remplace les caractères accentués par des caractères non accentués

#### Critères de comparaison
<table>
  <tr>
    <th>Clé</th>
    <th>Propriété 1</th>
    <th>Distance</th>
    <th>Propriété 2</th>
    <th>Distance</th>
    <th>Seuil de confiance global</th>
  </tr>
  <tr>
    <td><b>Label / Activity<b></td>
    <td>Label</td>
    <td>levenshtein(0.1)</td>
    <td>Activity</td>
    <td>tokenwiseDistance(0.3)</td>
    <td>0%</td>
  </tr>
  <tr>
    <td><b>Label / Address<b></td>
    <td>Label</td>
    <td>levenshtein(0.1)</td>
    <td>Address</td>
    <td>streetname: levenshtein(0.3)<br>card: levenshtein(0.0)</td>
    <td>0%</td>
  </tr>
  <tr>
    <td><b>Address / Activity</b></td>
    <td>Address</td>
    <td>streetname: levenshtein(0.3)<br>card: levenshtein(0.0)</td>
    <td>Activity</td>
    <td>tokenwiseDistance(0.1)</td>
    <td>0%</td>
  </tr>
</table>

#### Aggrégation
Pour chaque paire de propriété, le score conservé pour filtrer les liens est le plus faible score de similirité obtenu.

### Résultats avec Silk
- NumEntry : 
    - Temps de calcul : quelques secondes
    - Nombre de liens : **29 326 liens**
- Label / Activity : 
    - Temps de calcul : ~4 minutes
    - Nombre de liens : **363 385 liens** (2 324 697 filtrés)
- Label / Address
    - Temps de calcul : ~1 minute
    - Nombre de liens : **12 6658 liens** (1 149 900 filtrés)
- Address / Activity
    - Temps de calcul : ~1 minute
    - Nombre de liens : **186 870 liens** (1 465 099 filtrés)

Nombre total de liens associant des ressources différentes (sans inférence) : **412 712** liens