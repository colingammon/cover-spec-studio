/*
  FitDocumentToGraphic.jsx
  Resizes the active InDesign document so the page matches a placed graphic,
  then moves the graphic's frame to the top-left corner of the page.

  Which graphic is used:
    1. The selected graphic (or its frame), if you have one selected
    2. Otherwise, the only graphic in the document
    3. Otherwise, you are asked to pick from a list

  A dialog offers an optional bleed (default 3 mm, all sides). The bleed is
  added outside the page, so the page stays the exact size of the graphic.

  The layer containing the graphic is always set to non-printing, and is
  locked by default (a checkbox in the dialog lets you leave it unlocked).

  The frame's visible bounds are used, so a cropped graphic fits what is
  actually visible, not the full uncropped image.

  Install: InDesign > Window > Utilities > Scripts, right-click "User",
  "Reveal in Finder/Explorer", drop this file into the Scripts Panel folder.
*/

#target indesign

(function () {
    if (app.documents.length === 0) {
        alert("Open a document first.");
        return;
    }

    var doc = app.activeDocument;

    // ---- Find the graphic ------------------------------------------------
    var graphic = null;

    if (app.selection.length > 0) {
        var sel = app.selection[0];
        var gc = "Image,EPS,PDF,ImportedPage,PICT,WMF,SVG".split(",");
        var t = sel.constructor.name;
        var isGraphic = false;
        for (var i = 0; i < gc.length; i++) if (t === gc[i]) isGraphic = true;

        if (isGraphic) {
            graphic = sel;
        } else if (sel.hasOwnProperty("allGraphics") && sel.allGraphics.length > 0) {
            graphic = sel.allGraphics[0];
        }
    }

    if (!graphic) {
        var all = doc.allGraphics;
        if (all.length === 0) {
            alert("No placed graphics found in this document.");
            return;
        }
        if (all.length === 1) {
            graphic = all[0];
        } else {
            var names = [];
            for (var n = 0; n < all.length; n++) {
                var pg = "";
                try { pg = " (page " + all[n].parentPage.name + ")"; } catch (e) { pg = " (pasteboard)"; }
                var nm = "";
                try { nm = all[n].itemLink.name; } catch (e2) { nm = "Embedded graphic"; }
                names.push((n + 1) + ": " + nm + pg);
            }
            var w = new Window("dialog", "Fit document to graphic");
            w.orientation = "column";
            w.alignChildren = "fill";
            w.add("statictext", undefined, "Choose the graphic to fit the document to:");
            var list = w.add("listbox", [0, 0, 380, 200], names);
            list.selection = 0;
            var g = w.add("group");
            g.alignment = "right";
            g.add("button", undefined, "OK", { name: "ok" });
            g.add("button", undefined, "Cancel", { name: "cancel" });
            if (w.show() !== 1 || !list.selection) return;
            graphic = all[list.selection.index];
        }
    }

    // Use the containing frame so any cropping is respected
    var item = graphic;
    try {
        if (graphic.parent && graphic.parent.constructor.name !== "Page" &&
            graphic.parent.constructor.name !== "Spread" &&
            graphic.parent.constructor.name !== "MasterSpread") {
            item = graphic.parent;
        }
    } catch (e) {}

    // ---- Bleed option ----------------------------------------------------
    var bleedMm = 0;
    var bw = new Window("dialog", "Fit document to graphic");
    bw.orientation = "column";
    bw.alignChildren = "left";
    bw.margins = 16;
    bw.add("statictext", undefined, "Resize the document to match the graphic.");
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
    var bb = bw.add("group");
    bb.alignment = "right";
    bb.add("button", undefined, "OK", { name: "ok" });
    bb.add("button", undefined, "Cancel", { name: "cancel" });
    if (bw.show() !== 1) return;

    if (bleedCheck.value) {
        bleedMm = parseFloat(bleedInput.text.replace(",", "."));
        if (isNaN(bleedMm) || bleedMm < 0) {
            alert("Please enter a valid bleed value in mm.");
            return;
        }
    }
    var addBleed = bleedCheck.value;
    var lockLayer = lockCheck.value;
    var MM_TO_PT = 2.834645669;

    // ---- Run as one undo step -------------------------------------------
    app.doScript(function () {
        var vp = doc.viewPreferences;
        var oldH = vp.horizontalMeasurementUnits;
        var oldV = vp.verticalMeasurementUnits;
        var oldOrigin = vp.rulerOrigin;

        vp.horizontalMeasurementUnits = MeasurementUnits.POINTS;
        vp.verticalMeasurementUnits = MeasurementUnits.POINTS;
        vp.rulerOrigin = RulerOrigin.PAGE_ORIGIN; // bounds relative to the item's page

        try {
            // The layer holding the graphic: unlock it so the frame can be moved
            var baseLayer = item.itemLayer;
            try { baseLayer.locked = false; } catch (eu) {}

            var b = item.visibleBounds;           // [y1, x1, y2, x2]
            var width = b[3] - b[1];
            var height = b[2] - b[0];

            // Margins larger than the new page size would cause errors
            for (var p = 0; p < doc.pages.length; p++) {
                var m = doc.pages[p].marginPreferences;
                m.top = 0; m.bottom = 0; m.left = 0; m.right = 0;
            }

            doc.documentPreferences.pageWidth = width;
            doc.documentPreferences.pageHeight = height;

            // Bleed sits outside the trim size (page = graphic size)
            if (addBleed) {
                var dp = doc.documentPreferences;
                dp.documentBleedUniformSize = true;
                dp.documentBleedTopOffset = bleedMm * MM_TO_PT; // uniform: applies to all sides
            }

            // Re-read bounds (page origin may have shifted), then align to page top-left
            var nb = item.visibleBounds;
            item.move(undefined, [-nb[1], -nb[0]]);

            // Always make the graphic's layer non-printing; lock it unless unticked
            var layerNote = "";
            try {
                baseLayer.printable = false;
                layerNote = "\nLayer \"" + baseLayer.name + "\" set to non-printing";
                if (lockLayer) {
                    baseLayer.locked = true;
                    layerNote += " and locked";
                }
                layerNote += ".";
            } catch (el) {
                layerNote = "\n(Could not change the graphic's layer settings.)";
            }

            alert("Document resized to " + width.toFixed(2) + " x " +
                  height.toFixed(2) + " pt\n(" +
                  (width / 2.834645669).toFixed(1) + " x " +
                  (height / 2.834645669).toFixed(1) + " mm)" +
                  (addBleed ? "\nBleed: " + bleedMm + " mm on all sides" : "") +
                  layerNote);
        } finally {
            vp.horizontalMeasurementUnits = oldH;
            vp.verticalMeasurementUnits = oldV;
            vp.rulerOrigin = oldOrigin;
        }
    }, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, "Fit document to graphic");
})();
