// App Vars
var storage = window.localStorage;
var url = 'http://104.248.16.15';
var port = '12000';
var loginEndpoint = '/login';
var redirectUrl = './SignUp.html'; /** CAMBIA ESTA :D*/

$(document).ready(function () {

    $('#login-form').submit((e) => {

        e.preventDefault();

        $('.container-login100-form-btn').hide();
        $('#loading').removeClass('hide');

        const user = $("#username-input").val();
        const password = $("#password-input").val();

        $.post(url + ':' + port + loginEndpoint, {
            user: user,
            password: password
        }).done((response) => {
            const { token, status } = response;
            if (token && status === '200') {
                storage.setItem('ot', token);
                window.location.href = redirectUrl;
            } else {
                $('#myModal').modal('show');
            }
            $('.container-login100-form-btn').show();
            $('#loading').addClass('hide');
        });
    });
});
