var storage = window.localStorage;
var url = 'http://104.248.16.15:';
var port = '12000';
var signUpEndpoint = '/signup';
var restaurantEndpoint = '/restaurantes';

$(document).ready(function () {
    // Check if have session
    const token = storage.getItem('ot');
    if (!token) {
        alert('Sesión no iniciada');
        window.location.href = url + '/index.html';
    }

    // Get restaunrats
    const xhrRest = new XMLHttpRequest();
    xhrRest.open('GET',url + ':' + port + restaurantEndpoint, true);
    xhrRest.setRequestHeader('Content-Type', 'application/json');
    xhrRest.setRequestHeader('Authorization', 'Bearer ' + token);
    xhrRest.onload = (restaurant) => {
        if(restaurant.target.status === 403) {
            alert('No cuenta con los permisos necesarios');
            window.location.href = url + '/index.html';
        } else {
            const restaurants = JSON.parse(restaurant.target.response);
            console.log(restaurants);
            restaurants.data.forEach((restaurant) => {
                if(restaurant.name !== 'Empanaco' && restaurant.name !== 'Circolo Pizza')
                $('#resturants').append( new Option(restaurant.name, restaurant.name) );
            });
        }
    }
    xhrRest.send();

    // Check if level is manager
    $('#level').on('change', function() {
        const level = $("#level").val();
        console.log('hei')
        if(level === 'manager') {
            $('#restaurant-section').removeClass('hide');
        } else {
            $('#restaurant-section').addClass('hide');
        }
    });

    $('#sign-up-form').submit( (e) => {

        e.preventDefault();

    $('.container-login100-form-btn').hide();
    $('#loading').removeClass('hide');

        const user = $("#username-input").val();
        const name = $("#name-input").val();
        const password = $("#password-input").val();
        const rpassword = $("#rpassword-input").val();
        const level = $("#level").val();
        const restaurant = $("#resturants").val();
        let permissions;

        if (level === 'manager') {
            permissions = { level: level, restaurant: restaurant };
        } else {
            permissions = { level: level };
        }


        const token = storage.getItem('ot');

        if(user !== '' && name !== '' && password !== '') {
            if (rpassword === password) {

                const signUpData = {
                    user: user,
                    name: name,
                    password: password,
                    permissions: permissions
                };

                const xhr = new XMLHttpRequest();
                xhr.open('POST', url + ':' + port + signUpEndpoint, true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
                xhr.onload = (response) =>
                {
                    const data = JSON.parse(response.target.response);
                    console.log(data);
                    if (data.message) {
                        $('.modal-title').text('Error');
                        $('.modal-body').text(data.message);
                        $('#myModal').modal('show');
                    } else if (data.status === 200) {
                        $('.modal-title').text('Registro exitoso');
                        $('.modal-body').text('Registro completado exitosamente');
                        $('#myModal').modal('show');
                        $("#username-input").val('');
                        $("#name-input").val('');
                        $("#password-input").val('');
                        $("#rpassword-input").val('');
                    } else {
                        let message = '';
                        switch (data.response) {
                            case 'ID is duplicated!':
                                message = 'El nombre de usuario ya se encuentra registrado';
                            default:
                                message = 'Ocurrio un error inesperado';
                        }

                        $('.modal-title').text('Error');
                        $('.modal-body').text(message);
                        $('#myModal').modal('show');
                    }
                    $('.container-login100-form-btn').show();
                    $('#loading').addClass('hide');
                }
                xhr.send(JSON.stringify(signUpData));

            } else {
                $('.modal-title').text('Error');
                $('.modal-body').text('Las contraseñas no coinciden');
                $('#myModal').modal('show');
                $('.container-login100-form-btn').show();
                $('#loading').addClass('hide');
            }
        }else {
            $('.modal-title').text('Error');
            $('.modal-body').text('Todos los campos deben estar llenos');
            $('#myModal').modal('show');
            $('.container-login100-form-btn').show();
            $('#loading').addClass('hide');
        }
    });
});