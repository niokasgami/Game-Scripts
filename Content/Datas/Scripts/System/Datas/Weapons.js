/*
    RPG Paper Maker Copyright (C) 2017-2020 Wano

    RPG Paper Maker engine is under proprietary license.
    This source code is also copyrighted.

    Use Commercial edition for commercial use of your games.
    See RPG Paper Maker EULA here:
        http://rpg-paper-maker.com/index.php/eula.
*/
import { IO, Paths, Utils } from "../Common/index.js";
import { System } from "../index.js";
/** @class
 *  All the weapons datas
 *  @property {System.Weapon[]} list List of all the weapons of the game
 *  according to ID
 */
class Weapons {
    constructor() {
        throw new Error("This is a static class!");
    }
    /**
     *  Read the JSON file associated to weapons
     *  @static
     *  @async
     */
    static async read() {
        let json = (await IO.parseFileJSON(Paths.FILE_WEAPONS)).weapons;
        this.list = [];
        Utils.readJSONSystemList({ list: json, listIDs: this.list, cons: System
                .Weapon });
    }
}
export { Weapons };