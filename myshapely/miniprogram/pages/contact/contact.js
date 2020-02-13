// miniprogram/pages/contact/contact.js
var shops = require('../../datas/shops.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    shop:"",
    shopRecommanding:"如需至店领取，请您查看就近店铺，我们的员工将会为您提供量身配码的服务。",
    longitude:0,
    latitude:0
  },

  calculateNearest:function(latitude,longitude){
    var shopps = shops.shops
    var address = shopps[0].address
    var distance = Math.pow(shopps[0].longitude - longitude, 2) + Math.pow(shopps[0].latitude - latitude,2)
    for(var i=1;i<shopps.length;i++){
      var tmp = Math.pow(shopps[i].longitude - longitude, 2) + Math.pow(shopps[i].latitude - latitude, 2)
      if(tmp<distance){
        distance = tmp
        address = shopps[i].address
      }
    }
    this.setData({
      shop:address,
      shopRecommanding: address+"距离您最近。欢迎至店，我们的员工将会为您提供量身配码的服务。"
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    wx.getLocation({
      type: 'wgs84',
      success: function(res) {
        that.calculateNearest(res.latitude, res.longitude)
      },
    })

    setInterval(function(){
      wx.getLocation({
        type:'wgs84',
        success: function(res) {
          that.calculateNearest(res.latitude, res.longitude)
        },
      })
    },30000)
  },

  toLocation:function(){
    wx.navigateTo({
      url: '../location/location',
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var shopps = shops.shops
    for(var i=0;i<shopps.length;i++){
      if(shopps[i].wxContact=="") console.log(shopps[i].address)
    }
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