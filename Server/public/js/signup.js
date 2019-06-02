var storage = window.localStorage;
var url = 'http://165.22.186.58';
var port = '12000';
var signUpEndpoint = '/signup';

$(document).ready(function () {
    // Check if have session
    const token = storage.getItem('ot');
    if (!token) {
        alert('Sesión no iniciada');
        window.location.href = "http://165.22.186.58:12000/index.html";
    }

    $('#sign-up-form').submit( (e) => {

        e.preventDefault();

    $('.container-login100-form-btn').hide();
    $('#loading').removeClass('hide');

        const user = $("#username-input").val();
        const name = $("#name-input").val();
        const password = $("#password-input").val();
        const rpassword = $("#rpassword-input").val();

        const token = storage.getItem('ot');

        if(rpassword === password) {

            const signUpData = {
                user: user,
                name: name,
                password: password
            };

            const xhr = new XMLHttpRequest();
            xhr.open('POST',url + ':' + port + signUpEndpoint, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            xhr.onload = (response) => {
                const data = JSON.parse(response.target.response);
                console.log(data);
                if (data.message) {
                    $('.modal-title').text( 'Error' );
                    $('.modal-body').text( data.message );
                    $('#myModal').modal('show');
                } else if (data.status === 200) {
                    $('.modal-title').text( 'Registro exitoso' );
                    $('.modal-body').text( 'El repartidor fue registrado exitosamente');
                    $('#myModal').modal('show');
                } else {
                    let message = '';
                    switch (data.response) {
                        case 'ID is duplicated!': message = 'El nombre de usuario ya se encuentra registrado'
                        default: message = 'Ocurrio un error inesperado';
                    }

                    $('.modal-title').text( 'Error' );
                    $('.modal-body').text( message );
                    $('#myModal').modal('show');
                }
                $('.container-login100-form-btn').show();
                $('#loading').addClass('hide');
            }
            xhr.send(JSON.stringify(signUpData));

        } else {
            $('.modal-title').text( 'Error' );
            $('.modal-body').text( 'Las contraseñas no coinciden');
            $('#myModal').modal('show');
        }
    });
});