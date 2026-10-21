/*  SenkO — Titre chrome années 80 automatique pour After Effects (sans plugin)
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
    var comp = app.project.activeItem;
    if (!(comp && comp instanceof CompItem)) { alert("Ouvre d'abord une composition."); return; }
    if (comp.selectedLayers.length !== 1 || !(comp.selectedLayers[0] instanceof TextLayer)) {
        alert("Sélectionne un seul calque texte.");
        return;
    }
    var src = comp.selectedLayers[0];

    // Cherche la n-ième propriété d'un type donné dans un effet (indépendant de la langue)
    function nth(effect, type, n) {
        var k = 0;
        for (var i = 1; i <= effect.numProperties; i++) {
            var p = effect.property(i);
            if (p.propertyValueType === type) { k++; if (k === n) { return p; } }
        }
        return null;
    }
    function addFx(layer, match) {
        var parade = layer.property("ADBE Effect Parade");
        if (!parade.canAddProperty(match)) { return null; }
        return parade.addProperty(match);
    }
    var RECT = 'var r = thisLayer.sourceRectAtTime(time, false);\n';

    app.beginUndoGroup("SenkO Chrome 80s");
    try {
        var t0 = comp.time;
        var baseName = src.name;
        src.name = "CHROME ciel";

        // --- Calque de contrôle ---
        var ctrl = comp.layers.addNull();
        ctrl.name = "SENKO CHROME";
        ctrl.inPoint = src.inPoint;
        ctrl.outPoint = src.outPoint;
        ctrl.moveBefore(src);
        var cfx = ctrl.property("ADBE Effect Parade");
        var reflet = cfx.addProperty("ADBE Slider Control");
        reflet.name = "Reflet (%)";
        var halo = cfx.addProperty("ADBE Slider Control");
        halo.name = "Halo neon";
        halo.property(1).setValue(80);
        var rv = reflet.property(1);
        rv.setValueAtTime(t0 + 0.6, 0);
        rv.setValueAtTime(t0 + 1.6, 100);

        // --- Duplicats : sol (dessus) et halo (dessous) ---
        var sol = src.duplicate();
        sol.name = "CHROME sol";
        var neon = src.duplicate();
        neon.name = "CHROME halo";
        neon.moveAfter(src);
        var link = 'thisComp.layer("CHROME ciel").text.sourceText';
        sol.property("ADBE Text Properties").property("ADBE Text Document").expression = link;
        neon.property("ADBE Text Properties").property("ADBE Text Document").expression = link;

        // --- Dégradés ---
        function ramp(layer, c1, c2, startExpr, endExpr) {
            var fx = addFx(layer, "ADBE Ramp");
            if (!fx) { throw new Error("Effet Dégradé introuvable."); }
            nth(fx, PropertyValueType.TwoD_SPATIAL, 1).expression = RECT + startExpr;
            nth(fx, PropertyValueType.COLOR, 1).setValue(c1);
            nth(fx, PropertyValueType.TwoD_SPATIAL, 2).expression = RECT + endExpr;
            nth(fx, PropertyValueType.COLOR, 2).setValue(c2);
        }
        var mid = 'r.top + r.height * 0.52';
        ramp(src, [1, 1, 1], [0.11, 0.25, 0.68],
            '[r.left + r.width / 2, r.top];', '[r.left + r.width / 2, ' + mid + '];');
        ramp(sol, [0.16, 0.07, 0.02], [1, 0.72, 0.38],
            '[r.left + r.width / 2, ' + mid + '];', '[r.left + r.width / 2, r.top + r.height];');

        // --- Masque du sol : moitié basse, suit la taille du texte ---
        var m = sol.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
        var sh = new Shape();
        sh.vertices = [[0, 0], [100, 0], [100, 100], [0, 100]];
        sh.closed = true;
        m.property("ADBE Mask Shape").setValue(sh);
        m.property("ADBE Mask Shape").expression = RECT +
            'var y = ' + mid + ', L = r.left - 1000, R = r.left + r.width + 1000, B = r.top + r.height + 1000;\n' +
            'createPath([[L, y], [R, y], [R, B], [L, B]], [], [], true);';

        // --- Relief + reflet sur ciel et sol ---
        var layers = [src, sol];
        for (var i = 0; i < layers.length; i++) {
            var bev = addFx(layers[i], "ADBE Bevel Alpha");
            if (bev) {
                bev.property(1).setValue(3);          // épaisseur du bord
                bev.property(4).setValue(0.75);       // intensité de la lumière
            }
            var sw = addFx(layers[i], "CC Light Sweep");
            if (sw) {
                nth(sw, PropertyValueType.TwoD_SPATIAL, 1).expression = RECT +
                    'var p = thisComp.layer("SENKO CHROME").effect("Reflet (%)")(1) / 100;\n' +
                    '[linear(p, 0, 1, r.left - 300, r.left + r.width + 300), r.top + r.height / 2];';
            }
        }

        // --- Halo néon rose ---
        var fill = addFx(neon, "ADBE Fill");
        if (fill) { nth(fill, PropertyValueType.COLOR, 1).setValue([1, 0.24, 0.65]); }
        var blur = addFx(neon, "ADBE Gaussian Blur 2");
        if (blur) { blur.property(1).setValue(40); }
        neon.property("ADBE Transform Group").property("ADBE Opacity").expression =
            'thisComp.layer("SENKO CHROME").effect("Halo neon")(1);';

        // --- Parentage + entrée en zoom ---
        var pos = src.property("ADBE Transform Group").property("ADBE Position").value;
        ctrl.property("ADBE Transform Group").property("ADBE Position").setValue(pos);
        src.parent = ctrl; sol.parent = ctrl; neon.parent = ctrl;
        var sc = ctrl.property("ADBE Transform Group").property("ADBE Scale");
        sc.setValueAtTime(t0, [130, 130, 100]);
        sc.setValueAtTime(t0 + 0.6, [100, 100, 100]);
        var ease = new KeyframeEase(0, 75);
        sc.setTemporalEaseAtKey(1, [ease, ease, ease], [ease, ease, ease]);
        sc.setTemporalEaseAtKey(2, [ease, ease, ease], [ease, ease, ease]);

        ctrl.selected = true;
    } catch (e) {
        alert("SenkO Chrome 80s : " + e.toString());
    }
    app.endUndoGroup();
})();
