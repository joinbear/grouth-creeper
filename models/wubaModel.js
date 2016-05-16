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
 * [getWuBaAreaUrls   解析页面获取58同城的二手房大区url地址]
 * @param  {[type]}   website  [待解析的网页]
 * @param  {Function} callback [回调函数，返回解析得到的大区url集合]
 * @return {[type]}            [description]
 */
creeper.prototype.getWuBaAreaUrls = function(website,callback){
	var 
		$        = cheerio.load(website),
		areaUrls = [],
		that     = this,//处理this的指向问题
		reg   = /wuhou|chenghua|jinniu|qingyangqu|longquanyi|cdgaoxin|shuangliu|jinjiang|wenjiang/;
		// reg      = /jinniu|cdgaoxin/;
		// reg   = /wuhou/;

	// 获取首页区域的链接
  $('#region dd a').each(function (idx, element) {
		var 
		$element = $(element),
		areaUrl  = $element.attr('href'),
		areaName = areaUrl.replace('/ershoufang/','').replace('/',''),
		areaTxt  = entities.decode($element.html());
		
		//获取指定大区的url地址和名称
    if(areaUrl.match(reg)){
      areaUrls.push(urlUtil.resolve(that.creeperUrl, areaUrl));
      that.areaObject[areaName] = areaTxt;
    }
  });

	callback(null,areaUrls);
};
/**
 * [getWuBaStoreUrls 解析页面获取获取58同城的门店的url集合]
 * @param  {[type]}   website  [待解析页面]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
creeper.prototype.getWuBaStoreUrls = function(website,callback){
	var $ = cheerio.load(website),storeUrls = [],that = this;
  $('#region dd .subarea a').each(function (idx, element) {
    var 
			$element  = $(element),
			storeUrl  = $element.attr('href'),
			storeTxt  = entities.decode($element.html()),
			href      = urlUtil.resolve(that.creeperUrl, storeUrl),
			storeName = href.replace(that.creeperUrl,'').replace('/ershoufang/','');

      storeUrls.push(href);
      that.storeObject[storeName] = storeTxt;
  });
  callback(null, storeUrls);
};
/**
 * [getWuBaHouseInfo description]
 * @param  {[type]}   storeUrl [description]
 * @param  {[type]}   website  [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
creeper.prototype.getWuBaHouseInfo = function(storeUrl,website,callback){
	var 
		$          = cheerio.load(website),
		storeName  = storeUrl.replace(this.creeperUrl,'').replace('/ershoufang/',''),
		areaArray  = [],
		areaResult = [],
		houseNum   = $('#infolist .tbimg').find('tr').length;
		areaDom    = $('#header .nav a'),
		areaName   = areaDom.eq(areaDom.length - 2).attr('href');
		if(areaName){
			areaName   = areaName.replace('/ershoufang/','').replace('/','');
		}
		
  areaArray.push(this.areaObject[areaName]);
  areaArray.push(this.storeObject[storeName]);
	areaArray.push(houseNum);

  //输出抓取网页内容
  //this.writePage(storeName,website);

  $('#infolist .tbimg').find('tr').each(function (idx, element) {
    var 
			$element  = $(element),
			resultObj = {},
			company   = $element.find('.qj-lijjrname').next().html(),
			jinpin    = $element.find('.bthead').children('.jingpin').length;

    if(company){
      resultObj.company = entities.decode(company);
      if(jinpin){
        resultObj.jinpin = jinpin;
      }
    }
    areaResult.push(resultObj);
  });
  areaArray = this.countHouseInfo(areaArray,areaResult);
  console.log(areaArray);
  callback(null,areaArray);
};
creeper.prototype.wuBaObject = {
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
			creeper.getWuBaAreaUrls(website,function (err , areaUrls){
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
		async.mapLimit(areaUrls, 10, function (areaUrl, callback) {
				async.waterfall([function (callback){
					// website 抓取到的网页内容
					creeper.getPageByUrl(areaUrl,function (err, website){
						var delay = parseInt((Math.random() * 10000000) % 2000, 10);
						setTimeout(function () {
					    callback(null,website);
					  }, delay);
					});
				},function (website,callback){
					//storeUrls 返回的小区url数组
					creeper.getWuBaStoreUrls(website,function (err , storeUrls){
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
	 * [getHouseInfoByStoreUrl 根据小区url地址获取房源统计信息]
	 * @param  {[object]}   creeper   [爬虫对象]
	 * @param  {[array]}    storeUrls [抓取页面的url集合]
	 * @param  {Function}   callback  [回调函数，返回抓取到的房源信息集合]
	 * @return {[type]}             [description]
	 */
	getHouseInfoByStoreUrl : function(creeper,storeUrls,callback){
		//控制并发数量为5
		async.mapLimit(storeUrls, 10, function (storeUrl, callback) {
  	 	async.waterfall([function (callback){
				// website 抓取到的网页内容
				creeper.getPageByUrl(storeUrl,function (err, website){
					var delay = parseInt((Math.random() * 10000000) % 2000, 10);
					setTimeout(function () {
				    callback(null,storeUrl,website);
				  }, delay);
				});
			},function (storeUrl,website,callback){
				//storeUrls 返回的小区url数组
				creeper.getWuBaHouseInfo(storeUrl,website,function (err, areaArray){
					callback(null,areaArray);
				});
			}],function (err,areaArray){
				callback(null,areaArray);
			});
  	},function (err,result){
  	 	callback(null, result);
  	});
	}
};
module.exports = creeper;