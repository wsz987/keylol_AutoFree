<h1 align="center">
keylol_AutoFree
</h1>

**适用于青龙面板自动任务，其乐转盘每日蒸汽消消乐**

此脚本仅可用于自身账号的每日转盘抽奖，切勿**一人多号**违规使用，请遵守[keylol](https://keylol.com/) 社区版规，**珍爱账号!!!**

此脚本仅供学习参考!!!



### 运行环境

- armbain
- docker qinglongv2.10.13
- NodeJS
- 请自行安装运行依赖 



### **使用**

1. 将 [keylol_AutoFree.js](https://github.com/wsz987/keylol_AutoFree/blob/main/keylol_AutoFree.js) 及 [sendNotify.js](https://github.com/wsz987/keylol_AutoFree/blob/main/sendNotify.js)（非必须，此脚本为面板自带）脚本，放置于`脚本管理`根目录/自定义位置

    ```
    `docker/ql/scripts/keylol_AutoFree.js`
    `docker/ql/scripts/sendNotify.js`
    ```

2. 消息推送请自行配置[sendNotify.js](https://github.com/wsz987/keylol_AutoFree/blob/main/sendNotify.js)

3. 配置[keylol_AutoFree.js](https://github.com/wsz987/keylol_AutoFree/blob/main/keylol_AutoFree.js)

   ```javascript
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
   ```

4. **定时任务配置**/ `新建任务`  

    ```
    [名称]
    keylol蒸汽消消乐
    
    [命令]      默认根目录，其他路径自行配置
    task keylol.js    
    
    [定时规则]   自行配置 http://cron.ciding.cc/
    8 8 8 * *   
    ```

