// miniprogram/pages/product/product.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    category:1,
    subCate:1,
    series: [],
    hasMore: true,
    pageIndex: 1,
    pageSize: 5,
    timeConsistence:"1223"//随意的一个数
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //console.log(options.category,options.subCate)
    this.initSeries(this.data.category,this.data.subCate)
  },

  initSeries:function(category,subCate){
    var that = this
    var filter = {
      category: this.data.category,
      subCate: this.data.subCate
    }
    wx.cloud.callFunction({
      name: "uploadSeries",
      data: {
        func: "getSeries",
        timeConsistence: that.data.timeConsistence,
        filter: filter,
        pageIndex: 1,
        pageSize: that.data.pageSize
      },
      success: res => {
        if (res.result.needFresh) {
          console.log(res.result.series[1])
          //整理series
          var series = res.result.series
          for(var i=0;i<series.length;i++){
            var one = series[i]
            var flexible = false
            var widePic = true
            var longPic = false//系列产品最后插入
            if(i==0){
              if(one.products.length==1)flexible = true
              else{
                if(one.products.length%2==1){
                  longPic = true
                }
              }
            }
            else{
              if(one.products.length==1){
                if(series[i-1].showType.flexible){
                  series[i-1].showType.widePic = false
                  widePic = false
                }
                else{
                  flexible = true
                }
              }
              else{
                if (one.products.length % 2 == 1) {
                  longPic = true
                }
              }
            }
            series[i].showType = {
              flexible:flexible,
              widePic:widePic,
              longPic:longPic
            }
          }
          console.log(series)

          that.setData({
            series: series,
            hasMore: res.result.hasMore,
            timeConsistence: res.result.timeConsistence
          })
          if (that.data.pageIndex == 1) {
            that.setData({
              pageIndex: 2
            })
          }
        }
      }
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