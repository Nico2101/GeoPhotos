// Initialize your app
var myApp = new Framework7();

// Export selectors engine
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we use fixed-through navbar we can enable dynamic navbar
    dynamicNavbar: true
});


document.addEventListener('deviceready', function () {

    $('#username').html('<p><i class="f7-icons color-green" style="font-size:14px; ">person</i>' + " " + localStorage.getItem('username') + '</p>');
    $('#usermail').html('<p><i class="f7-icons color-green" style="font-size:14px; ">email</i>' + " " + localStorage.getItem('usermail') + '</p>');

    $('#geo').bind('click', geo);
    $('#cam').bind('click', getImage);
    $('#cerrarSesion').bind('click', cerrarSesion);
    $('#cambContr').bind('click', cambiarContraseña);
    $('#cambiarContraseña').bind('click', changePass);
    $('#buscador').bind('click', buscador);
    $('#cambiarFotoPefil').bind('click', cambiarFotoPerfil);
    $('#cancelarFotoPerfil').bind('click', cerrarPopupFotoPefil);
    verficarFotoPerfil();

}, false);


function obtieneFotosPerfilUsuario() {
    console.log("Paso por aca");
    var mail = localStorage.getItem('usermail');
    if (mail.length > 0) {
        $.ajax({
            dataType: 'json',
            type: 'POST',
            data: {
                mail: mail
            },
            url: 'http://146.83.196.204:8070/npfuente/obtieneFotosPerfilUsuario.php',
            success: function (data) {
                $("#my_lista").empty();
                var arrAux = new Array();
                if (data.length > 0) {
                    for (var i = 0; i < data.length; i++) {
                        var html_elemento = "";
                        fn = "seleccionarFoto('" + data[i].path + "')"
                        html_elemento += ' <a href="#" class="item-link item-content" onClick="' + fn + '">';
                        html_elemento += '<img src="' + data[i].path + '" width="100"></a>';
                        $("#my_lista").append(html_elemento);
                    }
                } else {
                    myApp.closeModal('.popup-elegirFotoPerfil');
                    myApp.alert("Usuario no ha establecido una foto de perfil anteriormente, favor elija la opción TOMAR FOTO", "GeoPhotos");
                }

            },
            error: function (xhr, status) {

            }
        });
    }
}

function seleccionarFoto(imagen) {
    $('#fotoPerfil').attr('src', imagen);
    myApp.closeModal('.popup-elegirFotoPerfil');
    myApp.addNotification({
        title: "GeoPhotos",
        message: "Foto de Perfil cambiada exitosamente",
        hold: 3000

    });
    $("#my_lista").empty();
    actualizarBBDD(imagen);

}

function actualizarBBDD(imagen) {
    var mail = localStorage.getItem('usermail');
    if (mail.length > 0 && imagen.length > 0) {
        $.ajax({
            dataType: 'json',
            type: 'POST',
            data: {
                mail: mail,
                path: imagen
            },
            url: 'http://146.83.196.204:8070/npfuente/actualizarBBDD.php',
            success: function (data) {
                if (data.respuesta) {
                    $('#fotoPerfil').attr('src', data.path);
                }
            },
            error: function (xhr, status) {

            }
        });
    }

}
//verifica si hay foto de perfil y la coloca
function verficarFotoPerfil() {
    var mail = localStorage.getItem('usermail');
    if (mail.length > 0) {
        $.ajax({
            dataType: 'json',
            type: 'POST',
            data: {
                mail: mail
            },
            url: 'http://146.83.196.204:8070/npfuente/verificaFotoPerfil.php',
            success: function (data) {
                console.log(data.respuesta);
                if (data.respuesta) {
                    $('#fotoPerfil').attr('src', data.path);
                } else {
                    $('#fotoPerfil').attr('src', 'img/logo1.png');
                }
            },
            error: function (xhr, status) {

            }
        });
    }
}

//cambiar foto perfil

function cambiarFotoPerfil() {
    //myApp.alert("Esta funcion será implementada mas adelante", "GeoPhotos");
    var buttons1 = [
        {
            text: 'Tomar foto',
            bold: true,
            color: 'green',
            onClick: tomarFotoPefil
        },
        {
            text: 'Elegir foto',
            color: 'green',
            bold: true,
            onClick: elegirFotoPerfil
        }
    ];
    var buttons2 = [
        {
            text: 'Cancelar',
            color: 'red'
        }
    ];
    var groups = [buttons1, buttons2];
    myApp.actions(groups);

}

