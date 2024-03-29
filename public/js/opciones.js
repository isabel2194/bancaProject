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

function validarPersonal(){
	var nombre = document.getElementById("nombre");
	var apellidos = document.getElementById("apellidos");
	var pais = document.getElementById("pais");

	return nombre.checkValidity() && apellidos.checkValidity() && pais.checkValidity();
}

function validarEmpresa(){
	var nombreEmpresa = document.getElementById("nombreEmpresa");
	var puesto = document.getElementById("puesto");
	var paisEmpresa = document.getElementById("paisEmpresa");

	return nombreEmpresa.checkValidity() && puesto.checkValidity() && paisEmpresa.checkValidity();
}

function validarContacto(){
	var telefono = document.getElementById("telefono");
	var timepicker = document.getElementById("timepicker");
	var datepicker = document.getElementById("datepicker");

	return telefono.checkValidity() && timepicker.checkValidity() && datepicker.checkValidity();
}

function enviarFormulario(){
	if(validarContacto()){
		alert("Formulario enviado correctamente");
		window.location.href = "/index";
	}
}

function mostrarEmpresa(){
	if(validarPersonal()){
		var select = $( "#tipoInversion" ).val();
		if(select == "particular"){
			$("#informacionInversion").attr("hidden", false);
	
			$("#inversion").removeClass("btn-default");
			$("#inversion").addClass("btn-primary");
		}
		else{
			$("#informacionEmpresa").attr("hidden", false);
		}
	
		
		$("#informacionPersonal").attr("hidden", true);
	
		$("#empresa").removeClass("btn-default");
		$("#empresa").addClass("btn-primary");
	}	
}

function mostrarInversion(){
	if(validarEmpresa()){
		$("#informacionEmpresa").attr("hidden", true);
		$("#informacionInversion").attr("hidden", false);
	
		$("#inversion").removeClass("btn-default");
		$("#inversion").addClass("btn-primary");
	}
}

function volverEmpresa(){
	var select = $( "#tipoInversion" ).val();
	if(select == "particular"){
		$("#informacionPersonal").attr("hidden", false);
		$("#empresa").removeClass("btn-primary");
	}
	else{
		$("#informacionEmpresa").attr("hidden", false);
	}

	$("#informacionInversion").attr("hidden", true);
	$("#inversion").removeClass("btn-primary");
}

function volverPersonal(){
	$("#informacionEmpresa").attr("hidden", true);
	$("#informacionPersonal").attr("hidden", false);

	$("#empresa").removeClass("btn-primary");
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
