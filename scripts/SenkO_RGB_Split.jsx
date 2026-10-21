/*  SenkO — RGB Split / Glitch automatique pour After Effects
    @senkomp4

    Utilisation :
      1. Ouvre ta composition et sélectionne UN calque (vidéo, image ou précomp).
      2. Fichier > Scripts > Exécuter le fichier de script... > choisis ce fichier.
      3. Règle l'effet sur le calque "SENKO RGB" (onglet Effets) :
         - Decalage RGB      : écart entre rouge et bleu (pixels)
         - Intensite glitch  : 0 = propre, 100 = glitch permanent
         - Tremblement       : secousse de l'image (pixels)
      Astuce : anime ces curseurs avec des images clés sur les temps forts de ta musique.
      Annuler : Ctrl + Z annule tout le script d'un coup.
*/
(function () {
    var comp = app.project.activeItem;
    if (!(comp && comp instanceof CompItem)) { alert("Ouvre d'abord une composition."); return; }
    if (comp.selectedLayers.length !== 1) { alert("Sélectionne un seul calque."); return; }
    var src = comp.selectedLayers[0];
    if (!(src instanceof AVLayer) || src.nullLayer || src.adjustmentLayer) {
        alert("Sélectionne un calque vidéo, image ou précomposition.");
        return;
    }

    app.beginUndoGroup("SenkO RGB Split");
    try {
        // --- Calque de contrôle ---
        var ctrl = comp.layers.addNull();
        ctrl.name = "SENKO RGB " + src.index;
        ctrl.moveBefore(src);
        ctrl.inPoint = src.inPoint;
        ctrl.outPoint = src.outPoint;

        function slider(name, val) {
            var s = ctrl.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
            s.name = name;
            s.property(1).setValue(val);
            return s;
        }
        slider("Decalage RGB", 12);
        slider("Intensite glitch", 25);
        slider("Tremblement", 0);

        var jit = ctrl.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
        jit.name = "_jitter (auto)";
        jit.property(1).expression =
            'var d = effect("Decalage RGB")(1);\n' +
            'var g = effect("Intensite glitch")(1);\n' +
            'seedRandom(Math.floor(time * 12), true);\n' +
            '(random() < g / 100) ? random(-3, 3) * d : 0;';

        var shk = ctrl.property("ADBE Effect Parade").addProperty("ADBE Point Control");
        shk.name = "_shake (auto)";
        shk.property(1).expression = 'wiggle(15, effect("Tremblement")(1)) - value;';

        // --- 3 calques : rouge (source), vert, bleu ---
        var green = src.duplicate();
        var blue = src.duplicate();
        var layers = [
            { l: src,   name: "R", zero: [6, 11], sign: -1, mode: null },
            { l: blue,  name: "B", zero: [1, 6],  sign: 1,  mode: BlendingMode.SCREEN },
            { l: green, name: "G", zero: [1, 11], sign: 0,  mode: BlendingMode.SCREEN }
        ];
        // Mélangeur de couches : 1 = Rouge-Rouge, 6 = Vert-Vert, 11 = Bleu-Bleu
        var ctrlRef = 'thisComp.layer("' + ctrl.name + '")';

        for (var i = 0; i < layers.length; i++) {
            var o = layers[i];
            var lfx = o.l.property("ADBE Effect Parade");
            if (!lfx.canAddProperty("ADBE CHANNEL MIXER")) { throw new Error("Mélangeur de couches introuvable."); }
            var mix = lfx.addProperty("ADBE CHANNEL MIXER");
            mix.name = "SenkO " + o.name;
            for (var z = 0; z < o.zero.length; z++) { mix.property(o.zero[z]).setValue(0); }
            if (o.mode !== null) { o.l.blendingMode = o.mode; }
            if (o.l !== src) { o.l.name = src.name + " [" + o.name + "]"; }

            var head =
                'var c = ' + ctrlRef + ';\n' +
                'var off = c.effect("Decalage RGB")(1) + c.effect("_jitter (auto)")(1);\n' +
                'var sh = c.effect("_shake (auto)")(1);\n';
            var tr = o.l.property("ADBE Transform Group");
            var pos = tr.property("ADBE Position");
            if (pos.dimensionsSeparated) {
                tr.property("ADBE Position_0").expression = head + 'value + (' + o.sign + ') * off + sh[0];';
                tr.property("ADBE Position_1").expression = head + 'value + sh[1];';
            } else {
                pos.expression = head + 'var v = value;\nv[0] += (' + o.sign + ') * off + sh[0];\nv[1] += sh[1];\nv;';
            }
        }
        src.name = src.name + " [R]";
        ctrl.selected = true;
    } catch (e) {
        alert("SenkO RGB Split : " + e.toString() + (e.line ? " (ligne " + e.line + ")" : ""));
    }
    app.endUndoGroup();
})();
