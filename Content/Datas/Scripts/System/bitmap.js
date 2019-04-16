/*
    RPG Paper Maker Copyright (C) 2017-2019 Marie Laporte

    Commercial license for commercial use of your games:
        https://creativecommons.org/licenses/by-nc/4.0/.

    See more information here: http://rpg-paper-maker.com/index.php/downloads.
*/

// -------------------------------------------------------
//
//  CLASS Bitmap
//
// -------------------------------------------------------

/** @class
*   A bitmap is something that can be drawn on the HUD. It can be a window,
*   a text, an image...
*   @property {number} x Coords of the bitmap.
*   @property {number} y Coords of the bitmap.
*   @property {number} w Coords of the bitmap.
*   @property {number} h Coords of the bitmap.
*   @param {number} [x=0] - Coords of the bitmap.
*   @param {number} [y=0] - Coords of the bitmap.
*   @param {number} [w=0] - Coords of the bitmap.
*   @param {number} [h=0] - Coords of the bitmap.
*/
function Bitmap(x, y, w, h){

    // Default values
    if (typeof x === 'undefined') x = 0;
    if (typeof y === 'undefined') y = 0;
    if (typeof w === 'undefined') w = 0;
    if (typeof h === 'undefined') h = 0;

    Bitmap.prototype.setX.call(this, x);
    Bitmap.prototype.setY.call(this, y);
    Bitmap.prototype.setW.call(this, w);
    Bitmap.prototype.setH.call(this, h);
}

Bitmap.prototype = {

    /** Set the x value.
    *   @param {number} x The x value.
    */
    setX: function(x){
        this.oX = x;
        this.x = RPM.getScreenX(x);
        $requestPaintHUD = true;
    },

    // -------------------------------------------------------

    /** Set the y value.
    *   @param {number} y The y value.
    */
    setY: function(y){
        this.oY = y;
        this.y = RPM.getScreenY(y);
        $requestPaintHUD = true;
    },

    // -------------------------------------------------------

    /** Set the w value.
    *   @param {number} w The w value.
    */
    setW: function(w){
        this.oW = w;
        this.w = RPM.getScreenX(w);
        $requestPaintHUD = true;
    },

    // -------------------------------------------------------

    /** Set the h value.
    *   @param {number} h The h value.
    */
    setH: function(h){
        this.oH = h;
        this.h = RPM.getScreenY(h);
        $requestPaintHUD = true;
    },

    // -------------------------------------------------------

    /** Set the position to the top.
    */
    setLeft: function() {
        this.oX = 0;
        this.x = 0;
        $requestPaintHUD = true;
    },

    // -------------------------------------------------------

    /** Set the position to the top.
    */
    setTop: function() {
        this.oY = 0;
        this.y = 0;
        $requestPaintHUD = true;
    },

    // -------------------------------------------------------

    /** Set the position to the top.
    */
    setRight: function(offset) {
        Bitmap.prototype.setX.call(this, $SCREEN_X - this.oW - (offset ? offset
            : 0));
    },

    // -------------------------------------------------------

    /** Set the position to the top.
    */
    setBot: function(offset) {
        Bitmap.prototype.setY.call(this, $SCREEN_Y - this.oH - (offset ? offset
            : 0));
    },

    // -------------------------------------------------------

    /** Set all the coords values.
    *   @param {number} x The x value.
    *   @param {number} y The y value.
    *   @param {number} w The w value.
    *   @param {number} h The h value.
    */
    setCoords: function(x, y, w, h){
        this.setX(x);
        this.setY(y);
        this.setW(w);
        this.setH(h);
    }
}
