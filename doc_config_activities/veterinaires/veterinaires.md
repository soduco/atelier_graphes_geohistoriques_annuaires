# Vétérinaires

## Etat de l'art
### Articles
* Hubscher Ronald. <i>L'invention d'une profession : les vétérinaires au XIXe siècle.</i> In: Revue d’histoire moderne et contemporaine, tome 43 N°4, Octobre-décembre 1996. Médicalisation et professions de santé XVIe-XXe siècles. pp. 686-708. DOI : https://doi.org/10.3406/rhmc.1996.1846. URL : www.persee.fr/doc/rhmc_0048-8003_1996_num_43_4_1846
* Berdah, Delphine. « Entre scientifisation et travail de frontières : les transformations des savoirs vétérinaires en France, XVIIIe-XIXe siècles », Revue d’histoire moderne & contemporaine, vol. 59-4, no. 4, 2012, pp. 51-96. DOI : https://doi-org.univ-eiffel.idm.oclc.org/10.3917/rhmc.594.0051
* Lamure Jean-Christophe, Quand Napoléon Ier s'intéressait aux vétérinaires, Février 2011. 250ème anniversaire de la création des Ecoles Vétérinaires. URL : https://www.veterinaire.fr/system/files/files/2021-12/295_Napoleon_et_les_Veterinaires_-_Dr_J.C._Lamure.pdf

### Données complémentaires
* Liste des étudiants diplômes de l'ENV de Maisons-ALfort (1766-1940). URL : https://www.vet-alfort.fr/annuaire?cm=0&dir=asc&order=i.name&search=bourdon#tlb
* Registres détaillés des élèves inscrits de l'ENV de Maisons-ALfort (1766-1940). Archives Départementales du Val-de-Marne. URL : https://archives.valdemarne.fr/recherches/archives-en-ligne/ecole-veterinaire-de-maisons-alfort-enva?arko_default_63033cc7c654f--ficheFocus=

## Choix des mots-clés
Avant la création des écoles vétérinaires, plusieurs professions pratiquent des soins aux animaux : 
- forgerons
- hongreurs
- barbiers
- accoucheurs
- guérisseurs
- maréchal, maréchal ferrant, maréchal-expert (concurrence importance/proximité initiale forte)
- écuyer, écuyer-hippiatre
<i>Mots clés non-conservés pour le filtrage car trop divers (à l'exception des maréchaux-experts, plus spécialisés dans les soins des chevaux)</i>.

Plusieurs dénominations sucessives/parallèles associées à l'évolution de la profession et aux différents types de formations suivies:
- privilégié à l'art vétérinaire
- artiste-vétérinaire
- maréchal-vétérinaire
- médecin-vétérinaire
- vétérinaire

## Filtrage des entrées

```
    -- Contient
    (act.ner_xml ILIKE '%vétérinaire%' OR
    act.ner_xml ILIKE '%veterinaire%' OR
    act.ner_xml ILIKE '%vetérinaire%' OR
    act.ner_xml ILIKE '%véterinaire%' OR
    act.ner_xml ILIKE '%veteri%' OR
    act.ner_xml ILIKE '%vetéri%' OR
    act.ner_xml ILIKE '%véteri%' OR
    act.ner_xml ILIKE '%vétéri%' OR
    (act.ner_xml ILIKE '%marech%' AND act.ner_xml ILIKE '%expert%')) AND 
    -- Ne contient pas
    (act.ner_xml NOT ILIKE '%paveteri%')
```

## Liage
### Paramétrage dans Silk Workbench
- Label / Activity : 
    - Transformation : RegexReplace(àáéèěîïíóúůščřžý,aaeeeiiiouuscrzy), alphaReduce, LowerCase
    - Distance de Levenshtein label(0.8), activity(0.8) => quasiment que du 100%

### Silk single-machine
- NumEntry : 
    - Même numéro d'extraction
    - Temps de calcul : quelques secondes
    - 100% : 11501 liens.
- Label / Activity (test avec l'ancienne extraction, sans les maréchaux experts): 
    - Transformation : RegexReplace(àáéèěîïíóúůščřžý,aaeeeiiiouuscrzy), alphaReduce, LowerCase
    - Distance de Levenshtein label(0.4), activity(0.8)   (tests très lents avec pc portable 8G0 RAM à label=0.6 et label=0.8)
    - Temps de calcul : ~ 15 minutes (5 to 6 Ga de RAM alloués)
    - Ratio liens calculés/ liens gardés : 
    - 0%-50% : 436 869 liens ; 50%-75% : 55 993 liens; 75%-99% : 22407 liens ; 100% : 42906 liens.

## TODO
- Avec la nouvelle extraction
    - [ ] Prévoir l'ajout des maréchaux-experts
    - [ ] Vérifier les seuils 
    - [ ] Liage