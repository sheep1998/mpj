// miniprogram/pages/homepage/homepage.js

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    openCategory:false,
    openAccount:false,
    selectedCategory:0,
    toView:"cc",//所选大类
    sid:-1,//小类
    categories:[],
    userInfo:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      categories:app.globalData.categories,
    })
    
  },

  selectCategory:function(e){
    const index = e.currentTarget.dataset.index;
    let cid = 'c'+this.data.categories[index].id
    if ('c' +this.data.categories[index].id!=this.data.toView){
      this.setData({
        sid:-1
      })
    }
    this.setData({
      openCategory:!this.data.openCategory,
      toView:cid,
    })
    
  },

  closeBg:function(){
    this.setData({
      openCategory: false,
      openAccount:false
    })
  },

  catchClose:function(){},

  scrollToTop() {
    this.setAction({
      scrollTop: 0
    })
  },

  chooseCbtn:function(e){
    
    if(this.data.toView==e.currentTarget.id){
      this.setData({
        toView:"cc",
        sid:-1
      })
    }
    else{
      this.setData({
        toView:e.currentTarget.id,
        sid:-1
      })
    }
  },

  openCategory:function(){
    this.setData({
      openCategory: !this.data.openCategory,
      openAccount:false
    })
  },

  openAccount: function(){
    this.setData({
      openAccount: !this.data.openAccount,
      openCategory: false,
      userInfo:app.globalData.userInfo
    })
  },

  register:function(){
    wx.navigateTo({
      url: '../userBinding/userBinding',
    })
  },

  toContact:function(){
    wx.navigateTo({
      url: '../contact/contact',
    })
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