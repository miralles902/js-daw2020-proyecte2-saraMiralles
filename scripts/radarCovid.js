//           Presentacio             |
//estil | estatica |     dinamica    |    negoci
// css  | html     |pintar jquery js | js(fetch,etc.)
//pasar de negoci a dinamic en array
$(function () {
  //habilitar las notificaciones
  $('#button1').click(function (e) {
    e.preventDefault();

    let permiso = Notification.permission;
    if (permiso == 'default') {
      Notification.requestPermission().then((resp) => {
        if (resp == 'granted') {
          cuenta(5000);
        }
      });
    } else if (permiso == 'granted') {
      cuenta(5000);
    }

    function timeout(ms) {
      return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
      });
    }

    function mostrarNotificacion() {
      let n = new Notification('Información', {
        body:
          'Se ha puesto a la venta un nuevo juego que podría interesarte.¿Click para ir?',
      });
      n.addEventListener('click', (ev) => {
        window.open('../listado.html');
      });
    }
    async function cuenta(interval) {
      await timeout(interval);
      mostrarNotificacion();
    }
  });

  //info coronavirus en 20 km
  $('#button2').click(function (e) {
    e.preventDefault();

    //conseguir la posición del usuario
    navigator.geolocation.getCurrentPosition((pos) => {
      localStorage.setItem('latitud', `${pos.coords.latitude}`); //guardamos la latitud
      localStorage.setItem('longitud', `${pos.coords.longitude}`); //guardamos la longitud
    });

    var latitud = localStorage.getItem('latitud'); // recogemos en una variable la latitud
    var longitud = localStorage.getItem('longitud'); // recogemos en una variable la longitud

    //conseguir los municipios alrededor del usuario
    async function obtenerPoblesA20Km() {
      const resp = await fetch(
        'https://api.geodatasource.com/cities?key=NNG2ELIP3MKCKNOBB2YDPOMXFXU68FJF&lat=' +
          latitud +
          '&lng=' +
          longitud,
        {
          method: 'GET',
          headers: { 'Content-type': 'application/json; charset=UTF-8' },
        }
      );
      const json = await resp.json();
      json.forEach(function (item) {
        Object.keys(item).forEach(function (key) {
          key = 'city';
          const array = item[key];
          return array;
        });
      });
    }
    obtenerPoblesA20Km();

    //comparamos los datos obtenidos con los datos COVID
    async function obtenerDatosCovid() {
      const resp = await fetch(
        'https://dadesobertes.gva.es/api/3/action/package_search?q=id:38e6d3ac-fd77-413e-be72-aed7fa6f13c2',
        {
          method: 'GET',
          headers: { 'Content-type': 'application/json; charset=UTF-8' },
        }
      );
      const jsons = await resp.json();
      let resources = jsons.result.results[0].resources;
      let numero = resources.length - 1;
      let name = resources[numero].name;
      let url = resources[numero].url;
      console.log(name);
      console.log(url);
      //otro fetch con la url de la genralitat
      const respo = await fetch(url, {
        method: 'GET',
        headers: { 'Content-type': 'application/json; charset=UTF-8' }, //revisar esta parte ya que pone json y es csv
      });
      const csv = await respo;
      console.log(csv);
    }
    obtenerDatosCovid();

    let $carga = $('<p>Cargando Datos...</p>'); //añadimos el texto auna variable
    let $cargado = $('<p>latitud ' + obtenerPoblesA20Km() + '</p>'); //añadimos el texto a una variable
    //mensaje de cargando mediante un setTimeOut en una promesa
    function tiempoCarga(ms) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve($('div#info').empty($carga).append($cargado));
        }, ms);
      });
    }
    async function mensajesAsync(tiempo) {
      $('div#info').append($carga);
      const result = await tiempoCarga(tiempo);
    }
    mensajesAsync(5000);
  });
});
