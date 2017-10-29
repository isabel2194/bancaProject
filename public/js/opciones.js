/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
function hacerFavorita() {
	if ($("#favorite_account").hasClass("glyphicon-star-empty")) {
		$("#favorite_account").removeClass("glyphicon-star-empty");
		$("#favorite_account").addClass("glyphicon-star");
	} else {
		$("#favorite_account").removeClass("glyphicon-star");
		$("#favorite_account").addClass("glyphicon-star-empty");
	}
}

function hacerTrasferencia() {

}

function compartirCuenta(iban, principalActual) {
	if (prin) {
		$.post("/cuenta/principal/" + iban);
	}
}

$('#activaTarjeta').change(function() {
	if ($('#activaTarjeta').prop('checked')) {
		$.put('/tarjeta/' + tarjeta.numero, {
			perdida : false,
			activa : true
		});
	} else {
		$.put('/tarjeta/' + tarjeta.numero, {
			perdida : false,
			activa : false
		});
	}
});
