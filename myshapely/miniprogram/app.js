//app.js
App({
  onLaunch: function () {
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        traceUser: true,
      })
    }

    

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.globalData.userInfo.avatarUrl = res.userInfo.avatarUrl
              this.globalData.userInfo.nickName = res.userInfo.nickName
              console.log("获取用户信息",res.userInfo)
            }
          })
        }
      }
    })

    //获取openid（与获取用户信息异步调用）
    if (this.globalData.userInfo.openid == null) {
      wx.cloud.callFunction({
        name: 'login',
        data: {},
        success: res => {
          console.log('[云函数] [login] user openid: ', res.result.openid)
          if (res.result.user.length == 0) {
            this.globalData.userInfo.bind = false
          }
          else {
            //伪代码this.globalData.userInfo = res.result.user
            this.globalData.userInfo.bind = true
          }
          this.globalData.userInfo.openid = res.result.openid
          console.log(this.globalData.userInfo)
        },
        fail: err => {
          console.error('[云函数] [login] 调用失败', err)
        }
      })
    }
    
  },
  globalData:{
    userInfo:{
      avatarUrl:"",
      nickName:"",
      openid:null,
      bind:false
    }
  }
})
