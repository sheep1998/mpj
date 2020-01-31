// miniprogram/pages/userBinding/userBinding.js
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
    name:"",
    select:0,
    changeName:0,
    warnName:0,
    birthday:"",
    chosenBirthday:0,
    birthdayHidden:true,
    years: years,
    year: date.getFullYear(),
    months: months,
    month: 2,
    days: days,
    day: 2,
    value: [9999, 1, 1],
    phoneNumber: "",
    handNumberHidden:true,
    warnPhone:0
  },

  save:function(){
    if (this.data.name == "" || this.data.phoneNumber.length != 11||this.data.birthday==""){
      wx.showToast({
        title: '请完善信息',
        icon:"none",
        duration:1500
      })
      return;
    }
    console.log(this.data.name,this.data.phoneNumber,this.data.birthday)
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
    console.log("点击获取数据",e)
    this.setData({
      handNumberHidden: false
    })
    wx.cloud.callFunction({
      name:'getPhone',
      data:{
        weRunData: wx.cloud.CloudID(e.detail.cloudID), // 这个 CloudID 值到云函数端会被替换
        obj: {
          shareInfo: wx.cloud.CloudID(e.detail.cloudID), // 非顶层字段的 CloudID 不会被替换，会原样字符串展示
        }
      }
    }).then(res=>{
      console.log("成功获取手机号")
      this.setData({
        phoneNumber: res.result.event.weRunData.data.phoneNumber
      })
      wx.showToast({
        title: '手机号获取成功',
        duration:2000,
        icon:'none'
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