Window_SavefileList.prototype.drawTitle = function(savefileId, x, y) {
    if (savefileId === 0) {
        this.drawText(TextManager.autosave, x, y, 180);
    } else {
        this.drawText(TextManager.file + " " + savefileId, x, y, 180);
    }
};

Window_SavefileList.prototype.drawContents = function(info, rect) {
    const bottom = rect.y + rect.height;
    if (rect.width >= 420) {
        this.drawPartyCharacters(info, rect.x + 220, bottom - 8);
    }
    const lineHeight = this.lineHeight();
    const y2 = bottom - lineHeight - 4;
    if (y2 >= lineHeight) {
        this.drawPlaytime(info, rect.x, y2, rect.width);
    }
};