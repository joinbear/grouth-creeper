var 
	superagent = require('superagent'),
	cheerio    = require('cheerio'),
	urlUtil    = require('url'),
	Entities   = require('html-entities').XmlEntities,
	entities   = new Entities(),
	xlsx       = require('node-xlsx'),
	async      = require('async'),
	creeper    = require('./creeperModel'),
	fs         = require('fs-extra');
/**
 * [getAnjukeAreaUrls   解析页面获取58同城的二手房大区url地址]
 * @param  {[type]}   website  [待解析的网页]
 * @param  {Function} callback [回调函数，返回解析得到的大区url集合]
 * @return {[type]}            [description]
 */
creeper.prototype.getAnjukeAreaUrls = function(website,callback){
	var 
		$        = cheerio.load(website),
		areaUrls = [],
		that     = this,//处理this的指向问题
		// reg   = /jinjiang|wuhou|chenghua|jinniu|qingyang|gaoxin/;
		reg   = /wuhou/;
		//reg      = /jinniu|gaoxin/;
		//reg   = /shuangliu/;

	// 获取首页区域的链接
  $('#content .elems-l a').each(function (idx, element) {
		var 
		$element = $(element),
		areaUrl  = $element.attr('href'),
		areaName = areaUrl.replace(that.creeperUrl + 'sale/','').replace('/',''),
		areaTxt  = entities.decode($element.html());
		
		//获取指定大区的url地址和名称
    if(areaUrl.match(reg)){
      areaUrls.push(areaUrl);
      that.areaObject[areaName] = areaTxt;
    }

  });
	callback(null,areaUrls);
};
/**
 * [getAnjukeStoreUrls 解析页面获取获取58同城的门店的url集合]
 * @param  {[type]}   website  [待解析页面]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
creeper.prototype.getAnjukeStoreUrls = function(website,callback){
	var $ = cheerio.load(website),storeUrls = [],that = this;
  $('#content .elems-l .sub-items a').each(function (idx, element) {
    var 
			$element  = $(element),
			storeUrl  = $element.attr('href'),
			storeTxt  = entities.decode($element.html()),
			storeName = storeUrl.replace(that.creeperUrl + 'sale/','').replace('/','');

      storeUrls.push(storeUrl);
      that.storeObject[storeName] = storeTxt;
  });
  callback(null, storeUrls);
};
/**
 * [getHouseUrlsByStoreUrl description]
 * @param  {[type]}   storeUrl [description]
 * @param  {[type]}   website  [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
creeper.prototype.getHouseUrlsByStoreUrl = function(storeUrl,website,callback){
	var $ = cheerio.load(website),detailUrls = [],that = this;
  $('#house-list .house-title a').each(function (idx, element) {
    var 
			$element  = $(element),
			storeUrl  = $element.attr('href');
			// if(idx < 25){
				detailUrls.push(storeUrl);
			// }
  });
  callback(null, detailUrls);
};
/**
 * [getAnjukeHouseInfo description]
 * @param  {[type]}   detailUrl [description]
 * @param  {[type]}   website  [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
creeper.prototype.getAnjukeHouseInfo = function(detailUrl,website,callback){
	var 
		$          = cheerio.load(website),
		resultObj  = {},
		companyStr,
		replaceStr = this.creeperUrl + 'sale/',
		areaDom    = $('#content .p_crumbs').find('a'),
		areaName   = areaDom.eq(areaDom.length - 2).attr('href'),
		storeName  = areaDom.eq(areaDom.length - 1).attr('href');
		if(areaName){
			areaName = areaName.replace(replaceStr,'').replace('/','');
		}
		if(storeName){
			storeName = storeName.replace(replaceStr,'').replace('/','');
		}
  //输出抓取网页内容
  //this.writePage(storeName,website);
  companyStr = $('#content').find('.comp_info').children().first().html();
  if(companyStr){
    resultObj.company = entities.decode(companyStr);
  }
  resultObj.areaName = areaName;
  resultObj.storeName = storeName;
  callback(null,resultObj);
};
creeper.prototype.AnjukeObject = {
	buildData:function (data,keyName){
		/**
		 * [isExistElement 判断一个元素是否在数组中]
		 * @param  {[type]}  _array   []
		 * @param  {[type]}  _element [description]
		 * @return {Boolean}          [description]
		 */
		var isExistElement = function (_array, _element){
			if(!_array || !_element) return false;  
	        if(!_array.length){  
	            return (_array == _element);  
	        }  
	        for(var i=0; i<_array.length; i++){  
	            if(_element == _array[i]) return true;  
	        }  
	        return false; 
		};
		var len = data.length,dataArr = [],newData = {}; 
	  for(var i = 0; i < len ; i++){
	  	if(!isExistElement(dataArr,data[i][keyName])){
	  		dataArr.push(data[i][keyName]);
	  	}
	  }
	  for(var j = 0 ; j < dataArr.length ; j++){
	  	var 
	  		name = dataArr[j],
	  		tempArr= []; 
	  	for(var k = 0 ; k < len ; k++){
	  		if(name == data[k][keyName]){
	  			tempArr.push(data[k]);
	  		}
	  	}
	  	newData[name] = tempArr;
	  }
	  return newData;
	},
	/**
	 * [getAreaByUrl 根据URL地址获取各个大区url地址集合]
	 * @param  {[object]}   creeper    [爬虫对象]
	 * @param  {[String]}   creeperUrl [抓取页面的url地址]
	 * @param  {Function}   callback   [回调函数，返回抓取到的数组]
	 * @return {[type]}                [description]
	 */
	getAreaByUrl : function(creeper,creeperUrl,callback){
		async.waterfall([function(callback){
			// website 抓取到的网页内容
			creeper.getPageByUrl(creeperUrl,function (err, website){
				callback(null,website);
			});
		},function (website,callback){
			//areaUrls 返回的大区url数组
			creeper.getAnjukeAreaUrls(website,function (err , areaUrls){
				callback(null,areaUrls);
			});
		}],function(err,areaUrls){
			callback(null,areaUrls);
		});
	},
	/**
	 * [getStoreByAreaUrl 根据URL地址获取各个小区url地址集合]
	 * @param  {[object]}   creeper   [爬虫对象]
	 * @param  {[array]}    areaUrls  [抓取页面的url集合]
	 * @param  {Function}   callback  [回调函数，返回抓取到的数组]
	 * @return {[type]}               [description]
	 */
	getStoreByAreaUrl : function(creeper,areaUrls,callback){
		//控制并发数量为5
		async.mapLimit(areaUrls, 5, function (areaUrl, callback) {
				async.waterfall([function (callback){
					// website 抓取到的网页内容
					creeper.getPageByUrl(areaUrl,function (err, website){
						callback(null,website);
					});
				},function (website,callback){
					//storeUrls 返回的小区url数组
					creeper.getAnjukeStoreUrls(website,function (err , storeUrls){
						callback(null,storeUrls);
					});
				}],function (err,storeUrls){
					callback(null,storeUrls);
				});
		  },function(err,result){
		  	var arr = [];
		  	for(var i in result){
		  		arr.push.apply(arr,result[i]);
		  	}
		  	callback(null, arr);
		  });
	},
	/**
	 * [getHouseDetailByStoreUrl 根据小区url地址获取房源统计信息]
	 * @param  {[object]}   creeper   [爬虫对象]
	 * @param  {[array]}    storeUrls [抓取页面的url集合]
	 * @param  {Function}   callback  [回调函数，返回抓取到的房源信息集合]
	 * @return {[type]}             [description]
	 */
	getHouseUrlsByStoreUrl : function(creeper,storeUrls,callback){
		//控制并发数量为5
		async.mapLimit(storeUrls, 5, function (storeUrl, callback) {
  	 	async.waterfall([function (callback){
				// website 抓取到的网页内容
				creeper.getPageByUrl(storeUrl,function (err, website){
					callback(null,storeUrl,website);
				});
			},function (storeUrl,website,callback){
				//storeUrls 返回的小区url数组
				creeper.getHouseUrlsByStoreUrl(storeUrl,website,function (err, areaArray){
					console.log(areaArray);
					callback(null,areaArray);
				});
			}],function (err,areaArray){
				callback(null,areaArray);
			});
  	},function (err,result){
  		var arr = [];
	  	for(var i in result){
	  		arr.push.apply(arr,result[i]);
	  	}
	  	callback(null, arr);
  	});
	},
	/**
	 * [getHouseInfoByStoreUrl 根据小区url地址获取房源统计信息]
	 * @param  {[object]}   creeper   [爬虫对象]
	 * @param  {[array]}    detailUrls [抓取页面的url集合]
	 * @param  {Function}   callback  [回调函数，返回抓取到的房源信息集合]
	 * @return {[type]}             [description]
	 */
	getHouseInfoByStoreUrl : function(creeper,detailUrls,callback){
		//控制并发数量为5
		async.mapLimit(detailUrls, 5, function (detailUrl, callback) {
			async.waterfall([function (callback){
				// website 抓取到的网页内容
				creeper.getPageByUrl(detailUrl,function (err, website){
					callback(null,detailUrl,website);
				});
			},function (detailUrl,website,callback){
				//detailUrls 返回的小区url数组
				creeper.getAnjukeHouseInfo(detailUrl,website,function (err, houseArray){
					callback(null,houseArray);
				});
			}],function (err,houseArray){
				console.log(houseArray);
				callback(null,houseArray);
			});
		},function (err,result){
			console.log("=======开始处理数据=======");
			var 
				resultArr = [],
				test      = creeper.AnjukeObject.buildData(result,'areaName'),
				build     = [];
			for(var i in test){
				build.push(creeper.AnjukeObject.buildData(test[i],'storeName'));
			}
			for(var k in build){
				for(var j in build[k]){
					var arr = [],areaName,lianjia = awjw = 0;
					for(var d in build[k][j]){
						var obj = build[k][j],areaName = obj[d].areaName;
						if(obj[d].company == '成都链家'){
							lianjia+=1
						}
						if(obj[d].company == '爱屋吉屋'){
							awjw+=1
						}
					}
					arr.push(creeper.areaObject[areaName]);
					arr.push(creeper.storeObject[j]);
					arr.push(build[k][j].length);
					arr.push(lianjia);
					arr.push(awjw);
					arr.push(0);
					arr.push(0);
					arr.push(0);
					resultArr.push(arr);
				}
			}
		console.log("=======处理数据结束等待导出=======");
  		callback(null, resultArr);
  	});
	}
};
module.exports = creeper;