function tomarFotoPefil() {
    // Retrieve image file location from specified source
    navigator.camera.getPicture(uploadFotoPerfil, function (message) {
        if(CaptureError.CAPTURE_NO_MEDIA_FILES){  
        }else{
            myApp.alert("Error al tomar la fotografía", "GeoPhotos");
        }


    }, {
        quality: 25,
        destinationType: navigator.camera.DestinationType.FILE_URI,
        sourceType: navigator.camera.PictureSourceType.CAMERA,
        correctOrientation: true
    });
}

function uploadFotoPerfil(imageURI) {
    if (imageURI != '') {
        var options = new FileUploadOptions();
        options.fileKey = "file";
        options.fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
        options.mimeType = "image/jpeg";

        var params = new Object();
        params.nombre = "FOTO";

        options.params = params;
        options.chunkedMode = false;

        myApp.showPreloader('Cambiando Foto de Perfil...');

        var ft = new FileTransfer();
        ft.upload(imageURI, "http://colvin.chillan.ubiobio.cl:8070/npfuente/uploadFotoPerfil.php", win2(imageURI), fail2, options);

    } else {
        myApp.alert("No hay fotografía", "GeoPhotos");
    }
}

function win2(imageURI) {
    guardarDatosFotoPerfil(imageURI);
}

function fail2(error) {
    myApp.hidePreloader();
    myApp.addNotification({
        title: "GeoPhotos",
        message: "Se ha producido un error al cambiar la foto de perfil",
        hold: 3000

    });
}

function guardarDatosFotoPerfil(imageURI) {
    var mail = localStorage.getItem('usermail');
    var path = "http://colvin.chillan.ubiobio.cl:8070/npfuente/fotoPerfil/" + imageURI.substr(imageURI.lastIndexOf('/') + 1);

    if (mail.length > 0 && path.length > 0 && imageURI != null) {
        $.ajax({
            dataType: 'json',
            type: 'POST',
            data: {
                mail: mail,
                path: path
            },
            url: 'http://146.83.196.204:8070/npfuente/guardarDatosFotoPerfil.php',
            success: function (data) {
                //$('#fotoPerfil').html('<img src="'+localStorage.getItem('pathFotoPerfil')+'" width="50px" />');

                myApp.hidePreloader();
                $('#fotoPerfil').attr('src', imageURI);
                myApp.addNotification({
                    title: "GeoPhotos",
                    message: "Foto de Perfil cambiada exitosamente",
                    hold: 3000

                });

            },
            error: function (xhr, status) {
                myApp.addNotification({
                    title: "GeoPhotos",
                    message: "Error, no fue posible cambiar tu foto de perfil",
                    hold: 3000

                });
            }
        });
    }
}

function elegirFotoPerfil() {
    obtieneFotosPerfilUsuario();
    myApp.popup('.popup-elegirFotoPerfil');

}

function cerrarPopupFotoPefil() {
    $("#my_lista").empty();
    myApp.closeModal('.popup-elegirFotoPerfil');
}

function geo() {
    var email = localStorage.getItem('usermail');

    myApp.showPreloader('Localizando...');
    navigator.geolocation.getCurrentPosition(
        function (position) {
            $('#lat').html(position.coords.latitude);
            $('#lon').html(position.coords.longitude);
            var map = new google.maps.Map(document.getElementById('map'), {
                center: {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                },
                zoom: 14
            });

            localStorage.setItem('latitud', position.coords.latitude);
            localStorage.setItem('longitud', position.coords.longitude);

            var marker = new google.maps.Marker({
                position: {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                },
                map: map,
                title: 'Mi posición',
                animation: google.maps.Animation.DROP,
                icon: 'img/mainMarker5.png'


            });

            myApp.hidePreloader();
            navigator.vibrate(50);

            obtieneDatosFotos(map, email);

        },
        function (error) {
            myApp.alert('Se ha producido un error', 'GeoPhotos');
            myApp.hidePreloader();
            localStorage.setItem('latitud', 'empty');
            localStorage.setItem('longitud', 'empty');
        }, {
            maximumAge: 3000,
            timeout: 10000,
            enableHighAccuracy: true
        }
    );

}

function cerrarSesion() {

    myApp.confirm('¿Está seguro que desea cerrar sesión?', 'GeoPhotos', function () {
        window.location = "index.html";
    });
}

//Cerrar sesion cuando se presiona el boton "Back" previo a un mensaje de confirmacion

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    // Register the event listener
    document.addEventListener("backbutton", cerrarSesion, false);
}


function changePass() {
    var a = $('#oldPassword').val("");
    var b = $('#newPassword').val("");
    var c = $('#repeatPassword').val("");
    myApp.popup('.popup-cambiarContraseña');

}


