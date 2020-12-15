/*
    RPG Paper Maker Copyright (C) 2017-2020 Wano

    RPG Paper Maker engine is under proprietary license.
    This source code is also copyrighted.

    Use Commercial edition for commercial use of your games.
    See RPG Paper Maker EULA here:
        http://rpg-paper-maker.com/index.php/eula.
*/
import { Base } from "./Base.js";
import { System, EventCommand, Manager, Scene } from "../index.js";
import { MapObject } from "../Core/index.js";
/** @class
 *  An event command for changing an object state.
 *  @extends EventCommand
 *  @property {System.DynamicValue} mapID The map ID value
 *  @property {System.DynamicValue} objectID The object ID value
 *  @property {number} idState The ID of the state to change
 *  @property {number} operationKind Index of operation
 *  @param {Object} command Direct JSON command to parse
 */
class ChangeState extends Base {
    constructor(command) {
        super();
        let iterator = {
            i: 0
        };
        this.mapID = System.DynamicValue.createValueCommand(command, iterator);
        this.objectID = System.DynamicValue.createValueCommand(command, iterator);
        this.idState = System.DynamicValue.createValueCommand(command, iterator);
        this.operationKind = command[iterator.i++];
    }
    /**
     *  Add a state to an object.
     *  @static
     *  @param {Record<string, any>} portionDatas Datas inside a portion
     *  @param {number} index Index in the portion datas
     *  @param {number} state ID of the state
     */
    static addState(portionDatas, index, state) {
        let states = portionDatas.s[index];
        if (states.indexOf(state) === -1) {
            states.push(state);
        }
        EventCommand.ChangeState.removeFromDatas(portionDatas, index, states);
    }
    /**
     *  Remove a state from an object.
     *  @static
     *  @param {Record<string, any>} portionDatas Datas inside a portion
     *  @param {number} index Index in the portion datas
     *  @param {number} state ID of the state
     */
    static removeState(portionDatas, index, state) {
        let states = portionDatas.s[index];
        let indexState = states.indexOf(state);
        if (states.indexOf(state) !== -1) {
            states.splice(indexState, 1);
        }
        EventCommand.ChangeState.removeFromDatas(portionDatas, index, states);
    }
    /**
     *  Remove all the states from an object.
     *  @static
     *  @param {Record<string, any>} portionDatas Datas inside a portion
     *  @param {number} index Index in the portion datas
     */
    static removeAll(portionDatas, index) {
        portionDatas.s[index] = [];
    }
    /**
     *  Remove states from datas.
     *  @static
     *  @param {Record<string, any>} portionDatas Datas inside a portion
     *  @param {number} index Index in the portion datas
     *  @param {number[]} states
     */
    static removeFromDatas(portionDatas, index, states) {
        if (states.length === 1 && states[0] === 1) {
            portionDatas.si.splice(index, 1);
            portionDatas.s.splice(index, 1);
        }
    }
    /**
     *  Add state in ID's list.
     *  @static
     *  @param {number[]} states The states IDs
     *  @param {number} state ID of the state
     */
    static addStateSpecial(states, state) {
        if (states.indexOf(state) === -1) {
            states.push(state);
        }
    }
    /**
     *  Remove state in ID's list.
     *  @static
     *  @param {number[]} states The states IDs
     *  @param {number} state ID of the state
     */
    static removeStateSpecial(states, state) {
        let indexState = states.indexOf(state);
        if (indexState !== -1) {
            states.splice(indexState, 1);
        }
    }
    /**
     *  Initialize the current state.
     *  @returns {Record<string, any>} The current state
     */
    initialize() {
        return {
            map: null,
            object: null,
            mapID: this.mapID.getValue(),
            objectID: this.objectID.getValue()
        };
    }
    /**
     *  Update and check if the event is finished.
     *  @param {Record<string, any>} currentState The current state of the event
     *  @param {MapObject} object The current object reacting
     *  @param {number} state The state ID
     *  @returns {number} The number of node to pass
     */
    update(currentState, object, state) {
        if (!currentState.waitingObject) {
            if (currentState.map === null) {
                if (currentState.mapID === -1 || currentState.mapID === Manager
                    .Stack.currentMap.id || currentState.objectID === -1) {
                    currentState.map = Manager.Stack.currentMap;
                }
                else {
                    currentState.map = new Scene.Map(currentState.mapID, false, true);
                    currentState.map.readMapProperties();
                    currentState.map.initializeObjects();
                }
            }
            if (currentState.map.allObjects && currentState.map
                .portionsObjectsUpdated) {
                if (currentState.map === Manager.Stack.currentMap) {
                    (async () => {
                        currentState.object = (await MapObject.searchInMap(currentState.objectID, object)).object;
                    })();
                }
                else {
                    currentState.object = {};
                }
                currentState.waitingObject = true;
            }
        }
        if (currentState.waitingObject && currentState.object !== null) {
            if (currentState.object.isHero || currentState.object.isStartup) {
                let states = currentState.object.isHero ? Manager.Stack.game
                    .heroStates : Manager.Stack.game.startupStates[Manager.Stack
                    .currentMap.id];
                switch (this.operationKind) {
                    case 0: // Replacing
                        if (currentState.object.isHero) {
                            Manager.Stack.game.heroStates = [];
                        }
                        else {
                            Manager.Stack.game.startupStates[Manager.Stack
                                .currentMap.id] = [];
                        }
                        states = currentState.object.isHero ? Manager.Stack.game
                            .heroStates : Manager.Stack.game.startupStates[Manager.Stack.currentMap.id];
                        EventCommand.ChangeState.addStateSpecial(states, this
                            .idState.getValue());
                        break;
                    case 1: // Adding
                        EventCommand.ChangeState.addStateSpecial(states, this
                            .idState.getValue());
                        break;
                    case 2: // Deleting
                        EventCommand.ChangeState.removeStateSpecial(states, this
                            .idState.getValue());
                        break;
                }
            }
            else {
                let objectID = currentState.objectID === -1 ? object.system.id :
                    currentState.objectID;
                let portion = currentState.map.allObjects[objectID]
                    .getGlobalPortion();
                let portionDatas = Manager.Stack.game.getPotionsDatas(currentState.map.id, portion);
                let indexState = portionDatas.si.indexOf(objectID);
                if (indexState === -1) {
                    indexState = portionDatas.si.length;
                    portionDatas.si.push(objectID);
                    portionDatas.s.push([1]);
                }
                switch (this.operationKind) {
                    case 0: // Replacing
                        EventCommand.ChangeState.removeAll(portionDatas, indexState);
                        EventCommand.ChangeState.addState(portionDatas, indexState, this.idState.getValue());
                        break;
                    case 1: // Adding
                        EventCommand.ChangeState.addState(portionDatas, indexState, this.idState.getValue());
                        break;
                    case 2: // Deleting
                        EventCommand.ChangeState.removeState(portionDatas, indexState, this.idState.getValue());
                        break;
                }
            }
            if (currentState.map === Manager.Stack.currentMap) {
                currentState.object.changeState();
            }
            return 1;
        }
        return 0;
    }
}
export { ChangeState };