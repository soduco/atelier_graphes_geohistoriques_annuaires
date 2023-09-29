
# Mise en place du triplestore

1. Ouvrir le tunnel ssh vers la base de données soduco
2. Télécharger la lib JDBC (.jar) pour Postgres SQL sur le site suivant https://jdbc.postgresql.org/download/
3. Placer la librarire dans le dossier d'installation de GraphDB Desktop > app > lib
4. Démarrer Graph DB
5. Créer un répertoire
    - Type : SPARQL Ontop Virtuel
        - Nom: tu mets ce que tu veux,
        - Pilote : PostgreSQL JDBC Driver (https://jdbc.postgresql.org/download/)
        - Hôte: localhost
        - Port:5434
        - base:soduco
        - utilisateur:postgres
        - mot de passe: GHDB_987_admin
    - Ajouter le fichier en pièce jointe dans la case "fichier R2RML"

! Les outils de l'onglet "Explorer" ne fonctionnent pas avec Ontop

Pour récupérer la liste des graphes nommés, il faut faire:
```
PREFIX sd: <http://www.w3.org/ns/sparql-service-description#>
PREFIX dcat: <http://www.w3.org/ns/dcat#>
PREFIX dcterms: <http://purl.org/dc/terms/>
SELECT ?title ?ng
WHERE {
    ?s a dcat:Dataset.
    ?s dcterms:title ?title.
    ?s sd:namedGraph ?ng.
}
```

Une fois que tu as l'URI du graphe nommé, tu peux l'ajouter dans ta requête, dans la partie FROM pour ne sélectionner que les données de ce graphe nommé:
```
SELECT *
FROM <http://rdf.geohistoricaldata.org/id/directories/ebenistes>
WHERE {?s ?p ?o} LIMIT 1000
```
Là tu n'auras normalement que des données sur les ébénistes.

Dis moi si tu as des difficultés avec ça... Je mets à jour l'ontologie ce matin et cet après-midi j'attaque les tests avec Silk et GraphDB.