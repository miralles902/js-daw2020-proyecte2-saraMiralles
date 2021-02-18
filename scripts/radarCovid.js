$(function () {
  //creamos variables que vamos a usar repetidamente
  let $cuerpo = $("body");
  let $info = $("div#info");
  //creamos la variable guardada localmente del resultado de sessionStorage (si no sale la fecha correctamente usar f5)
  let fecha = sessionStorage.getItem("dia");

  //habilitar las notificaciones
  $("#button1").click(function (e) {
    e.preventDefault();

    let permiso = Notification.permission;
    if (permiso == "default") {
      Notification.requestPermission().then((resp) => {
        if (resp == "granted") {
          cuenta(5000);
        }
      });
    } else if (permiso == "granted") {
      cuenta(5000); // enseña la notificacion en 5 segundos
    }

    function timeout(ms) {
      return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
      });
    }

    function mostrarNotificacion() { // texto del mensaje de notificacion
      let n = new Notification("Información", {
        body:
          "Se ha puesto a la venta un nuevo juego que podría interesarte.¿Click para ir?",
      });
      $(n).click(function (ev) {
        ev.preventDefault();
        //abrimos en una nueva ventana
        window.open("listado.html"); //si quisieramos abrir en la misma pestaña window.open("listado.html", '_self');
      });
    }
    async function cuenta(tiempoDeCarga) {
      await timeout(tiempoDeCarga);
      mostrarNotificacion();
    }
  });

  //info coronavirus en 20 km
  $("#button2").click(function (e) {
    e.preventDefault();

    //conseguir la posición del usuario
    navigator.geolocation.getCurrentPosition((pos) => {
      sessionStorage.setItem("latitud", `${pos.coords.latitude}`); //guardamos la latitud
      sessionStorage.setItem("longitud", `${pos.coords.longitude}`); //guardamos la longitud

      //llamado de funciones
      obtenerPoblesA20Km();
      obtenerDatosCovid();

      let $carga = $("<p>Cargando Datos...</p>"); //añadimos el texto a una variable
      //mensaje de cargando mediante un setTimeOut en una promesa y mostramos datos recogidos
      function tiempoCarga(ms) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve($cuerpo.append("Dia " + fecha), datosTabla()); //datos que se muestran por pantalla después de X segundos
          }, ms);
        });
      }
      async function mensajesAsync(tiempo) {
        $info.append($carga); // mensaje de carga
        await tiempoCarga(tiempo); // muestra datos nuevos
        await $info.empty($carga); //borra el mensaje de cargando
      }
      mensajesAsync(5000); // se muestra en 5 segundos
    });

    /************************* Funciones separadas del botón posteriormente las llamamos al ejecutar el boton ****************************/

    //conseguir los municipios alrededor del usuario
    async function obtenerPoblesA20Km() {
      let latitud = sessionStorage.getItem("latitud"); // recogemos en una variable la latitud
      let longitud = sessionStorage.getItem("longitud"); // recogemos en una variable la longitud

      const resp = await fetch(
        "https://api.geodatasource.com/cities?key=0XDV6HG9ZPGEYSMSCD8LOLVJYLTP7DSL&lat=" +
          latitud +
          "&lng=" +
          longitud,
        {
          method: "GET",
          headers: { "Content-type": "application/json; charset=UTF-8" },
        }
      );
      const json = await resp.json();
      json.forEach(function (item) {
        Object.keys(item).forEach(function (key) {
          key = "city";
          let poble = item[key];
          //console.log(poble); // muestra listado de pueblos a 20 km en consola (descomentar para ver)
        });
      });
    }

    //funcion donde conseguimos los datos de covid de la GVA
    async function obtenerDatosCovid() {
      const resp = await fetch(
        "https://dadesobertes.gva.es/api/3/action/package_search?q=id:38e6d3ac-fd77-413e-be72-aed7fa6f13c2",
        {
          method: "GET",
          headers: { "Content-type": "application/json; charset=UTF-8" },
        }
      );
      const json = await resp.json();
      let resources = json.result.results[0].resources; //json de resources
      let numero = resources.length - 1; //ultima posicion actual
      let name = resources[numero].name; // mostramos el name
      let url = resources[numero].url; //mostramos la url
      let dia = name.slice(name.length - 10); //conseguimos el dia de name
      sessionStorage.setItem("dia", dia); //guardamos el dia
      //otro fetch con la url de la generalitat
      await fetch(url, {
        method: "GET",
        headers: { "Content-type": "text/csv; charset=UTF-8" }, //el tipo de contenido será text/csv ya que recibimos un archivo csv
      })
        .then((csv) => csv.text())
        .then((csv) => {
          sessionStorage.setItem("datosCovid", csv); //guardamos los datos recogidos del archivo csv
        });
    }
  });

  //funcion de manipulación de datos csv y creación de tabla
  function datosTabla() {
    //creamos la variable guardada localmente del resultado de sessionStorage
    let datosCovid = sessionStorage.getItem("datosCovid");

    // columnas que imprimimos ->  1 = municipi |  4 = Casos PCR+ 14 dies | 5 = Incidència acumulada PCR+14
    let columnas = [1, 4, 5];

    let data = datosCovid
      .split("\n") //separamos las lineas
      .map((item) => item.substring(0, item.length - 1).split(";")); //recorremos con .map(), eliminamos el ";" del final de la linea item.substring(0, item.length - 1)
    //separamos con ; de forma que creamos arrays (en este caso de 8 elementos pero puede variar si se introducen mas columnas)

    let $table = $("<table></table>"); //creamos la tabla
    let $thead = $("<thead></thead>"); //creamos la cabecera de la tabla
    let $tbody = $("<tbody></tbody>"); //creamos el cuerpo de la tabla

    // Creamos las cabeceras de la tabla con datos de la primera fila
    let $tr = $("<tr></tr>");

    // Recorremos por elemento e indice
    data[0].forEach((titulo, index) => {
      // Verificamos si el indice corresponde a la columna
      if (columnas.includes(index)) {
        let $th = $("<th></th>"); //Creamos la celda del titulo
        let $tittle = $th.text(titulo); //le asignamos contenido
        $tr.append($tittle); //agregamos a la fila
      }
    });
    // Agregamos fila a cabecera
    $thead.append($tr);

    // Recorremos el resto de array para crear el cuerpo de la tabla
    for (let i = 1; i < data.length; i++) {
      let $tr = $("<tr></tr>");

      // Recorremos cada elemento para crear su respectiva celda
      data[i].forEach((texto, index) => {
        if (columnas.includes(index)) {
          let $td = $("<td></td>");
          let $texto = $td.text(texto);
          $tr.append($texto);
        }
      });
      // Agregamos fila a al tbody de la tabla
      $tbody.append($tr);
    }

    // Agregamos cabecera y cuerpo a la tabla
    $table.append($thead);
    $table.append($tbody);

    // Agregar la tabla
    $cuerpo.append($table);
  }
});
