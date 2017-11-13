export default function parse_json(async_init, advntx) {
  var jsons = 0;
  const num_requests_necessary = 4;
  const parameter = '?v=' + advntx.version;

  function getJSON(url, result) {
    // new fetch api of ecma6:
    fetch(url).then(function(response) {
      return response.json();
    }).then(function(json) {
      result(json);
    });
  }

  function async_init_local() {
    advntx.vocabulary.objects = [];
    for (var property in advntx.state.objects) {
      var item = advntx.state.objects[property];
      advntx.vocabulary.objects.push(item.name);
    }
    async_init(true);
  }

  getJSON('json/vocabulary.json' + parameter,
    function (result) {
      advntx.vocabulary = result;
      jsons++;
      if (jsons == num_requests_necessary) {
        async_init_local();
      }

    });
  

  getJSON('json/messages.json' + parameter,
    function (result) {
      advntx.messages = result;
      jsons++;
      if (jsons == num_requests_necessary) {
        async_init_local();
      }
    });

  getJSON('json/gamestate.json' + parameter,
    function (result) {
      advntx.state = result;
      jsons++;
      if (jsons == num_requests_necessary) {
        async_init_local();
      }

    });

  getJSON('json/config.json' + parameter,
    function (result) {
      advntx.config = result;
      jsons++;
      if (jsons == num_requests_necessary) {
        async_init_local();
      }

    });

}