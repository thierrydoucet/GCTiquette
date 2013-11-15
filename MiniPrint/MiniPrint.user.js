// ==UserScript==
// @name        GC Tiquette - MiniPrint
// @namespace   http://cyberchevaliers.free.fr/
// @description Exporte les données minimales de la cache (Coordonnées, Difficulté, Terrain, Taille, Hint, Spoiler)
// @include     http://www.geocaching.com/geocache/*
// @version     1.0
//
// @require     Namespace.js
// @require     DataExtractor.js
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @require     http://embeddedjavascript.googlecode.com/files/ejs_0.9_alpha_1_production.js
//
// @resource    template_print templates/print.ejs
// @resource    icon_notes icons/notes.png
// @resource    icon_delete icons/delete.png
//
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_deleteValue
// @grant       GM_getResourceURL
// @grant       GM_getResourceText 
// ==/UserScript==

//TODO i18n

this.$ = this.jQuery = jQuery.noConflict(true);

/*
 * Catégorie MODELE
 */

/**
 * Définition de l'objet contenant la liste des informations 'Mini'. Gère le
 * stockage des entrées au travers de l'api
 * GM_getValue/GM_setValue/GM_deleteValue.
 */
miniprint.miniList = {

	entries : function() {
		return JSON.parse(GM_getValue('GCTiquette-MiniPrint-entries', '[]'));
	},

	add : function(mini) {
		var found = false;
		var entries = this.entries();
		for ( var i = 0; i < entries.length; i++) {
			found = found || entries[i].code == mini.code;
		}
		if (!found) {
			entries.push(mini);
			GM_setValue('GCTiquette-MiniPrint-entries', JSON.stringify(entries));
		}
	},

	remove : function(code) {
		var entries = this.entries();
		for ( var i = 0; i < entries.length; i++) {
			if (entries[i].code == code) {
				entries.splice(i, 1);
				GM_setValue('GCTiquette-MiniPrint-entries', JSON.stringify(entries));
			}
		}
	},

	removeAll : function() {
		GM_deleteValue('GCTiquette-MiniPrint-entries');
	}
};

/**
 * Définition de la classe contenant les informations Mini
 * 
 * Ne contient pas de méthode, car La serialisation (via JSON) ne peut pas les
 * retrouver
 */
miniprint.createMiniEntry = function() {
	return new function() {
		this.code;
		this.nom;
		this.typeUrl;
		this.coordonnees;
		this.difficulteUrl;
		this.terrainUrl;
		this.tailleUrl;
		this.hint;
		this.spoilerUrls;

		// Méthodes
		// this.getDescription = function() {
		// return this.code + ' ' + this.nom;
		// };
	};
};

/*
 * Catégorie CONTROLEUR
 */

miniprint.main = function() {
	miniprint.addExportLink();
	miniprint.displayMiniEntries();
};

/**
 * Creation d'une entrée mini associée a la page actuelle
 */
miniprint.addMiniEntry = function() {
	var dataExtractor = miniprint.extractor.DataExtratorFactory.createDataExtractor();
	var entry = miniprint.createMiniEntry();

	entry.code = dataExtractor.getCode();
	entry.nom = dataExtractor.getNom();
	entry.typeUrl = dataExtractor.getTypeUrl();
	entry.coordonnees = dataExtractor.getCoordonnees();
	entry.difficulteUrl = dataExtractor.getDifficulteUrl();
	entry.terrainUrl = dataExtractor.getTerrainUrl();
	entry.tailleUrl = dataExtractor.getTailleUrl();
	entry.hint = dataExtractor.getHint();
	entry.spoilerUrls = dataExtractor.getSpoilerUrls();

	miniprint.miniList.add(entry);
	miniprint.displayMiniEntries();
};

/**
 * Retire le mini avec ce code
 */
miniprint.removeMiniEntry = function(code) {
	miniprint.miniList.remove(code);
	miniprint.displayMiniEntries();
};

miniprint.removeAllMiniEntries = function() {
	miniprint.miniList.removeAll();
	miniprint.displayMiniEntries();
};

/*
 * Catégorie VUE
 */

miniprint.addExportLink = function() {
	$('#Print dd:first').append('<a id="GCTiquette_lnkMiniAdd" href="javascript:;">Mini</a>'); // i18n
	$('#GCTiquette_lnkMiniAdd').click(miniprint.addMiniEntry);
};

miniprint.displayMiniEntries = function() {
	$('#GCTiquette_divMiniEntries').remove();
	$('#map_preview_canvas')
			.before(
					'<div id="GCTiquette_divMiniEntries" class="CacheDetailNavigationWidget NoPrint">'
							+ '<h3 class="WidgetHeader">Mini print</h3>' // i18n
							+ '<div class="WidgetBody"><ul id="GCTiquette_ulMiniEntries"></ul></div>'
							+ '<p class="NoBottomSpacing"><small><a id="GCTiquette_lnkMiniDelete" href="javascript:;"> Tout effacer</a> <a id="GCTiquette_lnkMiniPrint" href="javascript:;">Imprimer</a></small></p>' // i18n
																																																						// * 2
							+ '</div>');
	$('#GCTiquette_lnkMiniPrint').click(miniprint.printMiniEntries);
	$('#GCTiquette_lnkMiniDelete').click(miniprint.removeAllMiniEntries);

	var entries = miniprint.miniList.entries();
	for ( var i = 0; i < entries.length; i++) {
		var e = entries[i];
		$('#GCTiquette_ulMiniEntries').append('<li id="GCTiquette_li' + e.code + '">' //
				+ e.code + ' ' + e.nom //
				+ '&nbsp;<a id="GCTiquette_lnkMiniDelete' + e.code + '" href="javascript:;">X</a></li>'); // i18n
		$('#GCTiquette_lnkMiniDelete' + e.code).click({
			code : e.code
		}, function(event) {
			miniprint.removeMiniEntry(event.data.code);
		});
	}
};

miniprint.printMiniEntries = function() {
	var template = GM_getResourceText('template_print');
	var html = new EJS({
		text : template
	}).render({
		entries : miniprint.miniList.entries(),
		icons : {
			notes : GM_getResourceURL('icon_notes'),
			remove : GM_getResourceURL('icon_delete')
		}
	});
	var w = window.open();
	w.document.write(html);
	w.document.close();
};

/*
 * INITIALISATION
 */

miniprint.main();