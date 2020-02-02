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
              this.globalData.userInfo.language = res.userInfo.language
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
            this.globalData.userInfo.name = res.result.user[0].name
            this.globalData.userInfo.birthday = res.result.user[0].birthday
            this.globalData.userInfo.phoneNumber = res.result.user[0].phoneNumber
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
      bind:false,
      language:""
    },
    categories: [
      {
        id: 1,
        url: "cloud://myshapely-v1.6d79-myshapely-v1-1259751623/homepage_1.jpg",
        name: "女士",
        subCates: [
          {
            id: 0,
            name: "本季新品"
          },
          {
            id: 1,
            name: "文胸"
          },
          {
            id: 2,
            name: "美体衣"
          },
          {
            id: 3,
            name: "家居服"
          },
          {
            id: 4,
            name: "小裤"
          },
          {
            id: 5,
            name: "保暖衣"
          },
          {
            id: 6,
            name: "打底衫"
          },
          {
            id: 7,
            name: "袜类"
          },
          {
            id: 8,
            name: "泳衣"
          }
        ]
      },
      {
        id: 2,
        url: "cloud://myshapely-v1.6d79-myshapely-v1-1259751623/homepage_2.jpg",
        name: "男士",
        subCates: [
          {
            id: 0,
            name: "本季新品"
          },
          {
            id: 1,
            name: "保暖衣"
          },
          {
            id: 2,
            name: "家居服"
          },
          {
            id: 3,
            name: "短裤"
          },
          {
            id: 4,
            name: "泳裤"
          }
        ]
      },
      {
        id: 3,
        url: "cloud://myshapely-v1.6d79-myshapely-v1-1259751623/homepage_3.jpg",
        name: "养护产品",
        subCates: [
          {
            id: 1,
            name: "精油垫"
          },
          {
            id: 2,
            name: "养护液"
          },
          {
            id: 3,
            name: "精油"
          }
        ]
      }
    ]
  }
})
