---
layout: post
title: "Pourquoi j'ai arrêté de tout mettre dans des Services (et ce qui les a remplacés)"
date: 2026-06-17 10:00:00 +0000
author: Joseph HOMAWOO
image: assets/images/blog/post-1.webp
tags: [Backend, Laravel, Symfony, Architecture]
description: "Découvrez pourquoi le passage de gros Services monolithiques aux patrons Actions et DTOs rend votre base de code plus lisible, testable et réutilisable."
---

Il y a un moment, dans la vie de presque tous les projets Laravel sur lesquels j'ai travaillé, où quelqu'un ouvre un fichier `SchoolService.php` et reste figé devant 600 lignes de code qui n'ont, à première vue, plus aucun rapport entre elles. 
C'est ce moment précis qui m'a poussé à changer d'approche.

Les exemples ci-dessous sont en Laravel, mais le raisonnement ne tient pas qu'à PHP. Que tu sois sur Node, Go ou Python, le vrai sujet, c'est le passage d'un code organisé autour du framework à un code organisé autour du métier.

## D'abord, on s'accorde sur le vocabulaire

Trois rôles vont revenir tout le long de l'article :

- Le **contrôleur** (ou handler HTTP) reçoit la requête. Il ne devrait jamais décider de quoi que ce soit côté métier.
- Le **modèle** représente une ligne en base.
- L'**Action** fait une seule chose, précisément : exécuter une intention métier.
- Le **DTO** transporte des données typées entre les couches, un peu comme un contrat.

Rien d'exotique là-dedans.

## Le problème, ce n'est pas le Service. C'est ce qu'il devient

Le conseil classique qu'on donne à un dev junior, c'est "mets ta logique dans un Service plutôt que dans le contrôleur". 
Et c'est un bon conseil, sur le moment. Le souci, c'est que personne ne dit à quel moment arrêter d'y ajouter des méthodes.

Six mois plus tard, `SchoolService` gère la création d'écoles, leur archivage, l'envoi de rapports, et au passage une fonction de recherche qu'un collègue a ajoutée parce que "ça allait là, techniquement". 
Toucher une méthode devient stressant, parce qu'on ne sait jamais ce qu'on risque de casser ailleurs dans la classe.

Et il y a un deuxième problème, plus discret : le contrôleur, lui, finit souvent par devenir le vrai chef d'orchestre. 
Il appelle deux ou trois services, gère les logs, déclenche une notification. Le jour où tu veux relancer cette même opération depuis une commande Artisan ou un job planifié, tu dupliques toute cette tuyauterie. Ou pire, tu la copies-colles en croisant les doigts.

## L'Action : une intention métier, une classe, Unité de Travail Atomique, point final

L'idée derrière le pattern **Action**, c'est de remettre chaque opération métier dans sa propre classe, qui porte le nom de ce qu'elle fait. `CreateSchoolAction`. `RegisterStudentAction`. Pas d'ambiguïté.

Ce que j'apprécie le plus avec cette approche, ce n'est pas tant la propreté du code (même si, oui, ça aide) : c'est qu'ouvrir le dossier `Actions/` revient à lire la table des matières de ton application. Tu sais ce que le logiciel sait faire sans avoir à fouiller dans des contrôleurs de 300 lignes.

Côté tests aussi, ça change la donne. Plus besoin de simuler une requête HTTP entière pour vérifier qu'une règle métier fonctionne. Avec Pest, par exemple, ça donne ça :

```php
it('creates a school with valid data', function () {
    $dto = new SchoolData(name: 'Dev Academy', email: 'contact@dev.academy');
    $action = app(CreateSchoolAction::class);

    $school = $action->execute($dto);

    expect($school->name)->toBe('Dev Academy');
    $this->assertDatabaseHas('schools', ['name' => 'Dev Academy']);
});
```

Ce test s'exécute en quelques millisecondes, sans toucher au routeur ni au middleware. 
Et la même Action, qu'on l'appelle depuis le web, une commande CLI ou un job en file d'attente, se comporte exactement pareil.

## À quoi ça ressemble en vrai

Voici le genre de contrôleur qu'on a tous écrit à un moment :

```php
// Exemple simplifié (conceptuel)
public function store(Request $request) {
    // Validation
    $data = $request->validate([...]);
    
    // Métier mélangé à l'infrastructure
    $school = $request->user()->schools()->create($data);
    
    // Effets de bord manuels
    Notification::send($school->owner, new Welcome());
    Log::info("School created");

    return response()->json($school, 201);
}
```

Validation, métier et réponse HTTP sont tous emmêlés dans la même méthode. 
Le jour où tu veux réutiliser cette logique ailleurs, tu n'as pas vraiment le choix : tu recopies.

Une fois qu'on extrait l'Action et qu'on passe par un DTO, le contrôleur redevient ce qu'il devrait être : un simple passage de relais.

