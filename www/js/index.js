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
    $('#sub').bind('click', enviar);
    $('#registro').bind('click', registro);
    $('#cancelar').bind('click', cancelar);
    $('#reg').bind('click', verifica);
    //cerrar app cuando se presione la tecla "back" en el index


}, false);




/*function enviar() {
    var user = $('#user').val();
    var pass = $('#pass').val();

    if (user.length > 0 && pass.length > 0) {

        myApp.showPreloader('Iniciando sesión...');
        $.ajax({
            dataType: 'json',
            type: 'POST',
            data: {
                nombre: user,
                contraseña: pass
            },
            url: 'http://login-appmovilubb.rhcloud.com/',
            success: function (data, status, xhr) {
                if (data.resp === true) {
                    localStorage.setItem('mail', user);
                    localStorage.setItem('nombre', data.data.nombre);
                    myApp.hidePreloader();
                    window.location = "main.html";
                } else {
                    myApp.hidePreloader();
                    myApp.alert('Datos Incorrectos', 'GeoPhotos');
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
}*/



function enviar() {
    var email = $('#user').val();
    var contrasena = $('#pass').val();



    if (email.length > 0 && contrasena.length > 0) {

        myApp.showPreloader('Iniciando sesión...');
        $.ajax({
            dataType: 'json',
            type: 'POST',
            data: {
                email: email,
                contrasena: contrasena
            },
            url: 'http://146.83.196.204:8070/npfuente/verifica2.php',
            success: function (data, status, xhr) {

                if (data.respuesta == true) {
                    localStorage.setItem('pass', contrasena);
                    localStorage.setItem('usermail', email);
                    localStorage.setItem('username', data.nombre);
                    myApp.hidePreloader();
                    window.location = "main.html";

                } else {
                    myApp.hidePreloader();
                    myApp.alert("Datos incorrectos", "GeoPhotos");
                }

            },
            error: function () {
                myApp.alert("Error, Contáctese con el administrador de la Aplicación", "GeoPhotos");
            }

        });
    } else {
        if ($('#user').val() == "" && $('#pass').val() == "") {
            myApp.alert('Debe Ingresar su E-mail y Contraseña', 'GeoPhotos');
        } else {
            if ($('#user').val() == "") {
                myApp.alert('Debe Ingresar su E-mail', 'GeoPhotos');
            }
            if ($('#pass').val() == "") {
                myApp.alert('Debe Ingresar su contraseña', 'GeoPhotos');
            }
        }

    }
}





//funcion que abre un popup donde el usuario puede registrarse
function registro() {
    var nombre = $('#name').val("");
    var correo = $('#email').val("");
    var password = $('#contraseña').val("");
    myApp.popup('.popup-registro');

}
//funcion que cierra el popup de registro
function cancelar() {
    myApp.closeModal(".popup-registro");
}


//funcion que se encarga deenviar los datos a la bbdd

function registrar() {
    var nombre = $('#name').val();
    var correo = $('#email').val();
    var password = $('#contraseña').val();


    if (nombre.length > 0 && correo.length > 0 && password.length > 0) {
        console.log("paso");
        $.ajax({
            dataType: 'json',
            type: 'POST',
            data: {
                nombre: nombre,
                email: correo,
                contrasena: password
            },
            url: 'http://146.83.196.204:8070/npfuente/insertar2.php',

            success: function (data, status, xhr) {

                if (data.respuesta == true) {
                    myApp.addNotification({
                        title: "GeoPhotos",
                        message: "Registrado correctamente",
                        hold: 3000

                    });

                    myApp.closeModal(".popup-registro");
                } else {

                    myApp.alert("Error, el email ingresado ya se encuentra registrado en la aplicación", "GeoPhotos");
                }

            },
            error: function () {
                myApp.alert("Error, Contáctese con el administrador de la Aplicación", "GeoPhotos");
            }
        });
    }
}







//funcion verifica si se completo el formulario de registro
function verifica() {
    if ($('#name').val() != "" && $('#email').val() != "" && $('#contraseña').val() != "") {

        // Expresion regular para validar el correo
        var regex = /[\w-\.]{2,}@([\w-]{2,}\.)*([\w-]{2,}\.)[\w-]{2,4}/;

        // Se utiliza la funcion test() nativa de JavaScript
        if (regex.test($('#email').val().trim())) {
            registrar();
        } else {
            myApp.alert("El e-mail ingresado es incorrecto", "GeoPhotos");
        }
    } else {
        myApp.alert("Hay campos que no han sido completados", "GeoPhotos");
    }

}


//Cerrar la aplicacion cuando se presiona el boton "Back" previo a un mensaje de confirmacion

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    // Register the event listener
    document.addEventListener("backbutton", cerrarApp, false);
}

function cerrarApp() {
    myApp.confirm('¿Está seguro que desea cerrar la aplicación?', 'GeoPhotos', function () {
        navigator.app.exitApp();
    });
}

