/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
function hacerFavorita(){
    if($("#favorite_account").hasClass("glyphicon-star-empty")){
        $("#favorite_account").removeClass("glyphicon-star-empty");
        $("#favorite_account").addClass("glyphicon-star");
    }else{
        $("#favorite_account").removeClass("glyphicon-star");
        $("#favorite_account").addClass("glyphicon-star-empty");
    }
}


