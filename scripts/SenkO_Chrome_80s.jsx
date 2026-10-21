/*  SenkO — Titre chrome années 80 (v3) automatique pour After Effects (sans plugin)
    @senkomp4

    Utilisation :
      1. Crée ton titre (outil Texte, police bien grasse) et sélectionne ce calque texte.
      2. Fichier > Scripts > Exécuter le fichier de script... > choisis ce fichier.
      3. Le titre devient chrome (ciel / horizon / sol), avec relief, halo néon rose,
         entrée en zoom et reflet qui passe, à partir de l'instant courant.
      Réglages sur le calque "SENKO CHROME" (onglet Effets) :
         - Reflet (%)  : position du reflet (animé de 0 à 100)
         - Halo neon   : opacité du halo rose (0 à 100)
      Pour changer le texte : modifie le calque "CHROME ciel", les autres suivent.
      Annuler : Ctrl + Z annule tout le script d'un coup.
*/
(function () {
    var VERSION = "v3";
    var comp = app.project.activeItem;
    if (!(comp && comp instanceof CompItem)) { alert("Ouvre d'abord une composition."); return; }
    if (comp.selectedLayers.length !== 1 || !(comp.selectedLayers[0] instanceof TextLayer)) {
        alert("Sélectionne un seul calque texte.");
        return;
    }
    var srcIndex = comp.selectedLayers[0].index;

    // After Effects invalide facilement les références (ajout d'effet, déplacement...).
    // On ne garde donc que des noms / index et on relit tout à chaque fois.
    function L(name) { return comp.layer(name); }
    function parade(layer) { return layer.property("ADBE Effect Parade"); }
    function addFx(layerName, match, fxName) {
        var p = parade(L(layerName));
        if (!p.canAddProperty(match)) { return false; }
        p.addProperty(match);
        var p2 = parade(L(layerName));
        p2.property(p2.numProperties).name = fxName;
        return true;
    }
    function fx(layerName, fxName) { return parade(L(layerName)).property(fxName); }
    // n-ième propriété d'un type donné dans un effet (indépendant de la langue)
    function nth(layerName, fxName, type, n) {
        var e = fx(layerName, fxName), k = 0;
        for (var i = 1; i <= e.numProperties; i++) {
            if (e.property(i).propertyValueType === type) { k++; if (k === n) { return fx(layerName, fxName).property(i); } }
        }
        return null;
    }
    var RECT = 'var r = thisLayer.sourceRectAtTime(time, false);\n';
    var CTRL = "SENKO CHROME", CIEL = "CHROME ciel", SOL = "CHROME sol", HALO = "CHROME halo";
    var step = "début";

    app.beginUndoGroup("SenkO Chrome 80s");
    try {
        for (var c = 1; c <= comp.numLayers; c++) {
            if (c === srcIndex) { continue; }
            var nm = comp.layer(c).name;
            if (nm === CTRL || nm === CIEL || nm === SOL || nm === HALO) {
                throw new Error("Il reste des calques d'un essai précédent (SENKO CHROME / CHROME ...). Supprime-les ou renomme-les, puis relance.");
            }
        }
        var t0 = comp.time;

        step = "calque de contrôle";
        comp.layer(srcIndex).name = CIEL;
        var nul = comp.layers.addNull();
        nul.name = CTRL;
        L(CTRL).inPoint = L(CIEL).inPoint;
        L(CTRL).outPoint = L(CIEL).outPoint;
        L(CTRL).moveBefore(L(CIEL));

        step = "curseurs";
        addFx(CTRL, "ADBE Slider Control", "Reflet (%)");
        fx(CTRL, "Reflet (%)").property(1).setValueAtTime(t0 + 0.6, 0);
        fx(CTRL, "Reflet (%)").property(1).setValueAtTime(t0 + 1.6, 100);
        addFx(CTRL, "ADBE Slider Control", "Halo neon");
        fx(CTRL, "Halo neon").property(1).setValue(80);

        step = "duplication";
        L(CIEL).duplicate().name = SOL;
        L(CIEL).duplicate().name = HALO;
        L(HALO).moveAfter(L(CIEL));
        var link = 'thisComp.layer("' + CIEL + '").text.sourceText';
        L(SOL).property("ADBE Text Properties").property("ADBE Text Document").expression = link;
        L(HALO).property("ADBE Text Properties").property("ADBE Text Document").expression = link;

        step = "dégradés";
        function ramp(layerName, c1, c2, startExpr, endExpr) {
            if (!addFx(layerName, "ADBE Ramp", "SenkO degrade")) { throw new Error("Effet Dégradé introuvable."); }
            nth(layerName, "SenkO degrade", PropertyValueType.TwoD_SPATIAL, 1).expression = RECT + startExpr;
            nth(layerName, "SenkO degrade", PropertyValueType.COLOR, 1).setValue(c1);
            nth(layerName, "SenkO degrade", PropertyValueType.TwoD_SPATIAL, 2).expression = RECT + endExpr;
            nth(layerName, "SenkO degrade", PropertyValueType.COLOR, 2).setValue(c2);
        }
        var mid = 'r.top + r.height * 0.52';
        ramp(CIEL, [1, 1, 1], [0.11, 0.25, 0.68],
            '[r.left + r.width / 2, r.top];', '[r.left + r.width / 2, ' + mid + '];');
        ramp(SOL, [0.16, 0.07, 0.02], [1, 0.72, 0.38],
            '[r.left + r.width / 2, ' + mid + '];', '[r.left + r.width / 2, r.top + r.height];');

        step = "masque du sol";
        L(SOL).property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
        var sh = new Shape();
        sh.vertices = [[0, 0], [100, 0], [100, 100], [0, 100]];
        sh.closed = true;
        L(SOL).property("ADBE Mask Parade").property(1).property("ADBE Mask Shape").setValue(sh);
        L(SOL).property("ADBE Mask Parade").property(1).property("ADBE Mask Shape").expression = RECT +
            'var y = ' + mid + ', L = r.left - 1000, R = r.left + r.width + 1000, B = r.top + r.height + 1000;\n' +
            'createPath([[L, y], [R, y], [R, B], [L, B]], [], [], true);';

        step = "relief et reflet";
        var halves = [CIEL, SOL];
        for (var i = 0; i < halves.length; i++) {
            if (addFx(halves[i], "ADBE Bevel Alpha", "SenkO relief")) {
                fx(halves[i], "SenkO relief").property(1).setValue(3);     // épaisseur du bord
                fx(halves[i], "SenkO relief").property(4).setValue(0.75);  // intensité de la lumière
            }
            if (addFx(halves[i], "CC Light Sweep", "SenkO reflet")) {
                nth(halves[i], "SenkO reflet", PropertyValueType.TwoD_SPATIAL, 1).expression = RECT +
                    'var p = thisComp.layer("' + CTRL + '").effect("Reflet (%)")(1) / 100;\n' +
                    '[linear(p, 0, 1, r.left - 300, r.left + r.width + 300), r.top + r.height / 2];';
            }
        }

        step = "halo néon";
        if (addFx(HALO, "ADBE Fill", "SenkO couleur")) {
            nth(HALO, "SenkO couleur", PropertyValueType.COLOR, 1).setValue([1, 0.24, 0.65]);
        }
        if (addFx(HALO, "ADBE Gaussian Blur 2", "SenkO flou")) {
            fx(HALO, "SenkO flou").property(1).setValue(40);
        }
        L(HALO).property("ADBE Transform Group").property("ADBE Opacity").expression =
            'thisComp.layer("' + CTRL + '").effect("Halo neon")(1);';

        step = "parentage";
        var pos = L(CIEL).property("ADBE Transform Group").property("ADBE Position").value;
        L(CTRL).property("ADBE Transform Group").property("ADBE Position").setValue(pos);
        L(CIEL).parent = L(CTRL);
        L(SOL).parent = L(CTRL);
        L(HALO).parent = L(CTRL);

        step = "entrée en zoom";
        var sc = L(CTRL).property("ADBE Transform Group").property("ADBE Scale");
        sc.setValueAtTime(t0, [130, 130, 100]);
        sc.setValueAtTime(t0 + 0.6, [100, 100, 100]);
        var ease = new KeyframeEase(0, 75);
        for (var k = 1; k <= 2; k++) {
            try { sc.setTemporalEaseAtKey(k, [ease, ease, ease], [ease, ease, ease]); }
            catch (e1) {
                try { sc.setTemporalEaseAtKey(k, [ease, ease], [ease, ease]); } catch (e2) {}
            }
        }
        L(CTRL).selected = true;
    } catch (e) {
        alert("SenkO Chrome 80s " + VERSION + "\nÉtape : " + step + "\nErreur : " + e.toString() + (e.line ? "\nLigne : " + e.line : ""));
    }
    app.endUndoGroup();
})();
