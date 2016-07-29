var 
	async       = require('async'),
	anjukeModel = require('./models/anjukeModel'),
	wubaModel   = require('./models/wubaModel');
function creeperController(){
	return {
		getWuBaData : function(url){
			var 
			dataArray   = [],
			areaObject  = {},
			storeObject = {},
			time = new Date().getTime(),
			cookies = 'userid360_xml=ADC38C996E0E4967BC23904937BA9232; time_create='+time+'; f=n; bj58_id58s="dEEzVTlqU0UyM3VzODMzMQ=="; sessionid=81b1e80d-2e53-4bf3-b2c6-71cd8a16831b; id58=c5/njVdAKRofqcupF+eyAg==; ipcity=cd%7C%u6210%u90FD; myfeet_tooltip=end; als=0; bj58_new_session=0; bj58_init_refer=""; bj58_new_uv=1; city=cd; 58tj_uuid=e9063919-5ccf-48d8-9e97-31c2974f987d; new_session=0; new_uv=1; utm_source=market; spm=b-31580022738699-me-f-824.bdpz_biaoti; init_refer=',
			creeperUrl  = url + '/ershoufang/',
			creeper     = new wubaModel(url,areaObject,storeObject,cookies);
			//抓取开始
			async.waterfall([function (callback){

				//获取大区URL地址
				creeper.wuBaObject.getAreaByUrl(creeper,creeperUrl,callback);

			},function (areaUrls,callback){

				//获取小区URL地址
				creeper.wuBaObject.getStoreByAreaUrl(creeper,areaUrls,callback);

			},function (storeUrls,callback){

				//获取各个小区房源统计信息
			  creeper.wuBaObject.getHouseInfoByStoreUrl(creeper,storeUrls,callback);

			},function (areaResult,callback) {
				//处理返回结果
	      dataArray.push.apply(dataArray,areaResult);
	      callback(null, dataArray);

		  }],function(err,finalResult){
		  	console.log(finalResult);
		  	//输出excel
		    creeper.outPutData('wuba',finalResult);

			});
		},
		getAnjukeData : function(url){
			var 
			dataArray   = [],
			areaObject  = {},
			storeObject = {},
			creeperUrl  = url + '/sale/',
			creeper     = new anjukeModel(url,areaObject,storeObject);
			//抓取开始
			async.waterfall([function (callback){
				console.log("========抓取开始========");
				//获取大区URL地址
				creeper.AnjukeObject.getAreaByUrl(creeper,creeperUrl,callback);

			},function (areaUrls,callback){

				//获取小区URL地址
				creeper.AnjukeObject.getStoreByAreaUrl(creeper,areaUrls,callback);

			},function (storeUrls,callback){

				//获取各个小区房源统计信息
			  creeper.AnjukeObject.getHouseInfoByStoreUrl(creeper,storeUrls,callback);

			},function (areaResult,callback) {
				//处理返回结果
	      dataArray.push.apply(dataArray,areaResult);
	      callback(null, dataArray);

		  }],function(err,finalResult){
		  	console.log(finalResult);
		  	//输出excel
		    creeper.outPutData('anjuke',finalResult);

			});
		}
	}
}
module.exports = creeperController;