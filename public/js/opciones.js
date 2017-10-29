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

function noHacerTransferencia(){
	$("#myModal").removeClass("show");
	$("#myModal").addClass("fade");
}

function hacerTransferencia() {
	$("#myModal").removeClass("fade");
	$("#myModal").addClass("show");
}

function mostrarCompartirCuenta() {
	$("#myModalCompartir").removeClass("fade");
	$("#myModalCompartir").addClass("show");
}

function noCompartirCuenta() {
	$("#myModalCompartir").removeClass("show");
	$("#myModalCompartir").addClass("fade");
}

function eliminarTarjeta(numero){
	console.log("eliminar");
	$.delete('/tarjeta/' + tarjeta.numero, {});
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
