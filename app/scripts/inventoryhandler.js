'use strict'; 
var advntx = (function (my) {
  my.inventoryhandler =  {
    in_inventory:function (item_id) {
      if (advntx.state.inventory.indexOf(item_id) != -1) {
        return true; 
      }
      return false; 
    }, 


    is_portable:function (item_id) {
      if (advntx.state.objects[item_id] === undefined) {
        return false; 
      }
      return advntx.state.objects[item_id].portable; 
    }, 

    get_portable_error:function (item_id) {
      var text = advntx.state.objects[item_id].error_portable; 
      return text; 
    }, 

    add_to_inventory:function (item_id) {
      advntx.state.inventory.push(item_id); 
      advntx.init_inventory(); 
    }, 

    remove_from_inventory:function (item) {
      advntx.state.inventory.remove(item); 
      advntx.init_inventory(); 
    },

    find_item_ids_in_inventory: function (names) {
      return advntx.find_item_ids(names, advntx.state.inventory, advntx.state.objects);
    },

    find_item_ids_for_name_anywhere: function (name) {
      var itemIds = [];
      for (var property in advntx.state.objects) {
        var item = advntx.state.objects[property];
        if (item.name.endsWith(name) && itemIds.indexOf(item.name)==-1) {
          itemIds.push(property);
        }
      }
      return itemIds;
    }, 

    get_name_definitive:function (item_id) {
      var item = advntx.state.objects[item_id]; 
      var article = item.definite_article; 
      var name = item.name; 
      if ( ! isEmpty(article)) {
        return article + ' ' + name; 
      }else {
        return name; 
      }
    },

    get_state_of_object:function(itemId) {
      var object = advntx.state.objects[itemId];
      if (object===undefined) {
        return 'none';
      }
      if (isEmpty(object.state)) {
        return 'none';
      }
      return object.state;
    },

    set_state_of_object:function(itemId,state) {
      var object = advntx.state.objects[itemId];
      if (state!='none'&&object.states[state]===undefined) {
        throw state+' is not an allowed state for '+itemId;
      }
      return object.state=state;
    },

    get_name_of_state:function(itemId, state) {
      var object = advntx.state.objects[itemId];
      if (state!='none'&&object.states[state]===undefined) {
        throw state+' is not an allowed state for '+itemId;
      }
      if (state=='none') {
        return '';
      }
      return object.states[state].name;
    },

    get_state_string:function(itemId) {
      var stateName = this.get_name_of_state(itemId, this.get_state_of_object(itemId));
      var stateString = '';
      if (!isEmpty(stateName)) {
        stateString = '('+stateName+')';
      }
      return stateString;
    },

    get_name_indefinitive:function (item_id) {
      var item = advntx.state.objects[item_id]; 
      var article = item.indefinite_article; 
      var name = item.name; 
      if ( ! isEmpty(article)) {
        return article + ' ' + name; 
      }else {
        return name; 
      }
    }

  }
  return my; 
}(advntx ||  {}))