// Objeto con el array de juegos cargado.
var listadoJuegos;

/**
 * Función que se ejecuta cuando el DOM se ha cargado completamente
 */
$(() => {
  $.getJSON("resources/juegos.json", function (data) {
    listadoJuegos = data;
    $(document).trigger("juegosCargados");
  });
});

/**
 * Evento que se lanza al acabar de cargar los juegos del fichero JSON
 */
$(document).on("juegosCargados", function () {
  /* seleccion de las zonas del html que deseamos */
  let $generoX = $("li").eq(0); //Genero X sobre la tabla
  let $anyoX = $("li").eq(1); //Año X sobre la tabla
  var $cerrarGenero = $("*").filter(function () {
    //boton X de genero
    var datos = $(this).data("filtro");
    return datos == "1";
  });
  var $cerrarAnyo = $("*").filter(function () {
    //boton X de año
    var datos = $(this).data("filtro");
    return datos == "2";
  });
  let $desplegable = $("select.form-select"); //select desplegable
  let $genero = $("filter.form-check"); //listado de generos
  let $anyo = $(".input-group"); //input para año

  /*Inicialmente, si el usuario no ha seleccionado ningún filtro,
    no saldrá nada debajo del desplegable.*/
  $genero.toggleClass("hide");
  $anyo.toggleClass("hide");
  /* También escondemos las opciones que se muestran al filtrar encima de la tabla*/
  $generoX.toggleClass("hide");
  $anyoX.toggleClass("hide");

  //mostrar clickar sobre desplegable
  var $guardarDesplegable = $desplegable.change(function (event) {
    event.preventDefault();

    //opcion seleccionada
    var $selectedOption = $(this).children("option:selected").val();

    /* Filtrar por Genero */
    if ($selectedOption == 1) {
      $(".form-select option:first").prop("selected", "selected");
      $genero.toggleClass("hide");
      $generoX.toggleClass("hide");
      $desplegable.find("option").eq(1).toggleClass("hide");

      //géneros obtenidos del JSON
      let html = " ";
      //Recorremos el listado de juegos
      listadoJuegos.forEach(function (item) {
        const tipoJuego = item.genero;
        //añadimos los checkbox por tantas categorias tengamos
        //item.genero busca en el json todos los resultados de genero
        html +=
          '<div class="form-check"><input class="form-check-input" type="checkbox" value="' +
          tipoJuego +
          '"><label class="form-check-label" for="' +
          tipoJuego +
          '">' +
          tipoJuego +
          "</label></div>";
      });
      // Actualizar juegos
      $genero.append(html);
    }
    /* Filtrar por Año */
    if ($selectedOption == 2) {
      $(".form-select option:first").prop("selected", "selected");
      $anyo.toggleClass("hide");
      $anyoX.toggleClass("hide");
      $desplegable.find("option").eq(2).toggleClass("hide");

      //validamos solo la opcion 4 digitos
      $("input.form-control").keypress(function (e) {
        let $contenido = $(".form-control").val();
        if (e.which == 13) {
          //comprobación de que solo sean 4 numerps
          const regexp = /^\d{4}$/.test($contenido);
          if (regexp) {
            $anyo.css("border", "none");
            $anyo.submit();
          } else {
            //si no es correcto sale un borde rojo
            return $anyo.css("border", "red solid 1px");
          }
        }
      });
    }
  });
  //escondemos la seccion filtrar por genero
  $cerrarGenero.click(function (event) {
    event.preventDefault();
    //activamos de nuevo las opciones usando toggleClass nuevamente
    $genero.toggleClass("hide");
    $generoX.toggleClass("hide");
    $desplegable.find("option").eq(1).toggleClass("hide");
  });

  //escondemos la seccion filtrar por año
  $cerrarAnyo.click(function (event) {
    event.preventDefault();
    //activamos de nuevo las opciones usando toggleClass nuevamente
    $anyo.toggleClass("hide");
    $anyoX.toggleClass("hide");
    $desplegable.find("option").eq(2).toggleClass("hide");
  });

  //guardamos en localStorage las opciones elegidas
  localStorage.setItem("opciones", $guardarDesplegable);
  let guardarOpcion = localStorage.getItem("opciones");
});
