/*var Tmpl = require('./index.jst.html');*/

var <%=classedName%> = function (opts) {
    opts = $.extend({
		container: ''
	},opts||{})
	this.opts = opts;
	this.$container = $(this.opts.container);
	this.init();
};
<%=classedName%>.prototype = {
	init: function(){
		var self = this;
		self._bindEvent();
	},
		
	_bindEvent: function(){
		var self = this;
	},
	destroy: function(){
		var self = this;
	}
};
module.exports = <%=classedName%>;
