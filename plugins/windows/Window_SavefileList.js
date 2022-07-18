Window_SavefileList.prototype.drawTitle = function(savefileId, x, y) {
    this.contents.fontSize = 20;
    this.drawText(savefileId, x, y + 4, 40, "left");
};

Window_SavefileList.prototype.drawContents = function(info, rect) {
    const left = 60;

    this.contents.fontSize = 14;
    this.drawText("World Name", rect.x + left, rect.y, 150, "left");
    this.drawText("Player Name", rect.x + left + 150 + 20, rect.y, 150, "left");
    this.drawText("Play Time", rect.x + left + 300 + 40, rect.y, 150, "left");
    this.drawText("Geokinesis Level", rect.x + left + 450, rect.y, 150, "left");

    this.contents.fontSize = 20;
    this.drawText(info.worldName ?? "Unnamed World", rect.x + left, rect.y + 8 + 6, 150, "left");
    this.drawText(info.worldName ?? "Unnamed Player", rect.x + left + 150 + 20, rect.y + 8 + 6, 150, "left");
    this.drawText(info.playtime ?? "00:00:00", rect.x + left + 300 + 40, rect.y + 8 + 6, 150, "left");
    this.drawText(info.geokinesisLevel ?? "0", rect.x + left + 450, rect.y + 8 + 6, 150, "left");
};