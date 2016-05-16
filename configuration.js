var conf = {
  // ruta de la api
  path         : '/api/*',
  // ip del destino
  hostname     : '155.155.155.155',
  // puerto del destino
  port         : 8443,
  // ruta del contenido estatico, null si no hay
  staticContent: null,
  // puerto de escucha de NodeJS
  serverPort   : 3000
};

module.exports = conf;