```php
public function store(SchoolRequest $request, CreateSchoolAction $action) {
    // Le DTO garantit que les données sont valides et typées avant d'entrer dans le métier
    $data = SchoolData::fromRequest($request);

    // L'Action est le point de vérité unique pour cette tâche
    $school = $action->execute($data);

    return response()->json($school, 201);
}
```

Et l'Action elle-même prend ce DTO en entrée, sans jamais avoir à se soucier d'où viennent les données :

```php
class CreateSchoolAction {
    public function __construct(
        protected NotificationService $notifier
    ) {}

    public function execute(SchoolData $data): School {
        return DB::transaction(function () use ($data) {
            $school = School::create([
                'name' => $data->name,
                'email' => $data->email,
            ]);

            // Déclenchement automatique des effets de bord associés
            $this->notifier->sendWelcomeEmail($school);

            return $school;
        });
    }
}
```

## Le DTO, ou pourquoi j'ai arrêté de me fier aux tableaux associatifs

Passer un tableau associatif d'une fonction à une autre, c'est pratique sur le moment et un cauchemar trois mois après. 
On ne sait jamais si la clé `email` existe vraiment, ni quel type elle a. On finit par mettre des `isset()` partout par réflexe défensif.

Le DTO règle ça en posant un contrat clair à l'entrée de l'Action. 
Et l'avantage ne se voit pas qu'à l'écriture : si tu changes la structure de ton DTO, un outil comme PHPStan (ou Larastan) va te signaler immédiatement chaque endroit du code qui n'est plus cohérent avec ce changement. Tu arrêtes de découvrir le problème en production.

## Ce que ça coûte

Aucune architecture n'est gratuite. Celle-ci en particulier demande plus de fichiers, et donc un peu plus de discipline de nommage pour ne pas s'y perdre. 
Pour une opération vraiment triviale (un simple toggle d'un booléen, par exemple), créer une Action dédiée peut sembler exagéré. 
C'est un jugement à faire au cas par cas, pas une règle absolue.

Il y a aussi un piège classique quand le projet grossit : se retrouver avec mille fichiers d'Actions dans un seul dossier plat. 
À ce stade, la "découvrabilité" qui faisait tout l'intérêt du pattern se retourne contre toi.

La solution, dans ce cas, c'est de grouper par domaine métier plutôt que de tout mettre au même endroit :

```
Actions/School/CreateSchoolAction.php
Actions/Student/RegisterStudentAction.php
Actions/Billing/ProcessInvoiceAction.php
```

Chaque dossier devient son propre sous-système, lisible indépendamment des autres. Et si un domaine grossit trop, c'est souvent le signe qu'il faut le scinder en sous-domaines plus précis  ce qui est, en soi, un signal utile que le pattern Action te donne et qu'un gros Service monolithique aurait simplement caché.

## Et après les Actions ?

Le duo Action/DTO couvre la grande majorité des besoins d'un SaaS classique. 
Mais il y a des situations où il ne suffit plus, et ça vaut la peine de les connaître même si tu ne les rencontres pas tout de suite.

La première, c'est quand tu as besoin d'un historique complet et pas seulement de l'état actuel. 
Un système bancaire ou médical ne peut pas se contenter de savoir que le statut est "actif" : il doit pouvoir reconstituer le pourquoi et le comment. 
C'est là qu'intervient l'**event sourcing** : au lieu de modifier une ligne, on enregistre une suite d'événements immuables (`SchoolCreated`, `AddressUpdated`, `SchoolActivated`), ce qui permet de rejouer l'état du système à n'importe quel instant du passé.

La deuxième situation, c'est quand une opération traverse plusieurs services externes paiement, puis email, puis génération de documents et que l'un d'eux peut échouer après que les précédents ont déjà réussi. 
Une Action classique, synchrone et atomique, ne gère pas bien ce cas. 
C'est le terrain du **Saga pattern** : chaque étape prévoit une transaction de compensation, donc si l'étape 3 échoue, l'étape 1 (le paiement, par exemple) est automatiquement remboursée. 
L'échec devient une partie du design, pas une exception qu'on espère ne jamais voir.

La troisième, enfin, concerne la logique purement algorithmique un moteur de scoring, un calcul de taxes multi-pays qui n'a pas vraiment de lien direct avec une requête utilisateur. Dans ce cas, un **Domain Service** sans aucune dépendance au framework ni à la base de données fait souvent plus de sens : il reçoit des objets métier, calcule, retourne un résultat, et se teste sans même avoir besoin d'une base de données démarrée.

## Pour conclure

Au fond, ce changement d'architecture n'a rien de révolutionnaire. C'est surtout une question d'endroit où on choisit de mettre la complexité, et de la rendre visible plutôt que de la laisser s'accumuler en silence dans un Service qui grossit sans qu'on s'en rende compte. 
Les Actions et les DTOs ne sont pas la solution à tout, mais ils donnent un cadre suffisamment clair pour qu'on sache, six mois plus tard, où chercher quand quelque chose casse.
