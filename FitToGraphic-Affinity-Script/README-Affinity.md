# Fit Document to Graphic (Affinity script)

An Affinity by Canva script (`FitDocumentToGraphic_Affinity.js`) that resizes the open document so the page matches a placed graphic, with an optional bleed. It is the Affinity counterpart of the InDesign and Illustrator scripts.

## What it does

- Finds a placed graphic (see "Which graphic is used" below).
- Resizes the page to the graphic's bounds, including any part hanging off the page.
- Moves the graphic to the top-left corner of the page.
- Optionally adds a bleed (default 3 mm) on all four sides, outside the page. The page stays the exact size of the graphic.
- Locks the graphic by default, so it can't be moved by accident. This can be unticked in the dialog.
- Optionally hides the graphic, so it isn't printed or exported (off by default).

## Installation and use

1. Open the document containing the placed graphic.
2. Optionally select the graphic.
3. Run the script from Affinity's scripts panel, or paste it into the script editor and run it. The exact menu location depends on your Affinity version.
4. In the dialog, set the bleed (or untick **Add bleed**), choose whether to lock and/or hide the graphic, and click **OK**.
5. A confirmation shows the new size in millimetres.

## Which graphic is used

1. The first selected object.
2. If nothing is selected and the page holds one object, that object.
3. If there are several objects, a list dialog lets you choose one.

## Differences from the InDesign and Illustrator scripts

- **No "non-printing" layer setting.** Affinity has no per-layer Print option. The closest equivalent is hiding the graphic, because hidden layers aren't printed or exported. The catch is that the graphic also disappears from the canvas, so this option is off by default. If you want a visible reference, leave it unticked.
- **No guide layer.** Affinity guides belong to the document rather than a layer, and bleed is shown by Affinity itself, so the script adds no trim guides.
- **No margin reset.** Page margins are left as they are.

## Notes and limitations

- **Documents without artboards only.** If the document has artboards, the script stops with a message.
- **First spread only.** Single-spread documents are the intended case.
- **Bleed couldn't be read back.** The script sets the bleed through the document properties and the change is recorded in the undo history, but the SDK's page-box readouts don't report bleed values. Check **Document > Document Setup** to see the bleed that was applied.
- **Artwork is not extended into the bleed.** The graphic isn't scaled or stretched, so if it has no built-in bleed, the bleed area will be empty.
- **Undo:** each step is a separate command, so undoing may take several presses of **Edit > Undo**.

## Disclaimer

These scripts are provided free of charge, as is, with no warranty of any kind. They change the size and layout of your document, so run them on a copy first and check the result (page size, bleed, trim guide and any non-printing settings) before sending files to print. CoverSpec Studio accepts no responsibility for errors, lost work or printing problems arising from their use. Confirm final dimensions with your printer.
