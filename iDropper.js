(function($) {

	/**
	 * Color math and other utility functions
	 */
	var

	RgbFromHCM = function(hue, chroma, match) {
		var rgb, hp = hue/60, x = chroma*(1 - Math.abs(hp%2 - 1));
		if(hp < 1) rgb = [chroma,x,0];
		else if(hp < 2) rgb = [x,chroma,0];
		else if(hp < 3) rgb = [0,chroma,x];
		else if(hp < 4) rgb = [0,x,chroma];
		else if(hp < 5) rgb = [x,0,chroma];
		else if(hp < 6) rgb = [chroma,0,x];
		return [parseInt(255*(rgb[0]+match),10), parseInt(255*(rgb[1]+match),10), parseInt(255*(rgb[2]+match),10)];
	},
	HslToRgb = function(hsl) {
		var h = hsl[0], s = hsl[1], l = hsl[2],
			c = (1 - Math.abs(2*l - 1))*s,
			m = l - 0.5*c, rgb = [];
		return RgbFromHCM(h,c,m);
	},
	HsvToRgb = function(hsv) {
		var h = hsv[0], s = hsv[1], v = hsv[2],
			c = v*s, m = v - c, rgb = [];
		return RgbFromHCM(h,c,m);
	},
	RgbToHex = function(rgb) {
		var hex = [], bit;
		if(rgb[3] === 0) return 'transparent';
		for(var i = 0; i < 3; i++) {
			bit = (rgb[i] - 0).toString(16);
			hex.push(bit.length == 1 ? ('0' + bit) : bit);
		}
		return '#' + hex.join('');
	},
	HexToRgb = function(hex) {
		hex = hex.replace(/#/g,'');

		if(hex.length !== 6) return false;

		var
		r = parseInt(hex.substr(0,2), 16);
		g = parseInt(hex.substr(2,2), 16);
		b = parseInt(hex.substr(4,2), 16);
		return [r,g,b];
	},
	RgbToHsl = function(rgb) {
		var r = rgb[0]/255,
			g = rgb[1]/255,
			b = rgb[2]/255,
			max = Math.max(r, g, b),
			min = Math.min(r, g, b),
			d, h, s, l = (max + min) / 2;

		if(max === min){
			h = s = 0;
		} else {
			d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch(max){
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}
			h *= 60;
		}
		return [h,s,l];
	},
	RgbToHsv = function(rgb){
		var r = rgb[0]/255,
			g = rgb[1]/255,
			b = rgb[2]/255,
			max = Math.max(r, g, b),
			min = Math.min(r, g, b),
			h, s, v = max,
			d = max - min;

		s = max === 0 ? 0 : d / max;

		if(max === min){
			h = 0;
		} else {
			switch(max){
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}
			h *= 60;
		}
		return [h, s, v];
	},

	HexToHsl = function(hex) { return RgbToHsl(HexToRgb(hex)); },
	HslToHex = function(hsl) { return RgbToHex(HslToRgb(hsl)); },

	HexToHsv = function(hex) { return RgbToHsv(HexToRgb(hex)); },
	HsvToHex = function(hsv) { return RgbToHex(HsvToRgb(hsv)); },


	/**
	 * Forces the number to be within a range. Format is [lower, upper)
	 * @param 		n 			Number to force within range
	 * @param 		lower 		Number lower range
	 * @param 		upper 		Number upper range
	 * @param 		wrap 		Boolean optional, determines if number should wrap around
	 */
	wrapInRange = function(n, lower, upper, wrap) {
		if(lower > upper) { var tmp = lower; lower = upper; upper = tmp; }

		if(wrap) {
			var d = upper - lower;		// normalize
			n = (n-lower)%d;

			if(n < 0) n += d;
			else if(n > d) n -= d;
			n += lower;
		} else {
			if(n < 0) n = lower;
			else if(n > upper) n = upper;
		}
		return n;
	},

	/**
	 * Performs color math on the given hex. If changes.wrap is set, will wrap lightness && saturation
	 * @param 		hex 		String representing the color to change
	 * @param 		changes 	Object where hash is either 'h', 's', or 'l' with amt value
	 */
	changeColor = function(hex, changes) {
		if(typeof changes !== 'object') return null;

		var hsl = HexToHsl(hex);
		if(typeof changes.h === 'number') {
			hsl[0] = wrapInRange(hsl[0] + changes.h, 0, 360, true);
		}
		if(typeof changes.s === 'number') {
			hsl[1] = wrapInRange(hsl[1] + changes.s, 0, 1, changes.wrap || changes.swrap);
		}
		if(typeof changes.l === 'number') {
			hsl[2] = wrapInRange(hsl[2] + changes.l, 0, 1, changes.wrap || changes.lwrap);
		}
		return HslToHex(hsl);
	},

	lighten = function(hex, amt) { return changeColor(hex, {'l': amt}); },
	darken = function(hex, amt) { return lighten(hex, -amt); },
	saturate = function(hex, amt) { return changeColor(hex, {'s': amt}); },
	desaturate = function(hex, amt) { return saturate(hex, -amt); },
	changeHue = function(hex, deg) { return changeColor(hex, {'h': deg}); },
	complement = function(hex) { return changeColor(hex, {'h': 180}); };


	/**
	 * Utilities and stuff
	 */
	$.iDropper = {
		lighten: lighten,
		darken: darken,
		saturate: saturate,
		desaturate: desaturate,
		changeHue: changeHue,
		complement: complement,
		changeColor: changeColor
	};





	/**
	 * Mouse up and move events (drag and dragend) are attached only once on the body
	 */
	var $body = $('body');
	var activeDropper = null;
	var iDfn = {
		preventGhost: function() { return false; }, // Stops bubbling, prevents dragging image ghost
		mouseup: function() { activeDropper = null; },
		mousemove: function(e) {
			if(activeDropper){
				activeDropper.trigger('mousedrag', e);
				return false;
			}
		}
	};
	$body.bind('mousemove.iDfn', iDfn['mousemove']);
	$body.bind('mouseup.iDfn', iDfn['mouseup']);
	$body.delegate('img.iD-pick', 'mousedown', iDfn['preventGhost']);




	/**
	 * Figuring out image path
	 * In order to support setting colorpicker dimension without relying on CSS3 (background-size) or Canvas to draw the picker model,
	 * we must represent with an image and resize it accordingly. The only way to reliably predict the path of the image to set on the
	 * src attribute (and also to keep a formal layer separation), the image is set as the background of a class in the CSS, we can
	 * then pull the image path by reading the background-image css attribute on that class.
	 */
	var $imgPathEl = $('<div/>').appendTo($body),
		URL = {
			SATVAL: $imgPathEl.attr('class','iD-img-sv').css('background-image').replace(/"/g,"").replace(/url\(|\)$/ig, ""),
			HUEBAR: $imgPathEl.attr('class','iD-img-huebar').css('background-image').replace(/"/g,"").replace(/url\(|\)$/ig, ""),
			HUERING: $imgPathEl.attr('class','iD-img-huering').css('background-image').replace(/"/g,"").replace(/url\(|\)$/ig, "")
		};
		$imgPathEl.remove();

	
	/**
	 * Global dimension setup
	 */
	var fullSize = 256,											// original width of the saturation-value map
		fullRSize = 482,										// full ring size, original width of hue ring
		ringHalf = 50/2,										// Hue ring's (outter_radius - inner_radius)/2
		indicatorPercent = (fullRSize/2-ringHalf)/fullRSize,	// percent of hue ring's width from center point where indicator sits
		radiansToDegrees = 360/(2*Math.PI),

		IE = /MSIE (\d+\.\d+);/.test(navigator.userAgent) ? parseFloat(RegExp.$1) : NaN,
		IE6 = IE === 6,
		keysToAccept = [8, 37,38,39,40, 48,49,50,51,52,53,54,55,56,57,65,66,67,68,69,70, 86];



	/**
	 * Color Picker Class
	 * 
	 * Possible option settings:
	 * @param 	size 		Integer pixel of the width/height of the square hue/value box
	 * @param 	onChange 	Function that's triggered when the color selection changes
	 * @param 	type 		String indicates which type of layout to use. Either 'bar' or 'ring'. Default 'bar'
	 */
	 var IDropper = function(opts) {

	 	
	 	var self = this;
	 	this.hooks = {};


		var size = opts.size || fullSize,								// width-height of square saturation-value container
			ringSize = fullRSize*size/fullSize,							// hue ring is proportional to size input
			ringRadius = ringSize/2,									// allows for normalizing axis later
			hypotenuse = ringSize*indicatorPercent,						// hue ring's indicator radius

			activeHSV = [0,1,1],										// current color of picker
			layout = opts.layout === 'ring' ? 'ring' : 'bar',			// layout is either bar or ring
			dragInfo = { type: '', tx: 0, ty: 0 };						// indicates either hue or sv dragging



		/**
		 * Element Reference, tabbed in tree heirarchy
		 */
		var $el = opts.$el,
			$iD = $('<div/>').addClass('iD iD-layout-'+layout).appendTo($el),
				$svContainer = $('<div/>').addClass('iD-sv-container').appendTo($iD),
					$svImg = $('<img/>').addClass('iD-img').attr('src',URL.SATVAL).appendTo($svContainer),
					$colorIndicator = $('<div/>').addClass('iD-indicator-color').appendTo($svContainer),
					$colorCover = $('<div/>').addClass('iD-cover-color iD-pick iD-sv-pick').appendTo($svContainer),
				$hueContainer = $('<div/>').addClass('iD-hue-container').appendTo($iD),
					$hueImg = $('<img/>').addClass('iD-img').attr('src',(layout === 'ring' ? URL.HUERING : URL.HUEBAR)).appendTo($hueContainer),
					$hueIndicator = $('<div/>').addClass('iD-indicator-hue').appendTo($hueContainer),
					$hueCover = $('<div/>').addClass('iD-cover-hue iD-pick iD-hue-pick').appendTo($hueContainer),
				$preview = $('<div/>').addClass('iD-preview').appendTo($iD),
				$inputContainer = $('<div/>').addClass('iD-input-container').appendTo($iD),
					$input = $('<input/>').addClass("iD-input-field").attr("type", "text").appendTo($inputContainer);


		/**
		 * Functions
		 */
		var fn = {
			isValidHex: function(hex) { return typeof hex === "string" && hex.match(/^#?[0-9a-fA-F]{6}$/i); },
			setColor: function(hex, disableInputUpdate) {
				if(fn.isValidHex(hex)) {

					var hsv = HexToHsv(hex);
					activeHSV = hsv;

					if(layout === 'ring') fn.huedrag({theta: (270-hsv[0])/radiansToDegrees});
					else fn.huedrag({y: size - size*hsv[0]/360});

					fn.svdrag({x: size*hsv[1], y: size*(1-hsv[2])});
					fn.setPreview(hex, disableInputUpdate);
				}
			},
			setFlag: function(e, type) {
				var tOffset = e.manual ? e : $(e.target).offset();
				activeDropper = self;
				dragInfo = { type: type, tx: tOffset.left, ty: tOffset.top };
			},
			setSVFlag: function(e) { fn.setFlag(e,'sv'); fn.mousedrag(e); },
			setHueFlag: function(e) { fn.setFlag(e,'hue'); fn.mousedrag(e); },

			mousedrag: function(e) {
				var m = { x : e.clientX - dragInfo.tx, y : e.clientY - dragInfo.ty };

				if(m.x<0) m.x=0;

				if(dragInfo.type === 'hue') self.trigger('huedrag', m);
				else if(dragInfo.type === 'sv') self.trigger('svdrag', m);
				fn.setPreview();
			},
			huedrag: function(m) {
				if(m.y < 0) m.y = 0;

				if(layout === 'ring') {
					var x, y, t, d;

					if(m.theta) {
						t = m.theta;
					} else {
						if(m.y > ringSize) m.y = ringSize;

						x = m.x - ringRadius;
						y = m.y - ringRadius;

						if(x === 0) x = 0.00000001;
						if(y === 0) y = 0.00000001;

						t = Math.atan(y/x);
						d = 90 - t*radiansToDegrees;

						if((x>0 && y>0) || (x>0 && y < 0)) d+= 180;
						activeHSV[0] = parseInt(d - 1, 10);
					}

					x = parseInt(hypotenuse*Math.cos(t) + ringRadius, 10);
					y = parseInt(hypotenuse*Math.sin(t) + ringRadius, 10);

					if(m.x < ringRadius) {
						x = ringSize-x;
						y = ringSize-y;
					}

					$hueIndicator.css({ top: y, left: x });
				} else if(layout === 'bar') {
					if(m.y > size) m.y = size-1;
					activeHSV[0] = parseInt(360*(1 - m.y/size), 10) - 1;
					$hueIndicator.css({ top: m.y });
				}
				$svContainer.css('background-color', fn.getHex([activeHSV[0], 1, 1]));
			},
			svdrag: function(m) {
				if(m.x < 0) m.x = 0;
				if(m.y < 0) m.y = 0;
				if(m.x > size) m.x = size;
				if(m.y > size) m.y = size;

				$colorIndicator.css({ left: m.x-3, top: m.y-3 });
				activeHSV[1] = m.x/size;
				activeHSV[2] = 1-m.y/size;
			},

			inputKeydown: function(e) {
				if(keysToAccept.indexOf(e.keyCode) === -1) return false;
			},
			inputKeyup: function(e) {
				fn.setColor($input.val(), true);
				return false;
			},

			getHex: function(hsv) {
				if(!hsv) hsv = activeHSV;
				return RgbToHex(HsvToRgb(hsv));
			},
			setPreview: function(hex, setPreview) {
				if(!hex) hex = fn.getHex();
				if(fn.isValidHex(hex)) {
					if(hex[0] !== "#") hex = "#"+hex;
					$preview.css('background-color', hex)
					if(!setPreview) $input.val(hex);
					self.trigger('change', hex, opts.$el);
				}
			}
		};

		/**
		 * Event binding and delegation
		 */
		var events = [
			['.iD-hue-pick', 'mousedown', 'setHueFlag'],
			['.iD-sv-pick', 'mousedown', 'setSVFlag'],
			['.iD-input-field', 'keyup', 'inputKeyup'],
			['.iD-input-field', 'keydown', 'inputKeydown']
		];
		for(var i=0; i<events.length; i++) $el.delegate(events[i][0], events[i][1], fn[events[i][2]]);
		this.bind('mousedrag', fn['mousedrag']);
		this.bind('huedrag', fn['huedrag']);
		this.bind('svdrag', fn['svdrag']);
		this.bind('change', opts.onChange);

		this.set = fn.setColor;


		/**
		 * Final initializing and such
		 */
		var hueWidth = parseInt(size/13,10);
		if(typeof opts.size === 'number') {
			$svContainer.css({ width: size, height: size });

			if(layout === 'ring') {
				$iD.css({ width: ringSize, height: ringSize });
				$hueContainer.css({ width: ringSize, height: ringSize });
			} else {
				$hueContainer.css({ width: hueWidth, height: size });
			}
		}

		if(layout === 'ring') {
			$iD.prepend($hueContainer)
				//.css({ width: ringSize, height: ringSize });
		} else {
			//$iD.css({ width: size + hueWidth + 12, height: size + hueWidth + 12 });
		}
		
		if(IE6) {
			if(layout === 'ring') {
				$('<span/>').addClass('iD-ie6huefix iD-pick iD-hue-pick').appendTo($hueContainer).height(ringSize);
				$hueImg.remove();
			}
			$('<span/>').addClass('iD-ie6svfix iD-pick iD-sv-pick').appendTo($svContainer).height(size);
			$svImg.remove();
		}
		
		opts.default = opts.default || '#ff0000';
		fn.setColor(opts.default);

	};
	IDropper.prototype.bind = function(event, fn) {
		if(typeof fn !== 'function') return false;
		if(!this.hooks[event]) this.hooks[event] = [];
		this.hooks[event].push(fn);
	};
	IDropper.prototype.trigger = function(event, param, context) {
		var fns = this.hooks[event];
		if(!fns) return false;
		for(var i=0; i<fns.length; i++) {
			if(context) {
				fns[i].call(context,param);
			} else {
				fns[i](param);
			}
		}
	};

	$.fn.iDropper = function(opts) {
		var $els = this;
		return $els.each(function(i){
			var $el = $els.eq(i), settings = { $el: $el };

			$.extend(settings, opts);
			$el.data('iDropper', new IDropper(settings));
		});
	};

})(jQuery);