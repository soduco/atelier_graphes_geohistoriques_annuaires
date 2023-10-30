# Atelier de création de graphes de connaissances géohistoriques

## Baseline : travaux présentés à la conférence IC (Juillet 2023)

- [Article](https://hal.science/hal-04121643/)
- [Présentation](https://docs.google.com/presentation/d/1rwIu4ilWswUI7ltXQRd4-AUwcRffb8CQJ54chePoRQc/edit?usp=sharing)
- [Dépôt de code de la chaîne de traitement proposée à IC 2023](https://github.com/soduco/ic_2023_photographes_parisiens/tree/main/doc)
- [Interface de visualisation](https://soduco.github.io/ic_2023_photographes_parisiens/)

## Outils et logiciels requis

### Installation (avant l'atelier)

➡️ [Notice d'installation des logiciels suivants](https://docs.google.com/document/d/1toDmTdc2XMvecJQJZhU5ERwvb2qoIhzIRl5rI5HCcZk/edit) : 
- JDK 8
- PgAdmin 4 v7
- GraphDB
- Silk single machine
- Silk Workbench

### Aides pour l'utilisation des logiciels (pendant l'atelier)

- [PgAdmin v7](https://github.com/soduco/atelier_graphes_geohistoriques_annuaires/blob/main/doc/pgadmin4.md) : connexion à la base de donnée soduco (réseau IGN / réseau invité)
- [Graph DB](https://github.com/soduco/atelier_graphes_geohistoriques_annuaires/blob/main/doc/Tutoriel_GraphDB.pdf) : utiliser le triplestore
- [Silk Single Machine](https://github.com/soduco/atelier_graphes_geohistoriques_annuaires/blob/main/doc/silk_single_machine.md) : utiliser le .jar

## Méthodologie de création de graphes de connaissances géohistoriques à partir des annuaires du commerce parisien du XIXème siècle

 L'objectif de ce tutoriel est de créer des graphes de connaissances géohistoriques à partir des entrées d'annuaires du commerce du XIXème siècle extraites par le projet ANR SODUCO.

 Nous allons travailler sur les entrées représentant les graveurs et les marchands de cartes et plans. Vous pouvez librement adapter la méthodologie présentée ici à d'autres types d'activités figurant dans les annuaires: ébénistes, architectes, photographes, dentelières, etc. 

### 1. Extraire les entrées d'annuaires sur les graveurs et les marchands de cartes et plans

Cette étape peut être réalisée en suivant les procédures présentées dans le dossier *scripts_sql*. 

:warning: Si vous n'avez pas de compte utilisateur pour la base de données soduco, suivez la procédure présentée dans *scripts_sql / local_database*.

### 2. Convertir les données en RDF
### 3. Lier les entrées d'annuaires qui représentent un même commerce de gravure ou de vente de cartes et plans
### 4. Inférer plus de liens et exporter les liens obtenus
### 5. Importer les liens dans la base, créer et requêter le graphe
### 6. Visualiser le graphe
 
