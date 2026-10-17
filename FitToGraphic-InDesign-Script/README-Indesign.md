# Fit Document to Graphic (InDesign script)

An Adobe InDesign ExtendScript (`FitDocumentToGraphic.jsx`) that resizes the active document so the page matches the size of a placed graphic, with an optional bleed.

## What it does

- Finds a placed graphic (see "Which graphic is used" below).
- Sets the document page width and height to the visible size of the graphic's frame, so cropped graphics fit what is actually visible rather than the full uncropped image.
- Sets all page margins to 0, so margins can't conflict with the smaller page size.
- Moves the graphic's frame to the top-left corner of the page.
- Always sets the layer containing the graphic to non-printing (Layer Options > Print unticked). There is no option to skip this.
- Locks the layer containing the graphic by default, so it can't be moved by accident. This can be unticked in the dialog.
- Optionally adds a bleed (default 3 mm) on all four sides, outside the page. The page stays the exact size of the graphic.
- Runs as a single undo step, and restores your original ruler units and ruler origin afterwards.

## Installation

1. In InDesign, open **Window > Utilities > Scripts**.
2. Right-click the **User** folder and choose **Reveal in Finder** (macOS) or **Reveal in Explorer** (Windows).
3. Copy `FitDocumentToGraphic.jsx` into the folder that opens.
4. The script appears in the Scripts panel under **User**.

## Usage

1. Open the document containing the placed graphic.
2. Optionally select the graphic or its frame.
3. Double-click **FitDocumentToGraphic** in the Scripts panel.
4. In the dialog, tick **Add bleed** and set the value in mm (default 3), or untick it to leave the existing bleed settings unchanged.
5. **Lock the graphic's layer** is ticked by default; untick it if you want to keep editing the graphic.
6. Click **OK**. A confirmation shows the new document size in points and millimetres, plus the bleed if one was added.

## Which graphic is used

1. The selected graphic, or the first graphic inside the selected frame.
2. If nothing relevant is selected and the document contains one graphic, that graphic.
3. If there are several graphics, a list dialog lets you choose one.

## Notes and limitations

- **Whole document is resized.** Every page ends up the same size. For documents that need different page sizes, a per-page version using `page.resize()` would be needed.
- **Artwork is not extended into the bleed.** The graphic is not scaled or stretched, so if it has no built-in bleed, the bleed area will be empty until you extend the frame or image.
- **Margins are reset to 0** on all pages.
- **The whole layer is affected.** The non-printing and locked settings apply to the entire layer containing the graphic, so any other artwork on that layer won't print either. To print it again, tick **Print** in the layer's Layer Options. If the layer is already locked, the script unlocks it to move the frame, then locks it again unless the lock option is unticked.
- Bleed is applied uniformly to all sides. It overwrites the document's bleed settings only when **Add bleed** is ticked.
- Graphics on the pasteboard are supported, but the frame is moved to the top-left of the page regardless of where it started.
- Only the visible bounds of the frame are used (including any stroke).

## Undo

Use **Edit > Undo Fit document to graphic** to revert the whole operation in one step.
