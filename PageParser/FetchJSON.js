/**
 * Created by jiangzhenhua on 2017/1/5.
 */
const superagent = require('superagent');
const async = require('async');

//图片URL有些特殊，暂不处理
const routePath = {
    "news":"BBM54PGAwangning",
    "entertainment":"BA10TA81wangning",
    "sports":"BA8E6OEOwangning",
    "finance":"BA8EE5GMwangning",
    "automobile":"BA8DOPCSwangning"
}

//拼装页面对象
let pages = [];
for(let path in routePath) {
    let page = new ListPage(routePath[path], path);
    pages.push(page);
}

class ListPage {
    constructor(path,name){
        this.name = name;
        this.path = path;
        this.start = 0;
        this.end = 10;
    }
}

function fetch(page) {
    if(page == nil) return;
    return new Promise((resolve,reject)=>{
        "use strict";
        //拼装url
        let url = "http://3g.163.com/touch/reconstruct/article/list/" +  page.path + "/" + page.start + "-" + page.end + ".html";
        superagent
            .get(url)
            .withCredentials()
            .set('User-Agent','Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1')
            .set('Content-Type','application/json')
            .end(function(err, res){
                if (err) {
                    reject(err);
                }
                //取出消息内容
                let json = res.text;
                json = json.replace('artiList(','');

                json = json.replace(/\)/g,'');
                try {
                    json = JSON.parse(json);
                    return resolve(json[page.path]);
                } catch (e) {
                    reject(e);
                }
            });
    });
}

function fetchList(pages) {
    //并行请求处理
    async.map(pages,
        (page,finishHandler) => {
            "use strict";
            fetch(page)
                .then((json)=>{
                    console.log(json);
                    //更换到下一页
                    page.start = page.end + 1;
                    page.end += 10;
                    finishHandler(null,page);
                })
                .catch((e)=>{
                    finishHandler(e);
                })
        },
        (err,results) => {
            fetchList(results);
        }
    );
}

module.exports = function () {
    fetchList(pages);
};