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

      add_to_inventory : function(item) {
        state.inventory.push(item);
        init_inventory();
      }

}