'use strict';

import {
  findItemIds,
  getFromStateOrObject
} from './helper.js';

import * as constants from './const.js';

export default class InventoryHandler {
  constructor(state, initInventory) {
    this.l_state = state;
    this.initInventory = initInventory;
  }


    inInventory (itemId) {
      if (this.l_state.inventory.indexOf(itemId) != -1) {
        return true; 
      }
      return false; 
    }


    isPortable (itemId) {
      if (this.l_state.objects[itemId] === undefined) {
        return false; 
      }

      if (this.l_state.objects[itemId].portable === undefined) {
        return true;
      }
      return this.l_state.objects[itemId].portable; 
    }

    getPortableError (itemId) {
      const text = this.l_state.objects[itemId].error_portable; 
      return text; 
    }

    addToInventory (itemId) {
      this.l_state.inventory.push(itemId); 
      this.initInventory(); 
    }

    removeFromInventory (item) {
      this.l_state.inventory.remove(item); 
      this.initInventory(); 
    }

    findItemIdsInInventory (names) {
      return findItemIds(names, this.l_state.inventory, this.l_state.objects);
    }

    findItemIdsForNameAnywhere (name) {
      const itemIds = [];
      for (const property in this.l_state.objects) {
        const item = this.l_state.objects[property];
        if (item.name.endsWith(name) && itemIds.indexOf(item.name)==-1) {
          itemIds.push(property);
        }
      }
      return itemIds;
    }

    getStateOfObject(itemId) {
      const object = this.l_state.objects[itemId];
      if (object===undefined) {
        return constants.NONE;
      }
      if (isEmpty(object.state)) {
        return constants.NONE;
      }
      return object.state;
    }


    getSpecificStateOfObject(itemId, state) {
      const object = this.l_state.objects[itemId];

      if (object===undefined || object.states === undefined) {
        return undefined;
      }

      if (state!=constants.NONE&&object.states[state]===undefined) {
        return undefined;
      }
      if (state===undefined || state==constants.NONE) {
        return undefined;
      }
      return object.states[state];
    }

    getNameOfState(itemId, state) {
      const sobj = this.getSpecificStateOfObject(itemId, state);
      if (sobj===undefined) {
        return '';
      }
      return sobj.name;
    }

    getDescriptionOfState(itemId, state) {
      const sobj = this.getSpecificStateOfObject(itemId, state);
      if (sobj===undefined) {
        return '';
      }
      return sobj.description;
    }

    getReadOfState(itemId, state) {
      const sobj = this.getSpecificStateOfObject(itemId, state);
      if (sobj===undefined) {
        return '';
      }
      return sobj.read;
    }

    getErrorOfState(itemId, state) {
      const object = this.l_state.objects[itemId];
      if (state!=constants.NONE&&object.states[state]===undefined) {
        throw state+' is not an allowed state for '+itemId;
      }
      if (state==constants.NONE) {
        return '';
      }
      return object.states[state].error;
    }

    hasState(itemId, state) {
      const object = this.l_state.objects[itemId];
      if (state!=constants.NONE&&(object.states===undefined||object.states[state]===undefined)) {
        return false;
      }
      return true;
    }

    setState(itemId, state) {
      const object = this.l_state.objects[itemId];
      if (this.hasState(itemId, state)) {
        object.state = state;
      }
    }

    lock(itemId, lock) {
      const object = this.l_state.objects[itemId];
      if (object!==undefined) {
        object.locked = lock;
      }
    }

    getStateObject(itemId, state) {
      if (this.hasState(itemId, state)) {
        return this.l_state.objects[itemId].states[state];
      }
    }

    needItemForState(itemId, state) {
      if (this.hasState(itemId, state)) {
        return this.l_state.objects[itemId].states[state].with;
      }
      return undefined;
    }

    isLocked(itemId) {
      return this.l_state.objects[itemId].locked;
    }

    getLockUnlockItem(itemId) {
      return this.l_state.objects[itemId].lock_object;
    }

    getLockedError(itemId) {
      return this.l_state.objects[itemId].lock_error;
    }

    getStateString(itemId) {
      const stateName = this.getNameOfState(itemId, this.getStateOfObject(itemId));
      let stateString = '';
      if (!isEmpty(stateName)) {
        stateString = '('+stateName+')';
      }
      return stateString;
    }

    getEffect(itemId) {
      return getFromStateOrObject(itemId,'effect', this.l_state.objects);
    }

    getColor(itemId) {
      return getFromStateOrObject(itemId,'color', this.l_state.objects);
    }


    getNameWithArticle (itemId, accusativ) {
      const item = this.l_state.objects[itemId];
      if (item===undefined) {
        return '';
      }
      let article = item.article;
      
      if (accusativ === true && item.article_acc != undefined) {
        article = item.article_acc;
      }

      const name = item.name; 


      if ( ! isEmpty(article)) {
        return article + ' ' + name; 
      }else {
        return name; 
      }
    }

}