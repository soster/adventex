'use strict';

import {
  findItemIds,
  getFromStateOrObject
} from 'app/scripts/helper.js'

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
      var text = this.l_state.objects[itemId].error_portable; 
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
      var itemIds = [];
      for (var property in this.l_state.objects) {
        var item = this.l_state.objects[property];
        if (item.name.endsWith(name) && itemIds.indexOf(item.name)==-1) {
          itemIds.push(property);
        }
      }
      return itemIds;
    }

    getStateOfObject(itemId) {
      var object = this.l_state.objects[itemId];
      if (object===undefined) {
        return 'none';
      }
      if (isEmpty(object.state)) {
        return 'none';
      }
      return object.state;
    }

    getNameOfState(itemId, state) {
      var object = this.l_state.objects[itemId];
      if (state!='none'&&object.states[state]===undefined) {
        throw state+' is not an allowed state for '+itemId;
      }
      if (state=='none') {
        return '';
      }
      return object.states[state].name;
    }

    getDescriptionOfState(itemId, state) {
      var object = this.l_state.objects[itemId];
      if (state!='none'&&object.states[state]===undefined) {
        throw state+' is not an allowed state for '+itemId;
      }
      if (state=='none') {
        return '';
      }
      return object.states[state].description;
    }

    getErrorOfState(itemId, state) {
      var object = this.l_state.objects[itemId];
      if (state!='none'&&object.states[state]===undefined) {
        throw state+' is not an allowed state for '+itemId;
      }
      if (state=='none') {
        return '';
      }
      return object.states[state].error;
    }

    hasState(itemId, state) {
      var object = this.l_state.objects[itemId];
      if (state!='none'&&(object.states===undefined||object.states[state]===undefined)) {
        return false;
      }
      return true;
    }

    setState(itemId, state) {
      var object = this.l_state.objects[itemId];
      if (this.hasState(itemId, state)) {
        object.state = state;
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

    getStateString(itemId) {
      var stateName = this.getNameOfState(itemId, this.getStateOfObject(itemId));
      var stateString = '';
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

    getNameIndefinitive (itemId) {
      var item = this.l_state.objects[itemId];
      if (item===undefined) {
        return '';
      }
      var article = item.indefinite_article; 
      var name = item.name; 
      if ( ! isEmpty(article)) {
        return article + ' ' + name; 
      }else {
        return name; 
      }
    }

    getNameDefinitive (itemId) {
      var item = this.l_state.objects[itemId];
      if (item===undefined) {
        return '';
      }
      var article = item.definite_article; 
      var name = item.name; 
      if ( ! isEmpty(article)) {
        return article + ' ' + name; 
      }else {
        return name; 
      }
    }

}