'use strict';
var advntx = (function (my) {
  my.inventoryhandler = {
    in_inventory: function (item_id) {
      if (advntx.state.inventory.indexOf(item_id) != -1) {
        return true;
      }
      return false;
    },


    is_portable: function (item_id) {
      if (advntx.state.things[item_id] === undefined) {
        return false;
      }
      return advntx.state.things[item_id].portable;
    },

    get_portable_error: function (item_id) {
      var text = advntx.state.things[item_id].error_portable;
      return text;
    },

    add_to_inventory: function (item_id) {
      advntx.state.inventory.push(item_id);
      advntx.init_inventory();
    },

    remove_from_inventory: function (item) {
      advntx.state.inventory.remove(item);
      advntx.init_inventory();
    },

    find_item_id_for_name: function (name) {
      for (var i = 0; i < advntx.state.inventory.length; i++) {
        var item_id = advntx.state.inventory[i];
        var item = advntx.state.things[item_id];
        if (item.name.endsWith(name)) {
          return item_id;
        }
      }
      return '';
    },

    find_item_id_for_name_anywhere: function (name, first_misc) {
      for (var property in advntx.state.things) {
        var item = advntx.state.things[property];
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

    get_name_definitive: function (item_id) {
      var item = advntx.state.things[item_id];
      var article = item.definite_article;
      var name = item.name;
      if (!isEmpty(article)) {
        return article + ' ' + name;
      } else {
        return name;
      }
    },

    get_name_indefinitive: function (item_id) {
      var item = advntx.state.things[item_id];
      var article = item.indefinite_article;
      var name = item.name;
      if (!isEmpty(article)) {
        return article + ' ' + name;
      } else {
        return name;
      }
    }

  }
  return my;
}(advntx || {}))