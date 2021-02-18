$(function () {
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
      cuenta(5000);
    }

    function timeout(ms) {
      return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
      });
    }

    function mostrarNotificacion() {
      let n = new Notification("Información", {
        body:
          "Se ha puesto a la venta un nuevo juego que podría interesarte.¿Click para ir?",
      });
      $(n).click(function (ev) {
        ev.preventDefault();
        //abrimos en una nueva ventana
        window.open("listado.html"); //quisieramos abrir en la misma pestaña window.open("listado.html", '_self');
      });
    }
    async function cuenta(interval) {
      await timeout(interval);
      mostrarNotificacion();
    }
  });

  //info coronavirus en 20 km
  $("#button2").click(function (e) {
    e.preventDefault();
    //creamos variables que vamos a usar repetidamente
    let $cuerpo = $("body");
    let $info = $("div#info");

    //conseguir la posición del usuario
    navigator.geolocation.getCurrentPosition((pos) => {
      sessionStorage.setItem("latitud", `${pos.coords.latitude}`); //guardamos la latitud
      sessionStorage.setItem("longitud", `${pos.coords.longitude}`); //guardamos la longitud
    });

    let latitud = sessionStorage.getItem("latitud"); // recogemos en una variable la latitud
    let longitud = sessionStorage.getItem("longitud"); // recogemos en una variable la longitud
    
    //conseguir los municipios alrededor del usuario
    async function obtenerPoblesA20Km() {
      const resp = await fetch(
        "https://api.geodatasource.com/cities?key=NNG2ELIP3MKCKNOBB2YDPOMXFXU68FJF&lat=" +
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
          let poble = item[key]; //console.log(poble) muestra listado de pueblos a 20 km en consola
        });
      });
    }
    obtenerPoblesA20Km();

    //conseguimos los datos de covid
    async function obtenerDatosCovid() {
      const resp = await fetch(
        "https://dadesobertes.gva.es/api/3/action/package_search?q=id:38e6d3ac-fd77-413e-be72-aed7fa6f13c2",
        {
          method: "GET",
          headers: { "Content-type": "application/json; charset=UTF-8" },
        }
      );
      const jsons = await resp.json();
      let resources = jsons.result.results[0].resources;
      let numero = resources.length - 1;
      let name = resources[numero].name;
      let url = resources[numero].url;
      let dia = name.slice(name.length - 10);
      sessionStorage.setItem("dia", dia);
      //otro fetch con la url de la generalitat
      await fetch(url, {
        method: "GET",
        headers: { "Content-type": "text/csv; charset=UTF-8" }, //el tipo de contenido será text/csv ya que recibimos un archivo csv
      })
        .then((csv) => csv.text())
        .then((csv) => {
          sessionStorage.setItem("datosCovid", csv);
        });
    }
    obtenerDatosCovid();
    
    //creamos las variables guardadas localmente de los resultados
    let datosCovid = sessionStorage.getItem("datosCovid");
    let fecha = sessionStorage.getItem("dia");


    //funcion de manipulación de datos csv y creación de tabla
    function datosTabla(datosCovid) {
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

    let $carga = $("<p>Cargando Datos...</p>"); //añadimos el texto a una variable
    //mensaje de cargando mediante un setTimeOut en una promesa y mostramos datos recogidos
    function tiempoCarga(ms) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve($cuerpo.append("Dia "+fecha),datosTabla(datosCovid));
        }, ms);
      });
    }
    async function mensajesAsync(tiempo) {
      $info.append($carga);
      await tiempoCarga(tiempo);
      await $info.empty($carga);
    }
    mensajesAsync(5000);
  });
});
