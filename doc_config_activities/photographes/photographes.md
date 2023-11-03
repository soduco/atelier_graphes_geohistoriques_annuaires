# Photographes

## Etat de l'art
### Articles et ouvrages
* Marc Durand (dir.). De l’image fixe à l’image animée :  1820-1910. Tome 2 : actes des notaires de Paris pour servir à l’histoire des photographes et de la photographie. Archives nationales (2015). Pierrefitte-sur-Seine.

## Choix des mots-clés
Une première liste de mots-clés a été constituée en cherchant manuellement les photographes répertoriés par Durand et al. et en relevant les mots présents de manière récurrente dans la description de leur activité. Cette liste élargie contenait trop de bruit.

Les mots-clés conservés pour l'extraction finale sont
- photo pour <i>photographe</i>, <i>photographie</i>, <i>photographique</i>
- daguer pour <i>daguerréotype</i>, <i>photographie</i>, <i>photographique</i>
- opti

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

### Paramétrage du liage avec Silk Workbench
- Label / Activity : 
    - Transformation : alphaReduce, LowerCase, normalizechars
	- Label : Tokenwise distance (0.15) ; Activity : Tokenwise distance 0.4 (+ inequality des numEntry (identifiant d'extraction) pour accélerer le processus)
	- Aggrégation : Min (le score le plus faible est supérieur ou égal à 0)
	- Seuil de confiance : 10.0% (+ d'ambiguités en dessous)

### Liage avec Silk single-machine
- NumEntry : 
	- 159402 links
	- QUelques secondes
- Label / Activity (paramétrage ci-dessus): 
	- 14h50 => 16h06 : 1h15
	- 20 775 995 links yielding 993 519 links
	- 0-9.99% : 39 968 liens | 10%-100% : 952 655 liens
- Label / Address (fichier par défaut)
	- 17h50 => 17h55 : 5 min
	- Filtered 5071335 links yielding 222374 links
- Address / Activity
	- 16h58 => 17H23 : 25 min
	- 11207085 links yielding 298466 links

Total : 1 010 332 liens (?u1 != ?u2) sans inférence

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

## Questions intéressantes 
- Déménagements
- Transmissions d'ateliers / reprises par d'autres photographes
- Partage d'ateliers