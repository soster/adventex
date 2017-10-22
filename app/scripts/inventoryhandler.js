var inventoryhandler = {
      in_inventory : function(item_id) {
        if (state.inventory.indexOf(item_id) != -1) {
          return true;
        }
        return false;
      },
      

      is_portable : function(item_id) {
        if (state.things[item_id] === undefined) {
          return false;
        }
        return state.things[item_id].portable;
      },

      get_portable_error : function(item_id) {
        var text = state.things[item_id].error_portable;
        return text;
      },

      add_to_inventory : function(item_id) {
        state.inventory.push(item_id);
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
      },

      find_item_id_for_name_anywhere : function (name, first_misc) {
        for (var property in state.things) {
          var item = state.things[property];
          if (item.name.endsWith(name)) {
            if (isEmpty(first_misc)) {
              return property;
            } else {
              if (item.name.includes(first_misc)) {
                return property;
              }
            }
          }
        }
        return '';
      },

      get_name_definitive : function(item_id) {
        var item = state.things[item_id];
        var article = item.definite_article;
        var name = item.name;
        if (!isEmpty(article)) {
          return article + ' ' + name;
        } else {
          return name;
        }
      },

      get_name_indefinitive : function(item_id) {
        var item = state.things[item_id];
        var article = item.indefinite_article;
        var name = item.name;
        if (!isEmpty(article)) {
          return article + ' ' + name;
        } else {
          return name;
        }
      }

};