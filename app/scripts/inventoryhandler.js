var inventoryhandler = {
      in_inventory : function(item) {
        if (state.inventory.indexOf(item.toLowerCase()) != -1) {
          return true;
        }
        return false;
      },
      

      is_portable : function(item) {
        if (state.things[item] === undefined) {
          return false;
        }
        return state.things[item].portable;
      },

      get_portable_error : function(item) {
        var text = state.things[item].error_portable;
        return text;
      },

      add_to_inventory : function(item) {
        state.inventory.push(item);
        init_inventory();
      },

      remove_from_inventory : function(item) {
        state.inventory.remove(item);
        init_inventory();
      },

      find_item_id_for_name : function (name) {
        for (var i=0;i<state.inventory.length;i++) {
          item_id = state.inventory[i];
          var item = state.things[item_id];
          if (item.name.endsWith(name)) {
            return item_id;
          }
        }
        return '';
      }

};