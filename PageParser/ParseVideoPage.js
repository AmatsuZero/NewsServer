/**
 * Created by jiangzhenhua on 2017/1/11.
 */
const request = require('superagent');

function parseVideoURL(vid,type) {
    return new Promise((resolve,reject)=>{
        //拼装JS请求
        let video = 'http://3g.163.com/touch/video/detail/jsonp/' + vid + '.html?callback=' + type;
        request
            .get(video)
            .withCredentials()
            .set('User-Agent','Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1')
            .end((err, res)=> {
                let json;//因为是JSONP类型，所以才会被认为是格式不正确的JSON
                if(err) {
                    if(err.message.indexOf('Unexpected token') > -1 && err.rawResponse.indexOf(type) > -1) {
                        json = err.rawResponse;
                        parseJSON(json,type)
                            .then((j)=>{resolve(j)})
                            .catch((e)=>{reject(e)});
                    } else {
                        reject(err);
                    }
                } else {
                    json = res.text();
                    parseJSON(json,type)
                        .then((j)=>{resolve(j)})
                        .catch((e)=>{reject(e)});
                }
            })
    });
}

function parseJSON(json,type) {
    return new Promise((resolve,reject)=>{
        //取出消息内容
        let replaceStr = type + '('
        json = json.replace(replaceStr,'');
        json = json.replace(/\)/g,'');
        try {
            json = JSON.parse(json);
            resolve(json);
        } catch (e) {
            reject(e);
        }
    });
}

function parseRecommendJSON(vid,type) {
    return new Promise((resolve,reject)=> {
        let url = 'http://c.m.163.com/nc/video/list/' + vid + '/y/0-16.html?callback=' + type;
        request
            .get(url)
            .set('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1')
            .end((err, res) => {
                let json;//因为是JSONP类型，所以才会被认为是格式不正确的JSON
                if (err) {
                    if (err.message.indexOf('Unexpected token') > -1 && err.rawResponse.indexOf(type) > -1) {
                        json = err.rawResponse;
                        parseJSON(json, type)
                            .then((j) => {
                                resolve(j)
                            })
                            .catch((e) => {
                                reject(e)
                            });
                    } else {
                        reject(err);
                    }
                } else {
                    json = res.text();
                    parseJSON(json, type)
                        .then((j) => {
                            resolve(j)
                        })
                        .catch((e) => {
                            reject(e)
                        });
                }
            })
    });
}

module.exports = function (req, res) {
    let vid = req.query['vid'];
    let listType = req.query['callback'];
    let type = req.query['type'];

    switch (type) {
        case 'recommend': {

        }
            break;

        default:
            parseVideoURL(vid,listType)
                .then((JSON)=>{
                    res.status(200);
                    res.type('json');
                    res.json(JSON);
                    res.end();
                })
                .catch((e)=>{
                    res.status(400);
                    res.send(e);
                    res.end();
                });
            break;
    }
};