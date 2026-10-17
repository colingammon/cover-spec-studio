/*
  FitArtboardToGraphic.jsx  (Adobe Illustrator)

  Resizes the active artboard so it matches a placed or embedded graphic,
  with an optional bleed.

  Which graphic is used:
    1. The current selection (a linked/placed item, embedded image, or any
       selected object; a clipped group uses the group's visible bounds)
    2. Otherwise, the only placed/embedded graphic in the document
    3. Otherwise, you are asked to pick from a list

  Bleed:
    The Illustrator scripting DOM cannot set the document bleed (File >
    Document Setup > Bleed), so the bleed is built into the artboard instead:
    the artboard becomes graphic size + bleed on every side, and a guide
    rectangle is drawn at the exact trim size (graphic bounds). The guide is
    placed on its own "Trim Guide" layer (created if it doesn't exist).

  Lock options:
    "Lock the graphic's layer" and "Lock the guide layer" are both ticked by
    default, so neither can be moved by accident. Untick either to leave that
    layer unlocked. (The guide layer is only created when bleed is added.)

  Non-printing:
    The layer containing the graphic is always set to non-printing (Layer
    Options > Print unticked), so the base graphic doesn't print or export
    with the artwork. Re-tick Print in Layer Options if you ever need it.
    To set a true document bleed, enter it in Document Setup afterwards.

  Only the active artboard is changed; other artboards are left alone.

  Install: copy this file into
    Windows: C:\Program Files\Adobe\Adobe Illustrator <version>\Presets\en_US\Scripts
    macOS:   /Applications/Adobe Illustrator <version>/Presets/en_US/Scripts
  then restart Illustrator. Run via File > Scripts, or File > Scripts > Other
  Script... to run it from anywhere.
*/

#target illustrator

