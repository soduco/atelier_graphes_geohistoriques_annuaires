# Photographes

## Etat de l'art
### Articles et ouvrages
* Marc Durand (dir.). De l’image fixe à l’image animée :  1820-1910. Tome 2 : actes des notaires de Paris pour servir à l’histoire des photographes et de la photographie. Archives nationales (2015). Pierrefitte-sur-Seine.

## Choix des mots-clés
Une première liste de mots-clés a été constituée en cherchant manuellement les photographes répertoriés par Durand et al. et en relevant les mots présents de manière récurrente dans la description de leur activité. Cette liste élargie contenait trop de bruit.

Les mots-clés conservés pour l'extraction finale sont
- <b>photo</b> pour <i>photographe</i>, <i>photographie</i>, <i>photographique</i>
- <b>daguer</b> pour <i>daguerréotype</i>, <i>photographie</i>, <i>photographique</i>
- <b>opti</b> pour <i>opticien</i>, <i>optique</i>

## Filtrage
```sql
SELECT ...
WHERE (
		act ILIKE '%photo%' OR
		act ILIKE '%daguer%' OR
		act ILIKE '%opti%'
		)
```

## Liage (1ère extraction)

Détail : 
- [Article](https://hal.science/hal-04121643/)
- [Présentation](https://docs.google.com/presentation/d/1rwIu4ilWswUI7ltXQRd4-AUwcRffb8CQJ54chePoRQc/edit?usp=sharing)
- [Dépôt de code](https://github.com/soduco/ic_2023_photographes_parisiens/tree/main/doc)

## Liage (2ème extraction)

### Quelques chiffres
<b>Extraction complète</b>
- 66 217 entrées
- 103 884 ressources

<b>Listes par nom uniquement</b>
- 45 853 entrées
- 60 295 ressources

### Test de liage avec Silk Workbench
- Label / Activity : 
    - Transformation : alphaReduce, LowerCase, normalizechars
	- Label : Tokenwise distance (0.15) ; Activity : Tokenwise distance 0.4 (+ inequality des numEntry (identifiant d'extraction) pour accélerer le processus)
	- Aggrégation : Min (le score le plus faible est supérieur ou égal à 0)
	- Seuil de confiance : 10.0% (+ d'ambiguités en dessous)

### Liage avec Silk single-machine


### Paramétrage Silk single-machine
#### Transformations sur les chaînes de caractères : 
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
    <td>levenshtein(0.15)</td>
    <td>Activity</td>
    <td>tokenwiseDistance(0.4)</td>
    <td>10%</td>
  </tr>
  <tr>
    <td><b>Label / Address<b></td>
    <td>Label</td>
    <td>levenshtein(0.2)</td>
    <td>Address</td>
    <td>streetname: levenshtein(0.3)<br>card: levenshtein(0.0)</td>
    <td>0%</td>
  </tr>
  <tr>
    <td><b>Address / Activity</b></td>
    <td>Address</td>
    <td>streetname: levenshtein(0.3)<br>card: levenshtein(0.0)</td>
    <td>Activity</td>
    <td>tokenwiseDistance(0.3)</td>
    <td>0%</td>
  </tr>
</table>

#### Aggrégation
Pour chaque paire de propriété, le score conservé pour filtrer les liens est le plus faible score de similirité obtenu.

### Résultats avec Silk
- NumEntry : 
    - Temps de calcul : quelques secondes
    - Nombre de liens : **159 402 liens**
- Label / Activity : 
    - Temps de calcul : ~1h15 minutes
    - Nombre de liens : **993 519 liens** (20 775 995)
	- 0-9.99% : 39 968 liens | 10%-100% : 952 655 liens
- Label / Address
    - Temps de calcul : ~5 minute
    - Nombre de liens : **222 374 liens** (507 1335 filtrés)
- Address / Activity
    - Temps de calcul : ~25 minute
    - Nombre de liens : **298 466 liens** (11 207 085 filtrés)

Nombre total de liens associant des ressources différentes (sans inférence) : **1 010 332 liens**

## Liage avec données de la BNF
Endpoint BNF : https://data.bnf.fr/sparql/
```sparql
PREFIX bnf-onto: <http://data.bnf.fr/ontology/bnf-onto/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX rdagroup2elements: <http://rdvocab.info/ElementsGr2/>
CONSTRUCT {
 ?s a foaf:Person;
 bnf-onto:firstYear ?fy ;
 bnf-onto:lastYear ?ly ; 
 skos:prefLabel ?pf;
 skos:altLabel ?al.
}
WHERE {
  ?c a skos:Concept; skos:prefLabel ?pf; skos:altLabel ?al; foaf:focus ?s.
  ?s a foaf:Person ;
  bnf-onto:firstYear ?fy ;
  bnf-onto:lastYear ?ly ;
  rdagroup2elements:countryAssociatedWithThePerson <http://id.loc.gov/vocabulary/countries/fr> ;
  rdagroup2elements:fieldOfActivityOfThePerson <http://dewey.info/class/770/>, "Photographie" .
  Filter (?fy > 1740 && ?fy < 1890)
} 
```
Ajouté au graphe : uniquement les liens validés dans Silk Workbench (~ 130)

## Questions intéressantes 
- Déménagements
- Transmissions d'ateliers / reprises par d'autres photographes
- Partage d'ateliers

## Exemples intéressants
- Nadar
- Marville
- Chevallier/Chevalier
- Léon Gaumont / Comptoir de la photographie