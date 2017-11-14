export default function parseJson(async_init, advntx) {
  const j_vocabulary = 'json/vocabulary.json';
  const j_messages = 'json/messages.json';
  const j_game = 'json/gamestate.json';
  const j_config = 'json/config.json';


  // counter for number of necessary requests:
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

  function asyncInitLocal() {
    advntx.vocabulary.objects = [];
    for (var property in advntx.state.objects) {
      var item = advntx.state.objects[property];
      advntx.vocabulary.objects.push(item.name);
    }
    async_init(true);
  }

  getJSON(j_vocabulary + parameter,
    function (result) {
      advntx.vocabulary = result;
      jsons++;
      if (jsons == num_requests_necessary) {
        asyncInitLocal();
      }

    });
  

  getJSON(j_messages + parameter,
    function (result) {
      advntx.messages = result;
      jsons++;
      if (jsons == num_requests_necessary) {
        asyncInitLocal();
      }
    });

  getJSON(j_game + parameter,
    function (result) {
      advntx.state = result;
      jsons++;
      if (jsons == num_requests_necessary) {
        asyncInitLocal();
      }

    });

  getJSON(j_config + parameter,
    function (result) {
      advntx.config = result;
      jsons++;
      if (jsons == num_requests_necessary) {
        asyncInitLocal();
      }

    });

}