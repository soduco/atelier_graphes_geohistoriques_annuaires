# Connexion à la base de donnée SoDUCo avec PgAdmin 4 v7

Cette étape permet de se connecter à distance à la base de données SODUCO dans laquelle se trouvent les entrées d’annuaires.

## Réseau invité

1. Lancer pgAdmin 4 v7
2. Créer un nouveau serveur : Clic droit sur Serveur > Nouveau > Serveur...
    * Dans l’onglet Général > Donner un nom au serveur
    * Dans l’onglet Connexion :
        - *Nom d'hôte* : geohistoricaldata.org
        - *Port* : 5432
        - *Nom d'utilisateur* : ?????????
        - *Mot de passe* : ?????????
    * Dans l'onglet Avancé :
        - *Limité aux bases de données* :  soduco

## Réseau IGN (avec le proxy)

### I. Créer un tunnel

1. Ouvrir un terminal
    - Sous Windows : ouvrir PowerShell. 

2. Ecrire la commande 
```
ssh -L 5434:127.0.0.1:5432 -N -f ghdvmadmin@134.158.33.227
```
- où 5434 est le port local sur lequel sera connectée la base de données distante ( = choisir un port libre du PC)

3. Entrer le mot de passe du tunnel

4. Laisser le terminal ouvert aussi longtemps que vous souhaitez travailler avec la base de données.

### II. Paramétrer PgAdmin

1. Lancer pgAdmin 4 v7
2. Créer un nouveau serveur : Clic droit sur Serveur > Nouveau > Serveur...
* Dans l’onglet Général > Donner un nom au serveur
* Dans l’onglet Connexion :
    - Nom d'hôte : localhost
    - Port : 5434,
    - Nom d'utilisateur : ?????????
    - Mot de passe : ?????????
* Dans l'onglet Avancé :
    - *Limité aux bases de données* :  soduco
