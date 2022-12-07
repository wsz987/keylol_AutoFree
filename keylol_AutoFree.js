/*
 * @Author: wsz987 https://github.com/wsz987/keylol_AutoFree
 * sendNotify 推送通知功能
 * cron "8 8 * * *" script-path=keylol_AutoFree.js tag=keylol蒸汽消消乐
 * @version 1.0
 * @Description: 其乐转盘每日蒸汽消消乐
 */


const $ = new Env('keylol蒸汽消消乐');
const notify = $.isNode() ? require('./sendNotify') : '';
/*
 * @param name 账号名
 * @param rollNumber 抽奖次数 [0,3] 默认一次
 * @param cookie 建议转盘进行一次抽奖再获取cookie 'https://keylol.com'
 */
const keylol_Users = [{
  name: "",
  rollNumber: 1,
  cookie: ""
}]
// 随机抽奖延迟范围 默认100~1000ms
const Random_Range = [100, 1000]

const rollList = [
  '我全都要（充值卡一份）',
  '都行（返还1蒸汽）',
  '可以（返还1蒸汽）',
  '随你（返还1蒸汽）',
  '没关系（返还1蒸汽）',
  '要放下（返还1蒸汽）',
  '会忍耐（返还1蒸汽）',
  '看淡了（返还1蒸汽）',
  '就这样吧（返还1蒸汽）',
  '一切随缘（返还1蒸汽）',
  '大彻大悟（返还9蒸汽）',
  '任务1',
  '任务2',
  '任务3',
  '任务4',
]

const requirement = `● 每次抽奖支付 2 蒸汽
● 每个用户每天可以抽3次（北京时间早8点重置）
● 公开绑定 Steam 账号
● 进阶会员（2级会员）或者更高等级
● 发帖数（主题+回帖）不低于50\n`

let notifyMsg = []

!(async () => {
  if (!$.isNode()) return;

  for (let index in keylol_Users) {
    let { cookie, name, rollNumber } = keylol_Users[index]
    index = index - ''
    if (!cookie) {
      let errMsg = `❌ 账号【${index + 1}】${name} cookie无效! 请先获取cookie\nhttps://keylol.com/`
      $.msg(errMsg)
      notifyMsg[index] = errMsg
      continue
    }

    $.log(`=========== 账号 【${index + 1}】 ${name} ===========`)
    notifyMsg[index] = `账号【${index + 1}】: ${name}\n抽取次数：${rollNumber}\n日志：\n`

    const { hash, resultMsg } = await rollRequest({ cookie })
    if (!hash) {
      notifyMsg[index] += resultMsg
      $.log(resultMsg);
      continue
    }
    $.log(resultMsg + hash + '\n');

    await taskRoll({ cookie, hash }, rollNumber, index)
  }
})()
  .catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
  })
  .finally(async () => {
    let format_notifyMsg = notifyMsg.join('\n')
    await notify.sendNotify(`${$.name}`, format_notifyMsg)
    $.done();
  })

async function taskRoll(params, rollNumber, current) {
  for (let i = 0; i < rollNumber; i++) {
    let r = random_wait()
    $.log(`== 随机 ${r} ms ==`)
    await $.wait(r)
    const { resultMsg } = await rollRequest(params)
    notifyMsg[current] += resultMsg
  }
}

function rollRequest(params = { cookie: '', hash: '' }) {
  return new Promise((resolve, reject) => {
    let resultMsg = ''
    let url = 'https://keylol.com/plugin.php?id=steamcn_lottery:view&lottery_id=46'
    if (params?.hash) {
      url += `&hash=${params.hash}&roll&_=${new Date().getTime()}`
    }
    $.get({
      url,
      "headers": {
        "Accept": "atext/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "Content-Type": "text/xml; charset=utf-8",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "zh-cn",
        "Connection": "keep-alive",
        "Cookie": params?.cookie,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Safari/537.36"
      }
    }, async (err, resp, data) => {
      try {
        err && $.log('err:' + err)
        // $.log('data:' + data)
        data = data + ''
        let unLogin = data.includes('登录') || data.includes('登錄')
        if (unLogin) return resolve({ hash: null, resultMsg: '❌ 请检查cookie\n' })

        let checkRoll = data.includes('不可参加') || data.includes('不可參加') 
        if (checkRoll) return resolve({ hash: null, resultMsg: '❗️ 不可参加\n请检查条件：\n' + requirement })

        let hashReg = /plugin\.php\?id=steamcn_lottery:view&lottery_id=46&hash=(.+)&roll/
        let matchResult = data.match(hashReg);
        if (matchResult && matchResult[1]) return resolve({ hash: matchResult[1], resultMsg: '🔔hash 获取成功：' })

        // {"id":7,"msg":"","good":1}
        data = JSON.parse(data)
        if (data.id >= 0) {
          if (data.good) {
            resultMsg = rollList[data.id] + '\n'
            $.log(resultMsg);
          } else {
            resultMsg = '很遗憾，你没有抽到什么好东西\n'
            $.log(resultMsg);
          }
        }else {
          resultMsg = '❗️ 不可参加\n请检查条件：\n' + requirement
          $.log(resultMsg);
        }
      } catch (e) {
        resultMsg = e + data.toString().includes('转盘') ? '\n❗️ 尝试转一次转盘再获取cookie' : '\n❌ 请检查cookie' + '\n' + err
        $.logErr(e, err);
      } finally {
        resolve({ ...data, resultMsg });
      }
    });
  });
}

function random_wait() { return Math.random().toFixed(2) * (Random_Range[1] - Random_Range[0]) + Random_Range[0]; }

