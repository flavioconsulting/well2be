# Site Well2Be (Lara · coaching & bien-être)

Site vitrine statique (HTML/CSS/JS), hébergé sur GitHub Pages. Aucune base de données, aucun paiement en ligne.

## Fichiers

| Fichier | Contenu |
|---|---|
| `index.html` | Toute la page d'accueil (textes, tarifs, témoignages) |
| `mentions-legales.html` | Mentions légales (identité, adresse, SIRET, hébergeur) |
| `style.css` | Couleurs, polices, mise en page (variables de couleur en haut du fichier) |
| `script.js` | Carrousel des témoignages et en-tête (rien à modifier en général) |
| `images/` | Toutes les photos |
| `fonts/` | Polices hébergées sur le site (aucun appel à Google) |
| `CNAME` | Nom de domaine du site, une seule ligne |

## Modifier un texte

Ouvrir `index.html` (sur GitHub : le fichier → icône crayon), faire Ctrl+F sur la phrase, la modifier, puis « Commit changes ». Le site se met à jour en 1 à 2 minutes.

Les sections sont repérées par des commentaires : `<!-- Accueil -->`, `<!-- Le coaching -->`, `<!-- Témoignages coaching -->`, `<!-- L'alimentation -->`, `<!-- Bien-être -->`, `<!-- Témoignages deep tissue -->`, `<!-- Témoignages madérothérapie -->`, `<!-- Qui suis-je -->`, `<!-- Parcours sportif -->`, `<!-- Récapitulatif des tarifs -->`, `<!-- Contact -->`.

## Modifier un prix

**Chaque prix apparaît 2 fois** : dans sa section (coaching, alimentation ou bien-être) **et** dans le récapitulatif « Toutes les formules ». Faire Ctrl+F sur l'ancien prix, par ex. `50&nbsp;€`, et changer toutes les occurrences concernées.

| Prestation | Sections où il apparaît |
|---|---|
| Coaching, programmes | « Le coaching » + récapitulatif |
| Programme alimentaire, sportif + alimentaire | « Le coaching » + « L'alimentation » + récapitulatif (3 fois) |
| Deep tissue | « Bien-être » + récapitulatif |
| Madérothérapie | « Bien-être » (tableau) + récapitulatif |

## Changer une photo

Le plus simple : remplacer le fichier dans `images/` **en gardant exactement le même nom** (ex. `lara-portrait.jpg`). Format conseillé : JPG, 1200 px maximum sur le grand côté, moins de 300 Ko.

| Fichier | Emplacement |
|---|---|
| `lara-salle.jpg` | Grande photo de l'accueil |
| `lara-coaching.jpg`, `coaching-1/2/3.jpg` | Section coaching |
| `madero.jpg` | Carte madérothérapie |
| `lara-portrait.jpg` | Qui suis-je |
| `bb-1/2/3.jpg`, `force-1/2/3.jpg`, `autre-1/2.jpg` | Parcours sportif |
| `logo.png`, `logo-small.png`, `favicon.png` | Logo |

Si la nouvelle photo n'a pas les mêmes proportions, mettre à jour `width` et `height` de la balise `<img>` correspondante (évite les sauts de mise en page).

## Ajouter un témoignage

Il y a un bloc d'avis par partie : `<!-- Témoignages coaching -->`, `<!-- Témoignages deep tissue -->`, `<!-- Témoignages madérothérapie -->`. Dans le bon bloc, copier un `<figure class="temoin">…</figure>` et changer le texte, le prénom et la prestation. Le carrousel s'adapte tout seul au nombre d'avis ; avec un seul avis, il s'affiche en simple carte.

Pour créer un bloc d'avis dans une autre partie (ex. alimentation), copier un bloc `<section class="temoignages">…</section>` entier et changer son commentaire, son `aria-label` et la ligne `temoins-sujet`.

## Numéro de téléphone

Il apparaît dans `index.html` (section contact) et `mentions-legales.html`. Changer le lien `tel:+33760219549` **et** le texte affiché `07 60 21 95 49`.

## Sécurité

- Pas de formulaire ni de cookie : rien à déclarer côté RGPD hormis les mentions légales.
- Une politique de sécurité (CSP) est déclarée dans le `<head>` de chaque page : n'ajouter ni script externe ni style écrit directement dans une balise (`style="…"`), ils seraient bloqués.
- Compte GitHub et compte Hostinger : mot de passe unique et double authentification activée.
