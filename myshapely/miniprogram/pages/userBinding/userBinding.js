// miniprogram/pages/userBinding/userBinding.js
const app = getApp()
const date = new Date()
const years = []
const months = []
const days = []

for (let i = 1900; i <= date.getFullYear(); i++) {
  years.push(i)
}

for (let i = 1; i <= 12; i++) {
  months.push(i)
}

for (let i = 1; i <= 31; i++) {
  days.push(i)
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    saving:false,
    title:"创建账户",
    name:"",
    select:0,
    changeName:0,
    warnName:0,
    birthday:"生日",
    chosenBirthday:0,
    birthdayHidden:true,
    years: years,
    year: date.getFullYear(),
    months: months,
    month: date.getMonth() + 1,
    days: days,
    day: date.getDate(),
    value: [9999, date.getMonth(), date.getDate()-1],
    phoneNumber: "",
    handNumberHidden:true,
    warnPhone:0,
    changePhone:0
  },

  save:function(){
    if(this.data.saving) {
      wx.showToast({
        title: '正在保存',
        icon:'none',
        duration:1500
      })
      return
    }
    if (this.data.name == "" || this.data.phoneNumber.length != 11||this.data.birthday=="生日"){
      wx.showToast({
        title: '请完善信息',
        icon:"none",
        duration:1500
      })
      return;
    }
    //做验证
    console.log(this.data.name,this.data.phoneNumber,this.data.birthday)
    const db = wx.cloud.database();
    var that = this
    if(!app.globalData.userInfo.bind){
      this.setData({
        saving:true
      })
      console.log("register")
      wx.showLoading({
        title: '绑定中...',
      })
      wx.cloud.callFunction({
        name: "register",
        data: {
          name: this.data.name,
          phoneNumber: this.data.phoneNumber,
          birthday: this.data.birthday,
          language: "zh_CN",
          method:"register"
        }, success: res => {
          console.log("用户绑定", res)
          wx.hideLoading()
          if (res.result.errMsg == "用户已绑定") {
            wx.showToast({
              title: '用户已绑定',
              icon: 'none',
              duration: 1500
            })
            that.setData({
              saving:false
            })
            return
          }
          if (res.result.errMsg == "collection.add:ok") {
            console.log("用户绑定成功")
            wx.showToast({
              title: '用户绑定成功',
              duration: 1500,
            })
            let pages = getCurrentPages()
            let prevPage = pages[pages.length - 2]
            const app = getApp();
            let userInfo = app.globalData.userInfo
            userInfo.name = this.data.name
            userInfo.phoneNumber = this.data.phoneNumber
            userInfo.birthday = this.data.birthday
            userInfo.bind = true
            userInfo.id = res.result._id
            app.globalData.userInfo = userInfo
            that.setData({
              saving:false
            })

            prevPage.setData({
              userInfo: userInfo
            })
            wx.navigateBack({
              delta: 1
            })
          }
        }, fail: err => {
          console.log(err)
          that.setData({
            saving: false
          })
        }
      })
    }
    else{
      this.setData({
        saving: true
      })
      console.log("update")
      wx.cloud.callFunction({
        name: "register",
        data: {
          name: this.data.name,
          phoneNumber: this.data.phoneNumber,
          birthday: this.data.birthday,
          language: "zh_CN",
          method:"update",
          _id:app.globalData.userInfo.id
        }, success: res => {
          console.log("用户信息修改", res)
          if (res.result.errMsg == "document.update:ok") {
            console.log("用户信息修改成功")
            that.setData({
              saving: false
            })
            wx.showToast({
              title: '修改成功',
              duration: 1500,
            })
            let pages = getCurrentPages()
            let prevPage = pages[pages.length - 2]
            const app = getApp();
            let userInfo = app.globalData.userInfo
            userInfo.name = this.data.name
            userInfo.phoneNumber = this.data.phoneNumber
            userInfo.birthday = this.data.birthday
            userInfo.bind = true
            app.globalData.userInfo = userInfo

            prevPage.setData({
              userInfo: userInfo
            })
          }
          else{
            //发送信息到控制台
            that.setData({
              saving: false
            })
            wx.showToast({
              title: '用户信息修改失败',
              icon:'none',
              duration: 1500,
            })
          }
        }, fail: err => {
          console.log(err)
          that.setData({
            saving: false
          })
        }
      })
    }
  },

  bindChange: function (e) {
    const val = e.detail.value
    this.setData({
      year: this.data.years[val[0]],
      month: this.data.months[val[1]],
      day: this.data.days[val[2]]
    })
  },

  getPhoneNumber(e){
    this.setData({
      handNumberHidden: false
    })
    console.log(wx.cloud.CloudID(e.detail.cloudID))
    wx.cloud.callFunction({
      
      name:'getPhone',
      data:{
        weRunData: wx.cloud.CloudID(e.detail.cloudID), // 这个 CloudID 值到云函数端会被替换
        obj: {
          shareInfo: wx.cloud.CloudID(e.detail.cloudID), // 非顶层字段的 CloudID 不会被替换，会原样字符串展示
        }
      }
    }).then(res=>{
      console.log("res",res)
      this.setData({
        phoneNumber: res.result.phoneNumber,
        changePhone: 1
      })
      wx.showToast({
        title: '手机号获取成功',
        duration: 1500,
        icon: 'none'
      })
      
      
    }).catch(err=>{
      console.log("手机号获取失败",err)
      wx.showToast({
        title: '手机号获取失败，请手动输入',
        duration: 2000,
        icon:'none'
      })
    })
  },

  focus1: function (e) {
    var index = e.currentTarget.dataset.index-'0';
    this.setData({
      select: index,
    })
  },

  blur1:function(e){
    this.setData({
      name:e.detail.value
    })
    if(this.data.changeName==0){
      this.setData({
        warnName : 1
      })
    }
    else{
      this.setData({
        warnName: 0
      })
    }
  },

  blur2:function(e){
    this.setData({
      phoneNumber: e.detail.value
    })
    if(this.data.phoneNumber.length!=11){
      this.setData({
        warnPhone:1
      })
    }
    else{
      this.setData({
        warnPhone:0
      })
    }
  },

  input1:function(e){
    if(e.detail.value == ""){
      this.setData({
        changeName:0,
      })
    }
    else{
      if(this.data.changeName==0){
        this.setData({
          changeName: 1,
        })
      }
    }
  },

  input2: function (e) {
    if (e.detail.value == "") {
      this.setData({
        changePhone: 0,
      })
    }
    else {
      if (this.data.changePhone == 0) {
        this.setData({
          changePhone: 1,
        })
      }
    }
  },

  focus2: function (e) {
    wx.hideKeyboard()
    var index = e.currentTarget.dataset.index - '0';
    this.setData({
      select: index,
      birthdayHidden:false
    })
  },

  birthdayBlur:function(e){
    this.setData({
      birthdayHidden:true,
    })
  },

  birthdayOk:function(){
    var birthday = ((this.data.year) + "") + "年 " + (this.data.month + "") + "月 " + (this.data.day + "") + "日"
    this.setData({
      birthdayHidden: true,
      birthday: birthday,
      chosenBirthday:1
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(app.globalData.userInfo.bind){
      let str = app.globalData.userInfo.birthday.split(' ')
      let value = this.data.value
      value = [parseInt(str[0].slice(0, -1)) - 1900, str[1].slice(0, -1) - 1, str[2].slice(0, -1) - 1]
      this.setData({
        year: str[0].slice(0, -1),
        month: str[1].slice(0, -1),
        day: str[2].slice(0, -1),
        value: value,
        name: app.globalData.userInfo.name,
        birthday: app.globalData.userInfo.birthday,
        phoneNumber: app.globalData.userInfo.phoneNumber,
        handNumberHidden: false,
        title: "个人信息"
      })
    }
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})