function cambiarContraseña() {
    var email = localStorage.getItem('usermail');
    var clave = localStorage.getItem('pass');
    var contrasena = $('#oldPassword').val();
    var nuevaContrasena = $('#newPassword').val();
    var repetirContrasena = $('#repeatPassword').val();



    if (email.length > 0 && contrasena.length > 0 && nuevaContrasena.length > 0 && repetirContrasena.length > 0) {
        $.ajax({
            dataType: 'json',
            type: 'POST',
            data: {
                email: email,
                contrasenaActual: contrasena,
                contrasenaNueva: nuevaContrasena,
                repetirContrasena: repetirContrasena

            },
            url: 'http://146.83.196.204:8070/npfuente/actualizarContrasena.php',
            success: function (data, status, xhr) {

                if (clave == contrasena) {
                    if (nuevaContrasena == repetirContrasena) {

                        if (data.respuesta === true) {
                            localStorage.setItem('pass', nuevaContrasena);
                            myApp.addNotification({
                                title: "GeoPhotos",
                                message: "Contraseña actualizada correctamente",
                                hold: 3000

                            });
                            myApp.closeModal('.popup-cambiarContraseña');
                        } else {

                            myApp.alert('Datos Incorrectos', 'GeoPhotos');
                        }
                    } else {
                        myApp.alert('Las contraseñas ingresadas son distintas', 'GeoPhotos');
                    }
                } else {
                    myApp.alert('Error, la contraseña ingresada no es la que actualmente se encuentra en nuestra base de datos', 'GeoPhotos');
                }


            },
            error: function (xhr, status) {
                myApp.hidePreloader();
                myApp.alert('Datos Incorrectos', 'GeoPhotos');
            }
        });
    } else {
        myApp.alert('Debe Ingresar los datos solicitados', 'GeoPhotos');
    }



    //validar los datos ingresados

    var pass = localStorage.getItem('pass');


}

function buscador() {
    myApp.prompt('¿Qué ciudad desea localizar?', 'GeoPhotos', function (value) {
        // Obtenemos la dirección ingresada y la asignamos a una variable
        var ciudad = value;
        // Creamos el Objeto Geocoder
        var geocoder = new google.maps.Geocoder();
        // Hacemos la petición indicando la dirección e invocamos la función
        // geocodeResult enviando todo el resultado obtenido
        geocoder.geocode({
            'address': ciudad
        }, geocodeResult);

    });
}


