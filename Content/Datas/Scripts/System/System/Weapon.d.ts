import { Armor } from "./Armor";
import { System } from "..";
/** @class
 *  A weapon of the game.
 *  @extends System.Armor
 *  @param {Record<string, any>} [json=undefined] Json object describing the
 *  weapon
 */
declare class Weapon extends Armor {
    constructor(json?: Record<string, any>);
    /**
     *  Read the JSON associated to the weapon.
     *  @param {Record<string, any>} json Json object describing the weapon
     */
    read(json: Record<string, any>): void;
    /**
     *  Get the weapon kind.
     *  @returns {System/WeaponArmorKind}
     */
    getType(): System.WeaponArmorKind;
}
export { Weapon };