(function () {
    if (app.documents.length === 0) {
        alert("Open a document first.");
        return;
    }

    var doc = app.activeDocument;
    var MM_TO_PT = 2.834645669;

    // ---- Find the graphic ------------------------------------------------
    var target = null;

    if (doc.selection && doc.selection.length > 0) {
        target = doc.selection[0];
        // Use a clipping group's visible bounds if the selection is inside one
        try {
            if (target.parent && target.parent.typename === "GroupItem" && target.parent.clipped) {
                target = target.parent;
            }
        } catch (e) {}
    }

    if (!target) {
        var candidates = [];
        var i;
        for (i = 0; i < doc.placedItems.length; i++) candidates.push(doc.placedItems[i]);
        for (i = 0; i < doc.rasterItems.length; i++) candidates.push(doc.rasterItems[i]);

        if (candidates.length === 0) {
            alert("No placed or embedded graphics found in this document.");
            return;
        }

        if (candidates.length === 1) {
            target = candidates[0];
        } else {
            var names = [];
            for (var n = 0; n < candidates.length; n++) {
                var nm = "";
                try {
                    nm = candidates[n].typename === "PlacedItem"
                        ? candidates[n].file.name
                        : (candidates[n].name || "Embedded image");
                } catch (e1) { nm = candidates[n].name || "Graphic"; }
                names.push((n + 1) + ": " + nm);
            }
            var w = new Window("dialog", "Fit artboard to graphic");
            w.orientation = "column";
            w.alignChildren = "fill";
            w.add("statictext", undefined, "Choose the graphic to fit the artboard to:");
            var list = w.add("listbox", [0, 0, 380, 200], names);
            list.selection = 0;
            var g = w.add("group");
            g.alignment = "right";
            g.add("button", undefined, "OK", { name: "ok" });
            g.add("button", undefined, "Cancel", { name: "cancel" });
            if (w.show() !== 1 || !list.selection) return;
            target = candidates[list.selection.index];
        }
    }

    // ---- Bleed option ----------------------------------------------------
    var bw = new Window("dialog", "Fit artboard to graphic");
    bw.orientation = "column";
    bw.alignChildren = "left";
    bw.margins = 16;
    bw.add("statictext", undefined, "Resize the active artboard to match the graphic.");
    var bg = bw.add("group");
    bg.orientation = "row";
    var bleedCheck = bg.add("checkbox", undefined, "Add bleed:");
    bleedCheck.value = true;
    var bleedInput = bg.add("edittext", undefined, "3");
    bleedInput.characters = 5;
    bg.add("statictext", undefined, "mm (all sides)");
    bleedCheck.onClick = function () { bleedInput.enabled = bleedCheck.value; };
    var lockCheck = bw.add("checkbox", undefined, "Lock the graphic's layer");
    lockCheck.value = true;
    var lockGuideCheck = bw.add("checkbox", undefined, "Lock the guide layer");
    lockGuideCheck.value = true;
    var bb = bw.add("group");
    bb.alignment = "right";
    bb.add("button", undefined, "OK", { name: "ok" });
    bb.add("button", undefined, "Cancel", { name: "cancel" });
    if (bw.show() !== 1) return;

    var bleedMm = 0;
    var addBleed = bleedCheck.value;
    if (addBleed) {
        bleedMm = parseFloat(bleedInput.text.replace(",", "."));
        if (isNaN(bleedMm) || bleedMm < 0) {
            alert("Please enter a valid bleed value in mm.");
            return;
        }
    }
    var bleedPt = bleedMm * MM_TO_PT;    var lockLayer = lockCheck.value;
    var lockGuide = lockGuideCheck.value;

    // ---- Resize the artboard --------------------------------------------
    var oldCoords = app.coordinateSystem;
    app.coordinateSystem = CoordinateSystem.DOCUMENTCOORDINATESYSTEM;

    try {
        // visibleBounds = [left, top, right, bottom] (includes strokes)
        var b = target.visibleBounds;
        var left = b[0], top = b[1], right = b[2], bottom = b[3];
        var width = right - left;
        var height = top - bottom;

        var abIndex = doc.artboards.getActiveArtboardIndex();
        var ab = doc.artboards[abIndex];

        ab.artboardRect = [
            left - bleedPt,   // left
            top + bleedPt,    // top
            right + bleedPt,  // right
            bottom - bleedPt  // bottom
        ];

        // Draw a trim guide at the exact graphic size on its own layer
        var guideNote = "";
        if (addBleed && bleedMm > 0) {
            var prevActive = doc.activeLayer;
            try {
                var guideLayer = null;
                for (var li = 0; li < doc.layers.length; li++) {
                    if (doc.layers[li].name === "Trim Guide") {
                        guideLayer = doc.layers[li];
                        break;
                    }
                }
                if (!guideLayer) {
                    guideLayer = doc.layers.add();
                    guideLayer.name = "Trim Guide";
                }
                guideLayer.locked = false;
                guideLayer.visible = true;

                var trim = guideLayer.pathItems.rectangle(top, left, width, height);
                trim.guides = true;
                if (lockGuide) guideLayer.locked = true;
                guideNote = "\nA trim guide was added on the \"Trim Guide\" layer" +
                            (lockGuide ? " (locked)." : ".");
            } catch (eg) {
                guideNote = "\n(Could not add the trim guide: " + eg + ")";
            }
            try { doc.activeLayer = prevActive; } catch (ea) {}
        }

        // Always set the graphic's layer to non-printing
        var printNote = "";
        try {
            var gl = target.layer;
            gl.printable = false;
            printNote = "\nLayer \"" + gl.name + "\" set to non-printing.";
        } catch (ep) {
            printNote = "\n(Could not change the graphic's layer print setting.)";
        }

        // Lock the graphic's layer last, after everything else is done
        var lockNote = "";
        if (lockLayer) {
            try {
                var ll = target.layer;
                ll.locked = true;
                lockNote = "\nLayer \"" + ll.name + "\" locked.";
            } catch (el) {
                lockNote = "\n(Could not lock the graphic's layer.)";
            }
        }

        var msg = "Artboard \"" + ab.name + "\" fitted to graphic.\n" +
                  "Trim size: " + width.toFixed(2) + " x " + height.toFixed(2) + " pt (" +
                  (width / MM_TO_PT).toFixed(1) + " x " + (height / MM_TO_PT).toFixed(1) + " mm)";
        if (addBleed) {
            msg += "\nArtboard incl. bleed: " +
                   ((width + 2 * bleedPt) / MM_TO_PT).toFixed(1) + " x " +
                   ((height + 2 * bleedPt) / MM_TO_PT).toFixed(1) + " mm (" + bleedMm + " mm bleed)" +
                   guideNote;
        }
        msg += printNote + lockNote;
        alert(msg);
    } catch (err) {
        alert("Could not resize the artboard:\n" + err);
    } finally {
        app.coordinateSystem = oldCoords;
    }
})();