function geocodeResult(results, status) {
    var email = localStorage.getItem('usermail');
    // Verificamos el estatus
    if (status == 'OK') {
        // Si hay resultados encontrados, centramos y repintamos el mapa
        // esto para eliminar cualquier pin antes puesto
        var mapOptions = {
            center: results[0].geometry.location,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map($("#map").get(0), mapOptions);
        // fitBounds acercará el mapa con el zoom adecuado de acuerdo a lo buscado
        map.fitBounds(results[0].geometry.viewport);
        // Dibujamos un marcador con la ubicación del primer resultado obtenido
        var markerOptions = {
            position: results[0].geometry.location,
            animation: google.maps.Animation.DROP,
            icon: 'img/mainMarker5.png'
        }
        var marker = new google.maps.Marker(markerOptions);
        marker.setMap(map);


        obtieneDatosFotos(map, email);

    } else {
        // En caso de no haber resultados o que haya ocurrido un error
        // lanzamos un mensaje con el error
        myApp.alert("Error al buscar la ciudad, Favor intentelo nuevamente. Si el error persiste contáctese con el administrador de la aplicación", "GeoPhotos");
    }
}

//funcion que será la encargada de establecer un marcador en el mapa
function setMarkersOnMap(map, latitud, longitud, foto) {

    /*=== Default standalone ===*/
    var myPhotoBrowserStandalone = myApp.photoBrowser({
        photos: foto,
        backLinkText: 'Cerrar',
        ofText: 'de',
        loop: true
    });


    var a = parseFloat(latitud);
    var b = parseFloat(longitud);


    //Marcador
    var marker1 = new google.maps.Marker({
        position: {
            lat: a,
            lng: b
        },
        scale: 10,
        animation: google.maps.Animation.DROP, //animacion cuando se posiciona el marcador
        map: map,
        title: 'Mi posición',
        icon: 'img/marker3.png'
    });

    //abre un photobrowser donde se muestran las fotos
    google.maps.event.addListener(marker1, 'click', function () {
        myPhotoBrowserStandalone.open();
    });
}



function obtieneDatosFotos(map, email) {
    var arreglo = new Array();
    var auxLat = 0;
    var auxLong = 0;
    var image = new Image();
    if (email.length > 0) {
        $.ajax({
            dataType: 'json',
            type: 'POST',
            data: {
                email: email
            },
            url: 'http://146.83.196.204:8070/npfuente/obtenerIdFoto2.php',
            success: function (data, status, xhr) {

                var i = 0;
                var j = 0;
                var k = 0;
                var a = 0;
                var b = 0;
                if (data != null) {

                    for (i = 0; i < data.length; i++) {
                        arreglo[i] = {
                            "lat": data[i].latitud,
                            "long": data[i].longitud
                        };
                    }
                } else {
                    myApp.addNotification({
                        title: "GeoPhotos",
                        message: "No hay Fotos para mostrar",
                        hold: 3000

                    });
                }
                manejarArreglo(map, arreglo);

            },
            error: function (xhr, status) {
                myApp.hidePreloader();
                myApp.alert('Datos Incorrectos', 'GeoPhotos');
            }
        });
    } else {
        myApp.alert('Debe Ingresar los datos solicitados', 'GeoPhotos');
    }


}


function getImage() {
    // Retrieve image file location from specified source
    navigator.camera.getPicture(uploadPhoto, function (message) {
        if(CaptureError.CAPTURE_NO_MEDIA_FILES){  
        }else{
            myApp.alert("Error al tomar la fotografía", "GeoPhotos");
        }
        


    }, {
        quality: 25,
        destinationType: navigator.camera.DestinationType.FILE_URI,
        sourceType: navigator.camera.PictureSourceType.CAMERA,
        correctOrientation: true
    });

}


function uploadPhoto(imageURI) {


    if (imageURI != '') {
        var options = new FileUploadOptions();
        options.fileKey = "file";
        options.fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
        options.mimeType = "image/jpeg";

        var params = new Object();
        params.nombre = "FOTO";

        options.params = params;
        options.chunkedMode = false;

        var lat = localStorage.getItem('latitud');
        var long = localStorage.getItem('longitud');
        console.log(lat);
        if (lat != 'empty' && long != 'empty') {
            myApp.showPreloader('Subiendo...');
            var ft = new FileTransfer();
            ft.upload(imageURI, "http://colvin.chillan.ubiobio.cl:8070/npfuente/uploadPhoto.php", win, fail, options);
            localStorage.setItem('path', imageURI.substr(imageURI.lastIndexOf('/') + 1));
        } else {
            myApp.hidePreloader();
            myApp.addNotification({
                title: "GeoPhotos",
                message: "Se ha producido un error al subir la imagen al servidor",
                hold: 3000

            });
        }



    } else {
        myApp.alert("No hay fotografía", "GeoPhotos");
    }
}

function win(r) {

    myApp.hidePreloader();
    myApp.addNotification({
        title: "GeoPhotos",
        message: "Imagen subida exitosamente",
        hold: 3000

    });
    guardarDatosFoto();

}

function fail(error) {
    myApp.hidePreloader();
    myApp.addNotification({
        title: "GeoPhotos",
        message: "Se ha producido un error al subir la imagen al servidor",
        hold: 3000

    });


}

function error() {

}


function guardarDatosFoto() {
    var mail = localStorage.getItem('usermail');
    var lat = localStorage.getItem('latitud');
    var long = localStorage.getItem('longitud');
    var path = "http://colvin.chillan.ubiobio.cl:8070/npfuente/fotos/" + localStorage.getItem('path');

    if (mail.length > 0 && lat != 'empty' && long != 'empty' && path.length > 0) {
        $.ajax({
            dataType: 'json',
            type: 'POST',
            data: {
                mail: mail,
                latitud: lat,
                longitud: long,
                path: path
            },
            url: 'http://146.83.196.204:8070/npfuente/guardarDatosFoto.php',
            success: function (data) {
                geo();
            },
            error: function (xhr, status) {

            }
        });
    }
}

function manejarArreglo(map, arreglo) {

    var i = 0;
    var latitud = 0;
    var longitud = 0;
    if (arreglo != null) {
        for (i = 0; i < arreglo.length; i++) {
            obtenerFotosAgrupadasServidor(map, arreglo[i].lat, arreglo[i].long);

        }

    }
}

function obtenerFotosAgrupadasServidor(map, latitud, longitud) {
    var mail = localStorage.getItem('usermail');
    if (latitud != null && longitud != null && mail != null) {
        $.ajax({
            dataType: 'json',
            type: 'POST',
            data: {
                mail: mail,
                latitud: latitud,
                longitud: longitud
            },
            url: 'http://146.83.196.204:8070/npfuente/agrupaFotosMismaPosicion.php',
            success: function (data) {
                manejaDatos(map, latitud, longitud, data);
            },
            error: function (xhr, status) {}
        });
    }

}


function manejaDatos(map, latitud, longitud, arreglo) {
    var i = 0;
    var arregloAux = new Array();

    for (i = 0; i < arreglo.length; i++) {
        arregloAux[i] = arreglo[i].fotografia;
    }

    setMarkersOnMap(map, latitud, longitud, arregloAux);

}



