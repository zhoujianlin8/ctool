var Util = require('../../c/util/index');
/*var Tmpl = require('./index.jst.html');*/
var <%=classedName%> = function ($route,config) {
    this.$route = $route;
    this.config = config;
	  this.init();
};
<%=classedName%>.prototype = {
	init: function(){
		var self = this;
		self._view();
		self._bindEvent();
	},
	_bindEvent: function(){
		var self = this;
	},
	_view: function(){
    var self = this;
   /* Util.getMtopData({},function (data) {
        self.$route.html(Tmpl({data: data || {}}));
    });*/
  },
	destroy	: function(){
    var self = this;
  }

};
module.exports = <%=classedName%>;