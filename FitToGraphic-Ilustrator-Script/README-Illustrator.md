# Fit Artboard to Graphic (Illustrator script)

An Adobe Illustrator ExtendScript (`FitArtboardToGraphic.jsx`) that resizes the active artboard to match a placed or embedded graphic, with an optional bleed.

## What it does

- Finds a placed (linked) or embedded graphic (see "Which graphic is used" below).
- Resizes the active artboard to the visible bounds of that graphic, including any stroke.
- Optionally adds a bleed (default 3 mm) on all four sides by enlarging the artboard.
- When bleed is added, draws a guide rectangle at the exact trim size (the graphic's bounds), on its own **Trim Guide** layer. The layer is created if it doesn't exist and reused if it does.
- Locks the **Trim Guide** layer by default, so the guide can't be moved by accident. This can be unticked in the dialog and only applies when bleed is added.
- Locks the layer containing the graphic by default, so it can't be moved by accident. This can be unticked in the dialog.
- Always sets the layer containing the graphic to non-printing (Layer Options > Print unticked). There is no option to skip this.
- Restores the coordinate system setting afterwards.

## Installation

1. Copy `FitArtboardToGraphic.jsx` into Illustrator's scripts folder:
   - **Windows:** `C:\Program Files\Adobe\Adobe Illustrator <version>\Presets\en_US\Scripts`
   - **macOS:** `/Applications/Adobe Illustrator <version>/Presets/en_US/Scripts`
2. Restart Illustrator.
3. The script appears under **File > Scripts**.

To run it without installing, use **File > Scripts > Other Script...** and browse to the file.

## Usage

1. Open the document containing the graphic.
2. Optionally select the graphic you want to fit to.
3. Run **FitArtboardToGraphic** from File > Scripts.
4. In the dialog, tick **Add bleed** and set the value in mm (default 3), or untick it for no bleed.
5. **Lock the graphic's layer** is ticked by default; untick it if you want to keep editing the graphic.
6. **Lock the guide layer** is also ticked by default; untick it if you want to adjust the trim guide.
7. Click **OK**. A confirmation shows the trim size in points and millimetres, plus the artboard size including bleed.

## Which graphic is used

1. The current selection. If it sits inside a clipping group, the group's visible bounds are used.
2. If nothing is selected and the document contains one placed or embedded graphic, that graphic.
3. If there are several, a list dialog lets you choose one.

## How bleed works

The Illustrator scripting DOM cannot set the document bleed (File > Document Setup > Bleed). Instead, the bleed is built into the artboard:

- **Artboard size** = graphic size + bleed on every side.
- **Trim size** = the graphic's exact bounds, marked by a guide rectangle.

If you need a true document bleed, untick **Add bleed** in the script and enter the value in Document Setup afterwards.

## Notes and limitations

- **Only the active artboard is resized.** Other artboards are left alone.
- **The graphic is not moved or scaled.** The artboard is repositioned around it, since Illustrator artboards can sit anywhere on the canvas.
- **Artwork is not extended into the bleed.** If the graphic has no built-in bleed, the bleed area will be empty until you extend the artwork.
- The trim guide goes on the **Trim Guide** layer. If that layer already existed, it is unlocked and made visible while the guide is added, then locked again if **Lock the guide layer** is ticked. Running the script again adds another guide to that layer, so unlock it and delete the old guide first if you re-run it.
- The non-printing setting affects the whole layer containing the graphic, so any other artwork on that layer will not print either. To print the layer again, tick **Print** in its Layer Options.
- Bounds use the item's visible bounds, so strokes are included.
- Illustrator does not group scripted changes into one undo step, so undoing may take more than one press of **Edit > Undo**.

## Related

The InDesign version of this tool is `FitDocumentToGraphic.jsx`, documented in `README.md`.

## Disclaimer

These scripts are provided free of charge, as is, with no warranty of any kind. They change the size and layout of your document, so run them on a copy first and check the result (page size, bleed, trim guide and any non-printing settings) before sending files to print. CoverSpec Studio accepts no responsibility for errors, lost work or printing problems arising from their use. Confirm final dimensions with your printer.
