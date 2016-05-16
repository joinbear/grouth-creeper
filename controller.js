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
			cookies = 'userid360_xml=4C635D2108502C167D1BE86576A66749; time_create='+time+'; f=n; id58=c5/njVZ3qACj4izhA+npAg==; als=0; ipcity=cd%7C%u6210%u90FD%7C0; bj58_id58s="RXVfaWo4a0g4QmU1MTE1NQ=="; sessionid=7fdd6ab6-0659-4fd5-a8f9-28503ee6a4a1; jjqp=1; myfeet_tooltip=end; bdshare_firstime=1450682830884; tj_ershoubiz=true; f=n; 58home=cd; bj58_new_session=0; bj58_init_refer="http://cd.58.com/"; bj58_new_uv=2; city=cd; 58tj_uuid=a7903e85-65cb-43fa-ab3f-dfc1d92fab5a; new_session=0; init_refer=; new_uv=2',
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
			  creeper.AnjukeObject.getHouseUrlsByStoreUrl(creeper,storeUrls,callback);

			},function (detailUrls,callback){

				//获取房源详情统计信息
			  creeper.AnjukeObject.getHouseInfoByStoreUrl(creeper,detailUrls,callback);

			},function (areaResult,callback) {
			 console.log(areaResult);
				//处理返回结果
	      dataArray.push.apply(dataArray,areaResult);
		 
	      callback(null, dataArray);

		  }],function(err,finalResult){

		  	//输出excel
		    creeper.outPutData('anjuke',finalResult);

			});
		}
	}
}
module.exports = creeperController;