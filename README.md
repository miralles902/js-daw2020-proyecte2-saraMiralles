# Segundo Proyecto de la asignatura de desarrollo web en entorno cliente

## Indice

### Carpetas
 + css
   + estilos.css (estilo para el listado de juegos de *listado.html* ).
 + img
   + background.png (fotografía para el listado de juegos de *listado.html* ).
 + resources
   + juegos.json (listado de juegos en formato json para *listado.html* ).
 + scripts
   + listado.js
   + radarCovid.js

### Archivos HTML
+ listado.html
+ index.html

## Contenido de html
+ ### index.html
  + *Contiene un html simple con dos botones y un texto (info coronavirus a 20 KM)*
    + *Boton 1* : habilita las notificaciones en el navegador, en caso de aceptar el permiso, aparece un mesaje que nos redirige a una nueva página *listado.html* (funciona en el navegador normal, usando live server de vscode)
    + *Boton 2* : habilita la geolocalización del usuario, en caso de aceptar el permiso, nos ubicará por latitud y longitud en radarCovid.js y mostrará los datos de coronavirus en 20 km alrededor nuestro (para ver esto hay que activar el modo no cors del navegador)
      + *modo no cors* : simbolo de sistema *"C:\Program Files\Google\Chrome\Application\chrome.exe" --disable-web-security --disable-gpu --user-data-dir=carpeta-a-elegir*
      + copiaremos la direccion del live server en esta nueva ventana que se abrirá
    + #### Que veremos aquí?
      + No he podido terminar de mezclar los datos de los pueblos obtenidos con los datos de la generalitat valenciana, por lo tanto al pulsar el boton 2 veremos una tabla con los datos de municipios, casos pcr de los ultimos 14 dias y incidencia por cada 100.000 habitantes de los ultimos 14 dias con un listado de todos los municipios
+ ### listado.html
  + *Contiene un desplegable para filtrar los juegos por genero y año, una tabla con el listado de juegos ordenador por genero, precio....*
    + *Desplegable* :
      + *Genero* : al filtrar por genero desaparece la opción del desplegable , aparece una nueva opcion encima de la tabla llamada "Genero X" y debajo del desplegable aparece un listado de checkbox con los generos guardados en los que podremos selecionar diferentes generos que deseemos.
      + *Año* :  al filtrar por Año desaparece la opción del desplegable , aparece una nueva opcion encima de la tabla llamada "Año X" y debajo del desplegable aparece un input de tipo texto en el que podemos introducir un año, si introducimos cualquier letra o simbolo o mas de 4 numeros al pulsar enter aparece el borde del input de color rojo, si colocamos 4 numeros de forma correcta y pulsamos enter desaparece el borde rojo.
    + *boton Genero X y Año X*: al pulsar sobre la X desaparece esta opción, desaparece la opcion mostrada de debajo del desplegable y vuelve aparecer en el desplegable la opción para poder volver a elegirla si deseamos.

## Contenido de la carpeta Scripts

+ ### listado.js
  + *Contiene una función que carga los datos de juegos.json situado en la carpeta resources, contiene una función que se ejecuta una vez cargados los juegos y el contenido de pagina*
    + *Funcion una vez cargado el contenido* : 
      + se declaran las variables con la zona del codigo html que se desea con jquery
      + a continuación se esconden las partes del codigo html que no deseamos que se vean nada mas accedemos
      + se crea una función que se ejecutará depende la opción elegida en el desplegable.
        + filtrar : Como he explicado anteriormente se mostrarán las opciones descritas en la seccion anterior (listado.html) , para ello haremos uso de las variables creadas para acceder a las zonas que deseamos del codigo html y usamos toggleClass('hide') nuevamente ya que si se ha usado antes para "desplegar" la clase css a continuación la elimina, cada vez que usemos toggleclass mostrará/eliminará la clase css. Después de mostrar lo deseado
          + genero : la seleccion de genero recorre el listado json y muestra un listado de genero dentro de checkoptions sin repeticiones.
          + año : la seleccion de año también hace una función en la que al pulsar la tecla enter si no se han introducido 4 numeros, el borde del input se vuelve rojo hasta que no volvemos a pulsar enter con 4 numeros introducidos de forma correcta.
        + también se ha programado la opción de Año X y genero X de forma que usan .toggleClass('hide'); sobre los elementos a mostrar y eleminar.
+ ### radarCovid.js
  + *Contiene una función de carga y en su interior tenemos dos funciones, una para cuando pulsamos el boton 1 y otra para cuando pulsamos el boton 2
    + *boton 1* : pide permiso al usuario para poder mostrar una notificación de navegador a un enlace, si se ha permitido muestra un mensaje y al pulsar este mensaje nos redirige a la página listado.html.
    + *boton 2* : al pulsar este boton pide permiso para localizar al usuario, si el usuario accede guarda su latitud y su longitud, la cual he guardado en un sessionStorage, también llama a las funciones abajo descritas y se ejecuta la promesa de cargando datos al iniciar el proceso, 5 segundos después se muestra la función datosTabla().
      + función obtenerPoblesA20Km() : hace un fetch al API REST de https://www.geodatasource.com/ introduciendo en la url la latitud y longitud recibidas por sessionStorage, podemos ver su funcionamiento si colocamos console.log(poble) donde se indica en un comentario, ya que no he llegadoa  realizar la función de mezclado de datos. Pero los pueblos se consiguen adecuadamente.
      + función obtenerDatosCovid() : hace dos fetch , el primero a la dirección https://dadesobertes.gva.es/api/3/action/package_search?q=id:38e6d3ac-fd77-413e-be72-aed7fa6f13c2 en el que al obtener el fetch filtramos los resultados por name y url, esta url la usaremos para nuestro segundo fetch, este devuelve un archivo csv, que he guardado en otro sessionStorage.
      + función datosTabla() : recibe el csv de la anterior funcion a través de un sessionStorage, transforma los datos del csv para poder trabajar a continuación con ellos , a continuación creamos una tabla y vamos introduciendo el contenido de las columnas que deseamos, ya que no queremos usar todos los datos recibidos del csv.
      + Promesa y async : finalmente se crea una variable para el mensaje de carga que se mostrará en pantalla debajo del boton y pasados 5 segundos, será borrado y aparecerá el dia recogido en la función obtenerDatosCovid() y la tabla creada en datosTabla(), si volvemos a pulsar el boton se mantiene la tabla anterior y aparece el mensaje de cargando datos, una vez pasados 5 segundos desaparece el mensaje de cargando datos y aparece la tabla nuevamente.
