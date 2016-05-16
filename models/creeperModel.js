var 
	superagent = require('superagent'),
	cheerio    = require('cheerio'),
	urlUtil    = require('url'),
	Entities   = require('html-entities').XmlEntities,
	entities   = new Entities(),
	xlsx       = require('node-xlsx'),
	fs         = require('fs-extra');
/**
 * [creeper 爬虫构造函数]
 * @param  {[type]} creeperUrl  [抓取网页的首页]
 * @param  {[type]} areaObject  [大区对象]
 * @param  {[type]} storeObject [小区对象]
 * @return {[type]}             [description]
 */
function creeper(creeperUrl,areaObject,storeObject,cookies){

	this.creeperUrl  = creeperUrl;
	this.areaObject  = areaObject || {};
	this.storeObject = storeObject || {};
	this.cookies = cookies || '';
	this.isAddHeader = false;
	this.headerData  = ['大区','小区','房源总数','链家房源','爱屋吉屋房源','精准房源数','链家精准房源','爱屋吉屋精准房源'];

};
/**
 * [getPageByUrl 根据url地址获取网页内容]
 * @param  {[String]}   url      [url地址]
 * @param  {Function}   callback [回调函数，返回抓取到的网页]
 * @return {[type]}              [description]
 */
creeper.prototype.getPageByUrl = function(url,callback){
	superagent
	.get(url)
	.set('Pragma','no-cache')
	.set('Cookie',this.cookies)
	.set('User-Agent','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.71 Safari/537.36')
	.end(function (err, res) {
	  if (err) {
	    return console.error(err);
	  }
	  callback(null,res.text);
	});
};
/**
 * [writePage 输出抓取的页面文本]
 * @param  {[type]} storeName [文件名称]
 * @param  {[type]} website   [网页内容]
 * @return {[type]}           [description]
 */
creeper.prototype.writePage = function(storeName,website){
	fs.writeFile('./test/'+storeName + '.txt', website, function (err) {
    if (err) throw err;
    console.log('It\'s saved!');
  });
};
/**
 * [countHouseInfo 统计房源信息]
 * @param  {[type]} areaArray  [区域数组]
 * @param  {[type]} areaResult [区域结果数组]
 * @return {[type]}            [description]
 */
creeper.prototype.countHouseInfo = function(areaArray,areaResult){
	var 
		len     = areaResult.length, 
		lianSum = awjwSum = lianJin = awjwJin = jinSum = i = 0;

	  for(; i < len ; i++){
	    if(areaResult[i].jinpin){
	      jinSum += 1;
	      if(areaResult[i].company == "链家地产"){
	        lianJin += 1;
	      }
	      if(areaResult[i].company == "爱屋吉屋"){
	        awjwJin += 1;
	      }
	    }
	    if(areaResult[i].company == "链家地产"){
	      lianSum += 1;
	    }
	    if(areaResult[i].company == "爱屋吉屋"){
	      awjwSum += 1;
	    }
	  }
	  areaArray.push(lianSum);
	  areaArray.push(awjwSum);
	  areaArray.push(jinSum);
	  areaArray.push(lianJin);
	  areaArray.push(awjwJin);

	  return areaArray;
}
/**
 * [outPutData 输出文本到excel中]
 * @param  {[object]}   finalResult [输出结果对象]
 * @param  {Function}   callback    [description]
 * @return {[type]}                 [description]
 */
creeper.prototype.outPutData = function(areaName,finalResult,callback){
	//如果添加过第一行标题
	if(!this.isAddHeader){
    finalResult.unshift(this.headerData);
    this.isAddHeader = true;
  }
  var
		date    = new Date(),
		day     = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
		hours   = date.getHours(),
		dirpath = process.cwd() + '/data/'+ areaName +'/' + day +'/';
	console.log('save file!');
	var writeExecl = function(){
		//写入
	  // var data = [[1,2,3],[true, false, null, 'sheetjs'],['foo','bar',new Date('2014-02-19T14:30Z'), '0.3'], ['baz', null, 'qux']];
	  var buffer = xlsx.build([{name: "houseCount", data: finalResult}]); // returns a buffer
	  fs.writeFileSync(dirpath + hours + '.xlsx',buffer,'binary');
	}
  fs.exists( dirpath , function (exists){	
  	if(!exists){
  		fs.mkdirs(dirpath, function (err) {
			  if (err) return console.error(err)
			  writeExecl();
			})
  	}else{
  		writeExecl();
  	}
  });
  console.log('======抓取结束======');
  
}
module.exports = creeper;