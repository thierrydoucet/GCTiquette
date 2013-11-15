// ==UserScript==
// @name        GC Tiquette - MapLink
// @namespace   http://cyberchevaliers.free.fr/
// @description Ajoute un lien "afficher la carte" sur la page d'accueil
//
// @include     http://www.geocaching.com/
// @include     http://www.geocaching.com/#
//
// @version     1.0
//
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// ==/UserScript==

this.$ = this.jQuery = jQuery.noConflict(true);

var idDivLink = 'GCTiquette-DivMapLink';
var lblLink = 'Afficher la carte';
var htmlDivLink = '<div id="' + idDivLink + '"><a href="http://www.geocaching.com/map">' + lblLink + '</a></div>';

function addMapLink() {
    $('div.Step1Text').append(htmlDivLink);
}

function removeMapLink() {
    var divMapLink = $(idDivLink);
    if(divMapLink) {
        divMapLink.remove();
    }
}

addMapLink();