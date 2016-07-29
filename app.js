
var 
  creeperCtr  = require('./controller/controller'),
  creeper     = new creeperCtr(),
  schedule    = require('node-schedule'),
  rule        = new schedule.RecurrenceRule();
  rule.hours  = [8,9,10,11,12,13,14,15,16,17,18]; 
  rule.minute = 1;

var j = schedule.scheduleJob(rule, function(){
  creeper.getWuBaData('http://cd.58.com');
  creeper.getAnjukeData('http://chengdu.anjuke.com');
  console.log("执行任务");
});
// creeper.getWuBaData('http://cd.58.com');
creeper.getAnjukeData('http://chengdu.anjuke.com');
