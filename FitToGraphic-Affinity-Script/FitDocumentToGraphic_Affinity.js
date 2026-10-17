/*
  FitDocumentToGraphic_Affinity.js  (Affinity by Canva scripting)

  Resizes the open document so the page matches the size of a placed
  graphic, moves the graphic to the top-left of the page, and can add a bleed.

  Which graphic is used:
    1. The first selected object, if anything is selected
    2. Otherwise, the only object on the page
    3. Otherwise, you pick one from a list

  Options (dialog):
    - Add bleed (default 3 mm, all sides). The bleed sits outside the page,
      so the page stays the exact size of the graphic.
    - Lock the graphic (default on)
    - Hide the graphic (default off). Affinity has no per-layer "non-printing"
      setting, so hiding is the closest equivalent: a hidden layer is not
      printed or exported.

  Limits:
    - Documents without artboards only. The page is resized to the graphic's
      bounds (including any part hanging off the page).
    - Single-spread documents: the first spread is resized.

  Run it from Affinity's Scripts panel (or paste it into the script editor).
*/

const { Document } = require('/document.js');
const { DocumentCommand } = require('/commands.js');
const { Dialog, DialogResult, UnitType } = require('/dialog.js');
const { Transform } = require('/geometry.js');
const { DocumentProperties, SpatialAnchor } = require('/documentproperties.js');
const { Selection } = require('/selections.js');

function describeNode(node, index) {
    let name = node.constructor.name.replace(/Node$/, '');
    try {
        if (node.userDescription) name += ' "' + node.userDescription + '"';
    } catch (e) {}
    return (index + 1) + ': ' + name;
}

// Returns the node to fit to, or null if the user cancelled / nothing usable.
function chooseNode(doc) {
    const selected = doc.selection.nodes;
    if (selected.length > 0) {
        return selected.first;
    }

    const children = doc.spreads.first.children.toArray();
    if (children.length === 0) {
        alert('There are no objects in this document.');
        return null;
    }
    if (children.length === 1) {
        return children[0];
    }

    const dlg = Dialog.create('Choose graphic');
    const grp = dlg.addColumn().addGroup();
    const combo = grp.addComboBox('Fit to:', children.map(describeNode), 0);
    if (!dlg.runModal().equals(DialogResult.Ok)) {
        return null;
    }
    return children[combo.selectedIndex];
}

// Returns {bleedMm, lock, hide} or null if cancelled.
function askOptions() {
    const dlg = Dialog.create('Fit document to graphic');
    const grp = dlg.addColumn().addGroup('Options');
    const bleedOn = grp.addCheckBox('Add bleed', true);
    const bleedMm = grp.addUnitValueEditor('Bleed (all sides)', UnitType.Millimetre, UnitType.Millimetre, 3, 0, 50);
    const lock = grp.addCheckBox("Lock the graphic", true);
    const hide = grp.addCheckBox('Hide the graphic (not printed or exported)', false);
    bleedOn.onValueChangedHandler = () => { bleedMm.isEnabled = bleedOn.value; };
    dlg.initialWidth = 340;

    if (!dlg.runModal().equals(DialogResult.Ok)) {
        return null;
    }
    return {
        bleedMm: bleedOn.value ? bleedMm.value : 0,
        lock: lock.value,
        hide: hide.value
    };
}

function fitDocumentToNode(doc, node, opts) {
    const spread = doc.spreads.first;

    // 1. Resize the page to the graphic's bounds (document pixels)
    const bb = node.getSpreadBaseBox(false);
    doc.setSpreadSizeWithAnchor(spread, bb.width, bb.height, SpatialAnchor.TopLeft);

    // 2. Move the graphic to the top-left of the page
    const nb = node.getSpreadBaseBox(false);
    doc.applyTransform(Transform.createTranslate(-nb.x, -nb.y), Selection.create(doc, node));

    // 3. Bleed (stored in document pixels, so convert from mm)
    if (opts.bleedMm > 0) {
        const px = opts.bleedMm / 25.4 * doc.dpi;
        const props = DocumentProperties.create();
        props.bleed = { left: px, top: px, right: px, bottom: px };
        doc.setDocumentProperties(props);
    }

    // 4. Hide, then lock (last, so nothing above is blocked by the lock)
    if (opts.hide) {
        doc.executeCommand(DocumentCommand.createSetVisibility(Selection.create(doc, node), false));
    }
    if (opts.lock) {
        doc.selection = node.selfSelection;
        doc.setEditable(false, null);
    }

    const mmPerPx = 25.4 / doc.dpi;
    return 'Document resized to ' + (bb.width * mmPerPx).toFixed(1) + ' x ' +
           (bb.height * mmPerPx).toFixed(1) + ' mm' +
           (opts.bleedMm > 0 ? ' with ' + opts.bleedMm + ' mm bleed' : '') +
           (opts.hide ? '. Graphic hidden' : '') +
           (opts.lock ? (opts.hide ? ' and locked' : '. Graphic locked') : '') + '.';
}

function main() {
    const doc = Document.current;
    if (!doc) {
        alert('Open a document first.');
        return;
    }
    if (doc.hasArtboards) {
        alert('This script supports documents without artboards.');
        return;
    }

    const node = chooseNode(doc);
    if (!node) return;

    const opts = askOptions();
    if (!opts) return;

    alert(fitDocumentToNode(doc, node, opts));
}

main();
