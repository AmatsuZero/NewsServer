/**
 * Created by jiangzhenhua on 2017/1/3.
 */
const superagent = require('superagent');
const cheerio = require('cheerio');
const paths = ["all",'discovery','society','domestic','international','history'];//所有子频道

function startMission() {
    return new Promise((resolve, reject)=>{
        "use strict";
        superagent
            .get('http://3g.163.com/touch/all?nav=2&dataversion=A&version=v_standard')
            .withCredentials()
            .set('User-Agent','Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1')
            .end((err, res)=>{
                if (err) reject(err);
                let $ = cheerio.load(res.text,{decodeEntities: false});//防止乱码
                let requestArr = [];
                $('.s_main_nav').children('li').each((index,element) => {
                    let link = $(element).find('a');//拿到a标签
                    let req = {
                        "name":link.text(),
                        "link":link.attr('href')
                    };
                    requestArr.push(req);
                })
                resolve(requestArr);
            });
    })
}

function handlePage(url) {
    return new Promise((resolve, reject)=>{
        "use strict";
        superagent
            .get(url)
                .withCredentials()
                .set('User-Agent','Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1')
                .end((err, res)=>{
                    if (err) {
                        reject(err);
                    } else {
                        let newsList = [];
                        let $ = cheerio.load(res.text,{decodeEntities: false});
                        $('.swipe-content .content-list').children('section').each((index,element) => {
                            let link = $(element).children('a');
                            let news = {
                                "title":$(link).text(),
                                "link":$(link).attr('href')
                            }
                            newsList.push(news);
                        });
                        resolve(newsList);
                    }
                });
    })
}

startMission()
    .then((requestArr)=>{
        "use strict";
        for(let i = 1; i < requestArr.length; i++) {
            let PromiseTasks = [];
            for(let subPath of paths) {
                let mainURL = requestArr[i].link;
                let urlParts = mainURL.split('?');
                urlParts[1] = 'subchannel/' + subPath + '?' + 'nav=2&dataversion=A&version=v_standard';
                let newURL = encodeURI(urlParts.join('/'));//保险起见编码处理一下
                handlePage(newURL)
                    .then((arr)=>{
                        console.log(arr);
                    })
                    .catch((e)=>{
                        console.log(newURL);
                    })
            }
        }
    })
    .catch((e)=>{
        "use strict";
        console.log(e);
    })


