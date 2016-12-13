;(function ($, window, document, undefined) {
	var pluginName = 'mcfAdvancedSearch';
	var formCache = {};
	var searchCache = {};
	var defaults = {
		mode: 'form',
		// Filtterit
		sort: [
			{
				text: 'Manual',
				val: 'search'
			}, {
				text: mcf.Lang.SortOrderNameAsc,
				val: 'name_asc'
			}, {
				text: mcf.Lang.SortOrderNameDesc,
				val: 'name_desc'
			}, {
				text: mcf.Lang.SortOrderPriceAsc,
				val: 'price_asc'
			}, {
				text: mcf.Lang.SortOrderPriceDesc,
				val: 'price_desc'
			}, {
				text: mcf.Lang.SortOrderReleasedAsc,
				val: 'released_asc'
			}, {
				text: mcf.Lang.SortOrderReleasedDesc,
				val: 'released_desc'
			}
		],
				filters: [
			{
				text: 'Laatuvanne suosittelee',
				val: 'featured'
			},{
				text: 'Ennakkotilattavat',
				val: 'preorder'
			}, {
				text: 'Varastossa',
				val: 'in_stock'
			}, {
				text: 'Tilaustuote',
				val: 'available'
			}
		]
		
	};

	function Plugin(element, options) {
		this.element = element;
		this.options = $.extend({}, defaults, options);
		this.searchTerms = [];
		this.queryObject = {};
		this._defaults = defaults;
		this._name = pluginName;
		this._hashchange = false;
		this.init();
	}

	function cacheForms(key) {
		var deferred = formCache[key];
		if (!deferred) {
			deferred = $.get(key);
			formCache[key] = deferred;
		}
		return deferred;
	}

	function parseQuery(q) {
		var queryObject = {};
		var queryArray = q.split('&');
		for (i = 0; i < queryArray.length; i++) {
			var parts = queryArray[i].split('=');
			var name = parts[0];
			if (name === 'sort') {
				queryObject[name] = parts[1];
			} 
			else {
				var ids = parts[1].match(/(\d+)/g);
				ids = _.map(ids, function(id){ return parseInt(id, 10) });
				queryObject[name] = ids;
			}
			
		}
		
		return queryObject;

	}

	function parseId(matcher, str) {
		var id = null;
		var classes = str.split(' ');
		for (i = 0; i < classes.length; i++) {
			if (classes[i].indexOf(matcher) !== -1) {
				id = classes[i].slice(matcher.length);
				break;
			}
		}
		return parseInt(id);
	}

	function loadQuery(q) {
		var plugin = this;
		var queryString = '/interface/Products?helper=helpers/listproduct-search&limit=200&' + q.substr(2);
		var $results = plugin.options.results;

		if (q.indexOf('!') === 1) {
			if (searchCache[q]) {
				$results.children().hide();
				searchCache[q].show();
			} else {
				$.get(queryString).done(function(res) {
					var $products = $('<div class="AdvancedSearchProducts" data-key="' + q.substr(2) + '"></div>');
					$products.html(res);
					$results.children().hide();
					$results.append($products);
					searchCache[q] = $products;
					// get_products gets called after the productlist has been updated
					if (typeof plugin.options.get_products === 'function') {
						plugin.options.get_products.call(plugin, $(plugin.element));
					}
				});
			}
		} else {
			$results.children().hide();
			searchCache.defaultContent.show();
		}
		
	}

	Plugin.prototype = {
		init: function() {
			var plugin = this;
			var entryHash = window.location.hash;
			var $el = $(this.element);

			if (typeof $.fn.hashchange === 'function') { plugin._hashchange = true; }

			$el.append('<div class="AdvancedSearchForm"></div>');

			if (typeof plugin.options.results === 'undefined') {
				$el.append('<div class="AdvancedSearchResults"></div>');
				plugin.options.results = $el.find('.AdvancedSearchResults');
			} else {
				plugin.options.results = (plugin.options.results instanceof jQuery) ? plugin.options.results : $(plugin.options.results);
			}

			if (entryHash.length === 0) {
				plugin.options.results.wrapInner('<div class="AdvancedSearchProducts" data-key="InitialContent-' + plugin.options.id +'" />');
				searchCache.defaultContent = plugin.options.results.find('[data-key="InitialContent-' + plugin.options.id + '"]');
			}

			if (entryHash.indexOf('!') === 1) {
				plugin.queryObject = parseQuery(entryHash.substr(2));
			}

			function buildData() {
				if (typeof plugin.options.brands !== 'undefined') {
					plugin.getBrands().done(function() {
						plugin.getCategories();
					});
				} else {
					plugin.getCategories();
				}
			}

			if (plugin._hashchange) {
				$(window).hashchange(function() {
					var hash = window.location.hash;
					if (hash !== entryHash && hash.indexOf('!') === 1) {
						plugin.queryObject = parseQuery(hash.substr(2));
						// Flush the earlier searchterms
						plugin.searchTerms = [];
						buildData();
					}
					loadQuery.call(plugin, hash);
				});
				
			} else {
				loadQuery.call(plugin, entryHash);
			}

			buildData();
			$(window).hashchange();
		},

		getCategories: function() {
			var plugin = this;
			var key = '/interface/Categories?show=all&parent=' + plugin.options.id;
			$.when(cacheForms(key)).then(function(res) {

				var $categories = $(res).children();
				if (!$categories.length) {
					return false;
				}

				$categories.each(function() {
					var $subcategories = $(this).children('ul').children();
					if (!$subcategories.length) {
						return false;
					}

					var categoryId = parseId('CategoryID-', $(this).attr('class'));
					var searchTerm = {
						id: categoryId,
						name: $(this).children('a').text(),
						values: []
					};

					$subcategories.each(function () {
						var categoryId = parseId('CategoryID-', $(this).attr('class'));
						var inQuery = -1;
						if (typeof plugin.queryObject.categories !== 'undefined') {
							inQuery = _.indexOf(plugin.queryObject.categories, categoryId);
						}
						searchTerm.values.push({
							id: categoryId,
							selected: (inQuery > -1) ? true : false,
							name: $(this).children('a').text()
						});
					});
					plugin.searchTerms.push(searchTerm);
				});

				plugin.refreshSearchForm();

				// Add new filters (ET min and ET max)
				if ($('select[name="ET"]').length > 0) {
					var $parentEtDom = $('select[name="ET"]').parent().parent();
					$parentEtDom.addClass('min_et');
					$parentEtDom.find('.label').html('Min ET');

					var $clonedEtDom = $parentEtDom.clone();
					$clonedEtDom.find('.label').html('Max ET');
					$clonedEtDom.insertAfter($parentEtDom);
					$clonedEtDom.removeClass('min_et').addClass('max_et');
					$clonedEtDom.find('.ReplacedSelect').on('change', function() {
						var textSelect = $(this).find("option:selected").text();
						$clonedEtDom.find('.sel_inner').html(textSelect);
					});


					$('.min_et select option[selected=selected]').first().prop('selected', 'selected').change();
					$('.max_et select option[selected=selected]').last().prop('selected', 'selected').change();
				}

			});

			return cacheForms(key);

		},

				getBrands: function() {
			var plugin = this;
			var key = '/interface/Brands/?sort=abc&category=' + plugin.options.id;
			$.when(cacheForms(key)).then(function(res) {

				var $brands = $(res).children();
				if (!$brands.length) {
					return false;
				}

				var searchTerm = {
					id: plugin.options.id,
					brand: true,
					name: mcf.Lang.Brands,
					values: []
				};

				$brands.each(function() {
					var brandId = parseId('BrandID-', $(this).attr('class'));
					var inQuery = -1;
					if (typeof plugin.queryObject.brand !== 'undefined') {
						inQuery = _.indexOf(plugin.queryObject.brand, brandId);
					}
					searchTerm.values.push({
						id: brandId,
						selected: (inQuery > -1) ? true : false,
						name: $(this).children('a').text()
					});
				});

				plugin.searchTerms.push(searchTerm);
			});

			return cacheForms(key);

		},
		
		refreshSearchForm: function() {
			var plugin = this;
			if (!plugin.searchTerms.length) {
				return false;
			}

			// Build the search form.
			var $form = $('<form></form>');


			for (var i = 0; i < plugin.searchTerms.length; i++) {
				var searchTerm = plugin.searchTerms[i];
				var $formItem = $('<div class="FormItem ' + searchTerm.name + '"></div>').appendTo($form);
				var itemStyle = null;

				// Differentiate brands from product categories.
				if (typeof searchTerm.brand !== 'undefined') {
					itemStyle = { type: plugin.options.brands };
					$formItem.addClass('Brands');
				} else {
					itemStyle = _.findWhere(plugin.options.style, { id: searchTerm.id });
				}

				// Kittens 1 - JavaScript 0.
				if (typeof itemStyle === 'undefined' || typeof itemStyle.type === 'boolean') {
					itemStyle = (plugin.options["mode"] === "form") ? { type: 'select' } : { type: 'checkbox' } ;
				}

				// Create the input label.
				$('<p class="label">' + searchTerm.name + '</p>').appendTo($formItem);

				// Render as a select input.
				if (itemStyle.type === 'select') {
					var $select = $('<select name="' + searchTerm.name + '"></select>').appendTo($formItem);
					$select.append('<option value="0">' + mcf.Lang.Choose + '</option>');
					for (var j = 0; j < searchTerm.values.length; j++) {
						var selected = (searchTerm.values[j].selected) ? 'selected="selected"' : '';
						$select.append('<option value="' + searchTerm.values[j].id + '" ' + selected + '>' + searchTerm.values[j].name + '</option>');
					}
				// Render as radios.
				} else if (itemStyle.type === 'radio') {
					var $checks = $('<div class="Checks"></div>').appendTo($formItem);
					for (var j = 0; j < searchTerm.values.length; j++) {
						var checked = (searchTerm.values[j].selected) ? 'checked="checked"' : '';
						$checks.append('<label><input name="' + searchTerm.name + '" value="' + searchTerm.values[j].id + '" type="radio" ' + checked + ' />' + searchTerm.values[j].name + '</label>');
					}
				// Render as checkboxes.
				} else if (itemStyle.type === 'checkbox') {
					var $checks = $('<div class="Checks"></div>').appendTo($formItem);
					for (var j = 0; j < searchTerm.values.length; j++) {
						var checked = (searchTerm.values[j].selected) ? 'checked="checked"' : '';
						$checks.append('<label><input name="' + searchTerm.name + '" value="' + searchTerm.values[j].id + '" type="checkbox" ' + checked + ' />' + searchTerm.values[j].name + '</label>');
					}
				}
			}
if (plugin.options.sort !== false) {
				var $formItem = $('<div class="FormItem SortBy"></div>').appendTo($form);
				var $label = $('<p class="label">' + mcf.Lang.SortOrderTitle + '</p>').appendTo($formItem);
				var $sortBy = $('<select name="sort"></select>').appendTo($formItem);

				for (var i = 0; i < plugin.options.sort.length; i++) {
					var sorter = plugin.options.sort[i];
					var selected = '';
					if (typeof plugin.queryObject.sort !== 'undefined') {
						selected = (plugin.queryObject.sort === sorter.val) ? ' selected="selected"' : '';
					}
					$sortBy.append('<option value="' + sorter.val + '"' + selected + '>' + sorter.text + '</option>');
				}
			}
			// Filters
			
			if (plugin.options.filters !== false) {
				var $formItem = $('<div class="FormItem Filters"></div>').appendTo($form);
				var $label = $('<p class="label">Filtterit</p>').appendTo($formItem);
				var $filterBy = $('<select name="filters"></select>').appendTo($formItem);

				for (var i = 0; i < plugin.options.filters.length; i++) {
					var filter = plugin.options.filters[i];
					var selected = '';
					if (typeof plugin.queryObject.filters !== 'undefined') {
						selected = (plugin.queryObject.filters === filter.val) ? ' selected="selected"' : '';
					}
					$filterBy.append('<option value="' + filter.val + '"' + selected + '>' + filter.text + '</option>');
				}
			}
							$('.FormItem.Hintaluokka').insertAfter('.FormItem.Kantavuusindeksi');
			var $button = $('<div class="FormItem FormSubmit"><button class="SubmitButton">Hae <span class="CategoryName">' + mcf.Lang.CategoryName + '</span></button></div>').click(function(event) {
				event.preventDefault();
				plugin.refreshSearchProducts();
				$("#SearchTips").hide();
				$("#ProductSearchProducts").append('<div id="SearchLoader"></div>');
			});

							
			$form.append($button);
			$(plugin.element).find('.AdvancedSearchForm').empty().html($form);

			// get_form gets called after the form has been updated
			if (typeof plugin.options.get_form === 'function') {
				plugin.options.get_form.call(plugin, $(this.element));
			}
							

						    var len = $(".FormItem.Brands .Checks input:checked").length;
						    if(len>0){$(".FormItem.Brands .Button").append(' (valittuna ').append('' + len + ')');}
									else{$(".FormItem .Brands .Button").append(" ");}
							
							$('.FormItem.Brands').insertAfter('.FormItem.SortBy');
							$('.FormItem.Brands p.label').after('<span class="Button">Rajaa tuotemerkeitt�in</span>');
							$('.FormItem.Brands .Button').click(function() {
								$(this).toggleClass('Active');
								$('.FormItem.Brands .Checks').slideToggle(); 
							});

		},

		refreshSearchProducts: function () {
			var plugin = this;
			var brandIds = [];
			var categoryIds = [];
			var productIds = [];
			var etIds = [];
			var tempEtIds = [];
			var $formItems = $(plugin.element).find('.FormItem:not(.SortBy)');

			$formItems.each(function() {
				var $inputs = $(this).find('select, :selected, :checked');
				var ids = [];
				$inputs.each(function() {
					var id = $(this).val();
					if (id !== '0' && id !== '') {
						ids.push(id);
					}
				});

				if ($(this).hasClass('Brands')) {
					ids = _.uniq(ids).join('|');
					brandIds = ids;
				} else if ($(this).hasClass('ET')) {
					var minEtIndex = $('.min_et select')[0].selectedIndex;
					var maxEtIndex = $('.max_et select')[0].selectedIndex;
					tempEtIds = [];

					$.each($('.min_et select option'), function(ind, el) {
						var elVal = parseInt(el.value, 10);

						if (ind <= maxEtIndex && ind >= minEtIndex && elVal != '0') {
							tempEtIds.push(el.value);
						}

						if (ind >= minEtIndex && elVal != '0' && maxEtIndex === 0) {
							tempEtIds.push(el.value);
						}
					});

					if (tempEtIds.length) {
						ids = _.uniq(tempEtIds).join('|');
						etIds.push(ids);
					}
				} else {
					if (ids.length) {
						ids = _.uniq(ids).join('or');
						categoryIds.push('(' + ids + ')');
					}
				} 
			});

			if ($('.min_et select').length > 0 && etIds.length) {
				var newIdsEt = _.uniq(etIds);
				categoryIds.push('(' + newIdsEt.join('|') + ')');
			}

			categoryIds = categoryIds.join('and');
			console.log(categoryIds);
			var queryString = '!';
			var $sort = $(plugin.element).find('.SortBy [name=sort]');
			var $filters = $(plugin.element).find('.Filters [name=filters]');

			if (categoryIds) {
				queryString += 'categories=' + categoryIds;
			} else {
				queryString += 'category=' + plugin.options.id + '&subcategories=true';
			}

			if (brandIds) {
				queryString += '&brand=' + brandIds;
			}

			if ($filters.length) {
				queryString += '&filters=' + $filters.val();
			}
			
			if ($sort.length) {
				queryString += '&sort=' + $sort.val() + '&or=Valitettavasti hakusi ei tuottanut osumia.';
			}
			
			if (plugin._hashchange) {
				window.location.hash = queryString;
			} else {
				window.location.replace("#" + queryString);
				loadQuery.call(plugin, '#' + queryString);
			}
		}
	};

	$.fn[pluginName] = function (options) {
		return this.each(function () {
			if (!$.data(this, 'plugin_' + pluginName)) {
				$.data(this, 'plugin_' + pluginName, new Plugin(this, options));
			}
		});
	};
	
	$('#Main.Wheels .AdvancedSearchProducts .SubmitButton').on('click', function() {
	console.log('Wheel search');
	});
	

})(jQuery, window, document);