# Agent posts SenkO — procédure hebdomadaire (1 post par jour)

Tu prépares, chaque dimanche soir, les 7 posts de la semaine suivante (lundi → dimanche) du compte **SenkO | Outils créa & IA** (@senkomp4).
Niche : effets tendance After Effects & Premiere Pro (tutos pas à pas en slides, pas de script), plus outils IA et sites utiles. Ton : tutoiement, direct, concret, français.

## Repères fixes
- Dépôt GitHub : `SkinnerFRA/senko-posts.` (avec le point final), branche `main`, cloné dans `/home/claude/senko-posts.`
- Contenu du dépôt : template.html, render.py, topics.json, journal.md, ready/, reels/
- Metricool : brandId `7566777`, fuseau `Europe/Paris`
- Réseaux : instagram, facebook, tiktok
- Créneaux : **tous les jours à 18:00** (heure de Paris), du lundi au dimanche de la semaine suivante — 7 posts
- Hébergement temporaire des images : dossier `tmp/` du dépôt, URL publique
  `https://raw.githubusercontent.com/SkinnerFRA/senko-posts./main/tmp/<fichier>.jpg`

## Règles d'économie (obligatoires)
- Pas de recherche web, pas de lecture de fichiers hors du dépôt, pas de capture d'écran pleine taille.
- Vérification visuelle : uniquement `apercu.jpg` (planche réduite), une seule fois par post (vérifie qu'aucun texte ne déborde des maquettes).
- Un seul rendu par post ; ne refais le rendu que si l'aperçu montre un texte qui déborde.
- Pas de narration entre les étapes. Un seul message de fin.

## Étapes
1. **Préparer** : rattache le dépôt (outil add_repo, owner `SkinnerFRA`, repo `senko-posts.`, access `push`), clone-le avec `git clone --depth 1 https://github.com/SkinnerFRA/senko-posts. /home/claude/senko-posts.`, puis travaille dedans.
2. **Choisir** (après avoir lu `idees.md` : styles aimés, idées refusées) les 7 premiers sujets `"statut": "a_faire"` de topics.json. S'il en manque, invente toi-même les sujets manquants (sans recherche web) dans les styles aimés d'`idees.md`, jamais parmi les idées refusées ni en doublon d'un sujet `fait`, ajoute-les à topics.json et signale-le. Varie : au moins 1 post Premiere Pro par semaine, pas 2 sujets presque identiques d'affilée.
3. **Écrire** chaque post en JSON (sauf si `pret` pointe vers un fichier : utilise-le tel quel). Format :
   ```json
   {"id":"...","slides":[
     {"type":"cover","tag":"AFTER EFFECTS","title":"5 raccourcis\nqui changent\n*tout.*","sub":"accroche courte"},
     {"type":"point","num":"01","title":"Titre _mot clé_","body":"1-2 phrases max","chip":"Ctrl + Maj + D"},
     {"type":"list","title":"Titre","items":[{"t":"Élément","s":"détail court"}]},
     {"type":"cta","title":"Enregistre\n_ce post._","button":"Abonne-toi","question":"Question pour les commentaires"}],
    "caption":"légende + 5 à 7 hashtags","tiktok_title":"titre court + emoji"}
   ```
   - 6 à 10 slides : 1 `cover`, contenu, 1 `cta` en dernier. **Ne recycle pas la même mise en page** : pour un tuto, chaque étape est un slide `tuto` qui MONTRE l'action dans une capture.
   - Types de slides visuels (même DA) :
     - `{"type":"tuto","title":"...","visual":{...},"body":"1 phrase","chip":"raccourci"}` → barre « ÉTAPE x/n » automatique.
     - `{"type":"visual","title":"...","visual":{...},"body":"..."}` (ex. avant/après).
     - `cover` et `cta` acceptent aussi un `visual`.
   - `visual` possibles :
     - **Vraie capture** (prioritaire) : `{"img":"captures/<id>/01.png","marks":[{"x":10,"y":20,"w":30,"h":8,"label":"Ici"}]}` (cadres jaunes en % de l'image). Si Alexis a déposé des captures dans `captures/<id>/`, utilise-les.
     - Sinon, maquettes d'interface : `timeline` (rows: name, color, mode, hl, hlmode, note), `effects` (effect, params: k, v, hl, note), `menu` (menus: head, items, sel), `dropdown` (items, sel, note), `keys` (prop, keys %, beats %), `demo` (text, offset, glitch, ou `style` : chrome, inflate, neon (+ off = index de la lettre éteinte), zoom, speed, blur (+ f = avancement 0-1)), `beforeafter` (mêmes champs), `sliders` (items: k, v, p %), `gradient` (stops: c, p, hl).
   - Exemple complet : `ready/ae-rgb-split.json`.
   - `*mot*` = surlignage jaune, `_mot_` = violet, `\n` = retour à la ligne. Titres de couverture : max ~11 caractères par ligne.
   - **Posts « effet »** : cover accrocheuse avec le rendu final, avant/après, 4-6 slides `tuto` qui montrent chaque étape, CTA final « Enregistre ce tuto » + « Abonne-toi » + question. **Pas de script ni de fichier à télécharger.**
   - **Exactitude** : raccourcis pour Windows, en français (Maj, Origine…). N'écris que ce dont tu es sûr ; dans le doute, reformule sans le détail incertain.
4. **Rendre** : `python3 render.py post.json /tmp/rendu/<id>` → JPG + apercu.jpg (hors du dépôt). Regarde l'aperçu.
5. **Héberger** : copie les JPG des 7 posts dans `tmp/` du dépôt, commit, `git push origin main`.
6. **Programmer dans Metricool**, pour chaque post : providers instagram+facebook+tiktok, `media` = les URL raw de ses JPG dans l'ordre, `text` = caption, `autoPublish: true` (publication automatique : Alexis ne veut plus de validation), `draft: false`, `instagramData.type: "POST"`, `facebookData.type: "POST"`, `tiktokData.title` = tiktok_title, `tiktokData.autoAddMusic: true`, date = le jour concerné à 18:00 (`publicationDate.timezone` = Europe/Paris ; attention au changement d'heure pour le décalage du champ `date`). **Avant de créer**, vérifie avec getScheduledPosts toute la semaine : si un jour a déjà un post programmé (même à une autre heure), ne programme rien ce jour-là et garde le sujet en `a_faire`. Vérifie dans la réponse que `media` pointe vers `static.metricool.com` (= images copiées).
7. **Nettoyer** : supprime `tmp/` du dépôt (git rm), commit, push. Metricool a déjà ses copies.
8. **Script de Reel** (1 par semaine) : sur le sujet le plus visuel de la semaine. Écris `reels/AAAA-MM-JJ.md` (date du lundi) : accroche visuelle choc (3 s, montrer le résultat d'abord), script parlé 30-45 s rythmé et complice, moment « wow » du résultat final, plans à tourner, textes à l'écran avec emojis, légende avec question pour les commentaires. Aguicheur, court et concret.
9. **Mettre à jour** topics.json (sujets passés en `"statut":"fait"`) et journal.md (une ligne par post : date, id, réseaux, lien Metricool). Commit + push (un seul commit pour 8 et 9 suffit).
10. **Message de fin** (court) : les posts programmés (titre + jour), les jours sautés, le fichier du script de Reel, les alertes éventuelles.

## En cas de problème
- Push refusé : signale-le (l'app GitHub de Claude n'a peut-être plus accès au dépôt), ne crée rien dans Metricool.
- Metricool refuse les URL : vérifie que le push a bien eu lieu, réessaie une fois ; sinon signale.
- Ne publie jamais ailleurs que via Metricool. Ne touche qu'à ce dépôt.
