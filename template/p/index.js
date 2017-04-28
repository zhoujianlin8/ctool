var $body = $('body');
var Tmpl = require('./index.jst.html');
var Util =  require('../../c/util/index'); 
var app = {
	init: function () {
		this.getData();
	    this.bindEvent();
	},
	getData: function(){
	  var self = this;
	 /* Util.getMtopData({api: 'index',data: {}},function(res){
	    var data = res && res.data && res.data.result ? res.data.result : {};
	    $body.append(Tmpl({data: data}));
	  },function(){

	  })*/
	},
	bindEvent: function(){
	  var self = this;

	}
}
 app.init();