const httpd = require("http");
const fs = require("fs");

//创建服务
httpd.createServer((req,res)=>{
    //读取www文件夹下的路径
    fs.readFile(`www${req.url}`,(err,data)=>{
        //失败返回404
        if(err){
　　　　　　　　 res.writeHeader(404);
            res.write('<h1>404</h1>');
        }else{
            //成功返回页面
            res.write(data);
        }
        res.end();
    })
}).listen(8082);
console.log('runing......')