function Env(t, s) { return new class { constructor(t, s) { this.name = t, this.data = null, this.dataFile = "box.dat", this.logs = [], this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, s), this.log("", `\ud83d\udd14${this.name}, \u5f00\u59cb!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } getScript(t) { return new Promise(s => { $.get({ url: t }, (t, e, i) => s(i)) }) } runScript(t, s) { return new Promise(e => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let o = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); o = o ? 1 * o : 20, o = s && s.timeout ? s.timeout : o; const [h, a] = i.split("@"), r = { url: `http://${a}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: o }, headers: { "X-Key": h, Accept: "*/*" } }; $.post(r, (t, s, i) => e(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), s = this.path.resolve(process.cwd(), this.dataFile), e = this.fs.existsSync(t), i = !e && this.fs.existsSync(s); if (!e && !i) return {}; { const i = e ? t : s; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), s = this.path.resolve(process.cwd(), this.dataFile), e = this.fs.existsSync(t), i = !e && this.fs.existsSync(s), o = JSON.stringify(this.data); e ? this.fs.writeFileSync(t, o) : i ? this.fs.writeFileSync(s, o) : this.fs.writeFileSync(t, o) } } lodash_get(t, s, e) { const i = s.replace(/\[(\d+)\]/g, ".$1").split("."); let o = t; for (const t of i) if (o = Object(o)[t], void 0 === o) return e; return o } lodash_set(t, s, e) { return Object(t) !== t ? t : (Array.isArray(s) || (s = s.toString().match(/[^.[\]]+/g) || []), s.slice(0, -1).reduce((t, e, i) => Object(t[e]) === t[e] ? t[e] : t[e] = Math.abs(s[i + 1]) >> 0 == +s[i + 1] ? [] : {}, t)[s[s.length - 1]] = e, t) } getdata(t) { let s = this.getval(t); if (/^@/.test(t)) { const [, e, i] = /^@(.*?)\.(.*?)$/.exec(t), o = e ? this.getval(e) : ""; if (o) try { const t = JSON.parse(o); s = t ? this.lodash_get(t, i, "") : s } catch (t) { s = "" } } return s } setdata(t, s) { let e = !1; if (/^@/.test(s)) { const [, i, o] = /^@(.*?)\.(.*?)$/.exec(s), h = this.getval(i), a = i ? "null" === h ? null : h || "{}" : "{}"; try { const s = JSON.parse(a); this.lodash_set(s, o, t), e = this.setval(JSON.stringify(s), i) } catch (s) { const h = {}; this.lodash_set(h, o, t), e = this.setval(JSON.stringify(h), i) } } else e = $.setval(t, s); return e } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, s) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, s) : this.isQuanX() ? $prefs.setValueForKey(t, s) : this.isNode() ? (this.data = this.loaddata(), this.data[s] = t, this.writedata(), !0) : this.data && this.data[s] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, s = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? $httpClient.get(t, (t, e, i) => { !t && e && (e.body = i, e.statusCode = e.status), s(t, e, i) }) : this.isQuanX() ? $task.fetch(t).then(t => { const { statusCode: e, statusCode: i, headers: o, body: h } = t; s(null, { status: e, statusCode: i, headers: o, body: h }, h) }, t => s(t)) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, s) => { try { const e = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); this.ckjar.setCookieSync(e, null), s.cookieJar = this.ckjar } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: e, statusCode: i, headers: o, body: h } = t; s(null, { status: e, statusCode: i, headers: o, body: h }, h) }, t => s(t))) } post(t, s = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) $httpClient.post(t, (t, e, i) => { !t && e && (e.body = i, e.statusCode = e.status), s(t, e, i) }); else if (this.isQuanX()) t.method = "POST", $task.fetch(t).then(t => { const { statusCode: e, statusCode: i, headers: o, body: h } = t; s(null, { status: e, statusCode: i, headers: o, body: h }, h) }, t => s(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: e, ...i } = t; this.got.post(e, i).then(t => { const { statusCode: e, statusCode: i, headers: o, body: h } = t; s(null, { status: e, statusCode: i, headers: o, body: h }, h) }, t => s(t)) } } time(t) { let s = { "M+": (new Date).getMonth() + 1, "d+": (new Date).getDate(), "H+": (new Date).getHours(), "m+": (new Date).getMinutes(), "s+": (new Date).getSeconds(), "q+": Math.floor(((new Date).getMonth() + 3) / 3), S: (new Date).getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, ((new Date).getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in s) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? s[e] : ("00" + s[e]).substr(("" + s[e]).length))); return t } msg(s = t, e = "", i = "", o) { const h = t => !t || !this.isLoon() && this.isSurge() ? t : "string" == typeof t ? this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : void 0 : "object" == typeof t && (t["open-url"] || t["media-url"]) ? this.isLoon() ? t["open-url"] : this.isQuanX() ? t : void 0 : void 0; this.isSurge() || this.isLoon() ? $notification.post(s, e, i, h(o)) : this.isQuanX() && $notify(s, e, i, h(o)), this.logs.push("", "==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="), this.logs.push(s), e && this.logs.push(e), i && this.logs.push(i) } log(...t) { t.length > 0 ? this.logs = [...this.logs, ...t] : console.log(this.logs.join(this.logSeparator)) } logErr(t, s) { const e = !this.isSurge() && !this.isQuanX() && !this.isLoon(); e ? $.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t.stack) : $.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t) } wait(t) { return new Promise(s => setTimeout(s, t)) } done(t = {}) { const s = (new Date).getTime(), e = (s - this.startTime) / 1e3; this.log("", `\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${e} \u79d2`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, s) }
