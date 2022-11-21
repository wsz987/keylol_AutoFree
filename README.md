<h1 align="center">
keylol_AutoFree
</h1>

**适用于青龙面板自动任务，其乐转盘每日蒸汽消消乐**

此脚本仅可用于自身账号的每日转盘抽奖，切勿**一人多号**违规使用，请遵守[keylol](https://keylol.com/) 社区版规，**珍爱账号!!!**

此脚本仅供学习参考!!!



### 测试环境

- linux/armbain
- docker qinglongv2.10.13
- NodeJS/Python/Shell
- 请自行安装运行依赖 

### **一键安装**
面板中 定时任务-添加任务-新增定时/docker请进入容器运行

**后续操作将在 脚本管理-wsz987_keylol_AutoFree文件夹下进行**
```
ql repo https://github.com/wsz987/keylol_AutoFree.git
```

### **使用**

1. 消息推送请自行配置[sendNotify.js](https://github.com/whyour/qinglong/tree/master/sample)

2. 配置[keylol_AutoFree.js](https://github.com/wsz987/keylol_AutoFree/blob/main/keylol_AutoFree.js)

   ```javascript
   /*
    * @param name 账号名
    * @param rollNumber 抽奖次数 [0,3] 默认一次
    * @param cookie 建议转盘进行一次抽奖再获取cookie 'https://keylol.com'
    * @Description: 支持多账号
    */
   const keylol_Users = [{
     name: "",
     rollNumber: 1,
     cookie: ""
   }]
   // 随机抽奖延迟范围 默认100~1000ms
   const Random_Range = [100, 1000]
   ```
