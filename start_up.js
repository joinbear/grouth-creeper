  //配置node.js服务为windows服务，开机自启动

var shortcut = require('windows-shortcuts');

var fs=require("fs");

//windows下的开机启动

if(process.platform.match(/^win/)){

    //开机启动目录

    var startupMenu="";

    //APPDATA目录中有Roming的是win7,win8等同类系统开机目录

    if(/Roaming/.test(process.env.APPDATA)){

        startupMenu=process.env.APPDATA+"\\Microsoft\\Windows\\Start Menu\\Programs\\Startup\\";

    }else{

        //winXp等同类系统开机目录

        startupMenu=process.env.USERPROFILE+"\\「开始」菜单\\程序\\启动\\";

    }    //在目录下生成的快捷方式名称

    var startupTarget=startupMenu+"dataCatch.lnk"; /*注意更改*/

    //要复制快捷方式过去的源程序

    var sourcePrograme=__dirname+"\\start.bat"; /*注意更改*/

    //存在就删除,不存在就创建

    if(fs.existsSync(startupTarget)){

        fs.unlink(startupTarget,function(err){

            if(err){

                console.error("取消开机启动出错",err);

            }

   else

            {

                console.log("取消开机启动成功");

            } 

        })

    }else{

        shortcut.create(startupTarget,sourcePrograme,function(err){

            if(err){

                console.error("设置开机启动出错",err);

            }

            else

            {

                console.log("设置开机启动成功");

 }

        })

    }

}

//这里你只需要更改上述程序带有/*注意更改*/注释的文字就可以：

//第一个/*注意更改*/注释的部分：定义快捷方式的名称；

//第二个/*注意更改*/注释的部分：加载开机启动时启动的脚本。（注意：路径一定要对，上述程序所指目录为start_up.js同目录下的run_test.bat。所以一定要把你编写的脚本文件与start_up.js放在同一目录下。）

//然后，在node命令行或者IDE中运行start_up.js即可
