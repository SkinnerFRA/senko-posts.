# Agent posts SenkO — procédure hebdomadaire

Tu prépares la semaine de posts du compte **SenkO | Outils créa & IA** (@senkomp4).
Niche : astuces After Effects & Premiere Pro, outils IA, sites utiles pour créatifs. Ton : tutoiement, direct, concret, français.

## Repères fixes
- Dépôt GitHub : `SkinnerFRA/senko-posts.` (avec le point final), branche `main`, cloné dans `/home/claude/senko-posts.`
- Contenu du dépôt : template.html, render.py, topics.json, journal.md, ready/, reels/
- Metricool : brandId `7566777`, fuseau `Europe/Paris`
- Réseaux : instagram, facebook, tiktok
- Créneaux : **mardi 10:00** et **jeudi 10:00** de la semaine en cours
- Hébergement temporaire des images : dossier `tmp/` du dépôt, URL publique
  `https://raw.githubusercontent.com/SkinnerFRA/senko-posts./main/tmp/<fichier>.jpg`

## Règles d'économie (obligatoires)
- Pas de recherche web, pas de lecture de fichiers hors du dépôt, pas de capture d'écran pleine taille.
- Vérification visuelle : uniquement `apercu.jpg` (planche réduite), une seule fois par post.
- Un seul rendu par post ; ne refais le rendu que si l'aperçu montre un texte qui déborde.
- Pas de narration entre les étapes. Un seul message de fin.

## Étapes
1. **Préparer** : rattache le dépôt (outil add_repo, owner `SkinnerFRA`, repo `senko-posts.`, access `push`), clone-le avec `git clone --depth 1 https://github.com/SkinnerFRA/senko-posts. /home/claude/senko-posts.`, puis travaille dedans.
2. **Choisir** les 2 premiers sujets `"statut": "a_faire"` de topics.json. S'il en reste moins de 2 : traite ce qu'il y a et signale-le (« liste de sujets à remplir »). S'il n'y en a aucun : ne publie rien, préviens simplement.
3. **Écrire** chaque post en JSON (sauf si `pret` pointe vers un fichier : utilise-le tel quel). Format :
   ```json
   {"id":"...","slides":[
     {"type":"cover","tag":"AFTER EFFECTS","title":"5 raccourcis\nqui changent\n*tout.*","sub":"accroche courte"},
     {"type":"point","num":"01","title":"Titre _mot clé_","body":"1-2 phrases max","chip":"Ctrl + Maj + D"},
     {"type":"list","title":"Titre","items":[{"t":"Élément","s":"détail court"}]},
     {"type":"cta","title":"Enregistre\n_ce post._","button":"Abonne-toi","question":"Question pour les commentaires"}],
    "caption":"légende + 5 à 7 hashtags","tiktok_title":"titre court + emoji"}
   ```
   - 5 à 8 slides : 1 `cover`, contenu (`point` ou `list`, max 4 items par `list`), 1 `cta` en dernier.
   - `*mot*` = surlignage jaune, `_mot_` = violet, `\n` = retour à la ligne. Titres de couverture : max ~11 caractères par ligne.
   - **Exactitude** : raccourcis pour Windows, en français (Maj, Origine…). N'écris que ce dont tu es sûr ; dans le doute, reformule sans le détail incertain.
4. **Rendre** : `python3 render.py post.json /tmp/rendu/<id>` → JPG + apercu.jpg (hors du dépôt). Regarde l'aperçu.
5. **Héberger** : copie les JPG des 2 posts dans `tmp/` du dépôt, commit, `git push origin main`.
6. **Programmer dans Metricool**, pour chaque post : providers instagram+facebook+tiktok, `media` = les URL raw de ses JPG dans l'ordre, `text` = caption, `autoPublish: false` (Alexis valide via la notification Metricool), `draft: false`, `instagramData.type: "POST"`, `facebookData.type: "POST"`, `tiktokData.title` = tiktok_title, `tiktokData.autoAddMusic: true`, date = mardi ou jeudi 10:00. Vérifie dans la réponse que `media` pointe vers `static.metricool.com` (= images copiées).
7. **Nettoyer** : supprime `tmp/` du dépôt (git rm), commit, push. Metricool a déjà ses copies.
8. **Script de Reel** (1 par semaine) : sur le sujet du jeudi ou une variante. Écris `reels/AAAA-MM-JJ.md` (date du lundi) : accroche (3 s), script parlé 30-45 s, plans à tourner, textes à l'écran, légende. Court et concret.
9. **Mettre à jour** topics.json (sujets passés en `"statut":"fait"`) et journal.md (une ligne par post : date, id, réseaux, lien Metricool). Commit + push (un seul commit pour 8 et 9 suffit).
10. **Message de fin** (court) : les 2 posts programmés (titre + jour), le fichier du script de Reel, les alertes éventuelles.

## En cas de problème
- Push refusé : signale-le (l'app GitHub de Claude n'a peut-être plus accès au dépôt), ne crée rien dans Metricool.
- Metricool refuse les URL : vérifie que le push a bien eu lieu, réessaie une fois ; sinon signale.
- Ne publie jamais ailleurs que via Metricool. Ne touche qu'à ce dépôt.
