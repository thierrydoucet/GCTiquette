/*
 * Objets relatifs à l'extration des données des pages du geocaching 
 * 
 * Effectivement, certains scripts GreaseMonkey tel que GC_Little_Helper modifient l'affichage, et donc le comportement d'extration.
 */

// extension du namespace
miniprint.extractor = {};

/**
 * Usine de création du dataExtractor concret.
 */
miniprint.extractor.DataExtratorFactory = {};
miniprint.extractor.DataExtratorFactory.createDataExtractor = function() {
	var de = miniprint.extractor.createDefaultDataExtrator();
	//surcharge si gc_little_helper est présent
	if (!$('#ctl00_ContentBody_lnkDH').is(':visible')) {
		de.isDecrypt = function() {
			return $('#div_hint').is(':visible');
		};
		return de;
	}
	return de;
};

/**
 * Extrateur de donnée par défaut.
 */
miniprint.extractor.createDefaultDataExtrator = function() {

	return new function() {
		/* Contantes de selecteurs */
		/** @const */
		var CODE_SELECTOR = '#ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode';
		/** @const */
		var NOM_SELECTOR = '#ctl00_ContentBody_CacheName';
		/** @const */
		var TYPE_URL_SELECTOR = '#cacheDetails p.cacheImage';
		/** @const */
		var COORDONNEES_SELECTOR = '#uxLatLon';
		/** @const */
		var DIFFICULTE_URL_SELECTOR = '#ctl00_ContentBody_uxLegendScale';
		/** @const */
		var TERRAIN_URL_SELECTOR = '#ctl00_ContentBody_Localize12';
		/** @const */
		var TAILLE_URL_SELECTOR = '#ctl00_ContentBody_size span.minorCacheDetails';
		/** @const */
		var HINT_SELECTOR = '#div_hint';
		/** @const */
		var SPOILERS_SELECTOR = '.CachePageImages a';

		/**
		 * Patten de détection des spoiler. Pattern rencontré : Spoiler,
		 * spoiler, Spoiler #1, Spoiler 1, s p o i l e r
		 * 
		 * @const
		 */
		var SPOILER_DETECTOR_PATTERN = /s\s*p\s*o\s*i\s*l\s*e\s*r/i;

		this.getCode = function() {
			return $(CODE_SELECTOR).text();
		};

		this.getNom = function() {
			return $(NOM_SELECTOR).text();
		};

		this.getTypeUrl = function() {
			return $(TYPE_URL_SELECTOR).find('img').prop('src');
		};

		this.getCoordonnees = function() {
			return $(COORDONNEES_SELECTOR).text();
		};

		this.getDifficulteUrl = function() {
			return $(DIFFICULTE_URL_SELECTOR).find('img').prop('src');
		};

		this.getTerrainUrl = function() {
			return $(TERRAIN_URL_SELECTOR).find('img').prop('src');
		};

		this.getTailleUrl = function() {
			return $(TAILLE_URL_SELECTOR).find('img').prop('src');
		};

		this.getHint = function() {
			var hintDiv = $(HINT_SELECTOR);
			var hint = null;
			if (hintDiv && hintDiv.text().trim().length > 0) {
				if (this.isDecrypt()) {
					hint = hintDiv.html();
				} else {
					try {
						hint = unsafeWindow.convertROTStringWithBrackets(hintDiv.html());
					} catch (e) {
						// ne devrait pas se produite, 'alert' préféré à
						// 'console.log' pour annoncer un avertissement à
						// l'utilsiateur
						alert('Erreur lors du décryptage du hint : \n' + e);
					}
				}
			}
			return hint;
		};

		this.isDecrypt = function() {
			return !($('#ctl00_ContentBody_lnkDH').attr('title') == 'Decrypt');
		};

		this.getSpoilerUrls = function() {
			var su;
			su = [];
			$(SPOILERS_SELECTOR).filter(function() {
				return SPOILER_DETECTOR_PATTERN.test($(this).text());
			}).each(function() {
				if ($(this).prop('href')) {
					su.push($(this).prop('href'));
				}
			});
			return su;
		};
	};
};
