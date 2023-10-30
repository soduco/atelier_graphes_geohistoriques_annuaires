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

1) Lancer GraphDB et créer un nouveau dépôt (Configurer / Dépôts / Créer un nouveau dépôt) en choisissant de créer un dépôt "SPARQL virtuel Ontop". Ce type de dépôt permet de créer un graphe de données RDF "virtuel" en allant lire les données dans une base de données relationnelles et en les convertissant à la volée en RDF en suivant des règles de conversion décrites dans un fichier de mapping. Complétez le formulaire de création avec les informations suivantes (on suppose que l'on travaille sur une base PostgreSQL locale, installée avec les paramètres par défaut):
   * ID du dépôt: cartes_et_plans
   * Pilote de bases de données: PostgreSQL
   * Nom de l'hôte: localhost
   * Port: 5432
   * Nom de la base de données: le nom de votre base PostgreSQL locale.
   * Nom d'utilisateur: postgres
   * Mot de passe: le mot de passe de votre base de données PostgreSQL locale (postgres?)
   * Fichier OBDA ou R2RML: chargez le fichier *scripts_r2rml / directory_mapping_liage.ttl*
 Cliquez sur Test de connexion pour vous assurer que cela fonctionne. Validez ensuite votre formulaire pour créer le dépôt. Il doit apparaître dans la liste des dépôts existants (Configurer / Dépôts). 
2)  Sélectionner le dépôt que vous venez de créer pour pouvoir travailler dessus.
3)  Aller dans SPARQL pour tester le bon accès aux données en exécutant la requête suivante:
    ```sparql
    SELECT * WHERE { 
    GRAPH <http://rdf.geohistoricaldata.org/id/directories/cartes_et_plans>
    { ?s ?p ?o .}
     } limit 100 
    ```
4)  Exporter les données pour créer un dépôt local qui servira à regrouper les liens et en inférer de nouveaux. Pour cela, exécuter la requête suivante et demander à télécharger les résultats en Turtle.
    ```sparql
    CONSTRUCT {?s ?p ?o} 
    WHERE { 
    GRAPH <http://rdf.geohistoricaldata.org/id/directories/cartes_et_plans>
    { ?s ?p ?o .}
    } 
    ```
5)  Créer un nouveau dépôt en choisissant de créer un dépôt "GraphDB". Compléter le formulaire avec les informations suivantes:
   * ID du dépôt : cartes_et_plans_local
   * Décocher l'option "Disable owl:sameAs"
Valider le formulaire pour créer le dépôt.
6)  Sélectionner le dépôt que vous venez de créer pour pouvoir travailler dessus.
7) Charger les données que vous venez d'exporter (Importer / Télécharger des fichiers RDF). Une fois votre fichier en liste d'attente, le sélectionner et cliquer sur "Importer". Compléter le formulaire avec les valeurs suivantes:  
   * Base IRI : http://rdf.geohistoricaldata.org/id/directories/entry/
   * Cocher l'option "Graphe nommé"
   * Graphes cibles: http://rdf.geohistoricaldata.org/id/directories/cartes_et_plans

### 3. Lier les entrées d'annuaires qui représentent un même commerce de gravure ou de vente de cartes et plans
### 4. Inférer plus de liens et exporter les liens obtenus
### 5. Importer les liens dans la base, créer et requêter le graphe
### 6. Visualiser le graphe
 
