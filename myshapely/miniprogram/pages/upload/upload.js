// miniprogram/pages/upload/upload.js
var categoryData = require('../../datas/categories.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    categoryChooserHidden:true,
    value:[0,0],
    categories:[],
    subCates:[],
    categoryChosen:{},
    subCateChosen:{},
    tmp1:{},
    tmp2:{},
    series:[],
    hasMore:true,
    pageIndex:1,
    pageSize:21
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  changeCategory:function(){
    this.setData({
      categoryChooserHidden: false
    })
  },

  categoryChooserBlur:function(){
    this.setData({
      categoryChooserHidden: true
    })
  },

  bindChange:function(e){
    const val = e.detail.value
    this.setData({
      subCates:this.data.categories[val[0]].subCates,
      tmp1: this.data.categories[val[0]],
      tmp2: this.data.categories[val[0]].subCates[val[1]]
    })
  },

  confirmCate:function(){
    this.setData({
      categoryChosen: this.data.tmp1,
      subCateChosen: this.data.tmp2,
      categoryChooserHidden: true
    })
    wx.showLoading({
      title: '加载中',
    })

    this.setData({
      pageIndex: 1
    })

    var that = this
    var filter = {
      category: this.data.tmp1.id,
      subCate: this.data.tmp2.id
    }
    wx.cloud.callFunction({
      name: "uploadSeries",
      data: {
        func: "pageRead",
        filter: filter,
        pageIndex: 1,
        pageSize: that.data.pageSize
      },
      success: res => {
        that.setData({
          series: res.result.data,
          pageIndex: 2,
          hasMore: res.result.hasMore
        })
        wx.hideLoading()
      }
    })
  },

  addClass:function(){
    var that = this
    wx.navigateTo({
      url: 'series/series?func=init&&category='+that.data.categoryChosen.id+"&&subCate="+that.data.subCateChosen.id,
    })

  },

  update:function(e){
    var index = e.currentTarget.dataset.index
    var entity = JSON.stringify(this.data.series[index])
    wx.navigateTo({
      url: 'series/series?func=update&&entity='+entity,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.setData({
      categories: categoryData.categories,
      subCates: categoryData.categories[0].subCates,
      categoryChosen: categoryData.categories[0],
      subCateChosen: categoryData.categories[0].subCates[0]
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.showLoading({
      title: '加载中',
    })

    this.setData({
      pageIndex:1
    })

    var that = this
    var filter = {
      category: this.data.categoryChosen.id,
      subCate: this.data.subCateChosen.id
    }
    wx.cloud.callFunction({
      name: "uploadSeries",
      data: {
        func: "pageRead",
        filter: filter,
        pageIndex: 1,
        pageSize: that.data.pageSize
      },
      success: res => {
        that.setData({
          series: res.result.data,
          pageIndex:2,
          hasMore:res.result.hasMore
        })
        wx.hideLoading()
      }
    })
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
    if(this.data.hasMore){
      wx.showLoading({
        title: '加载中',
      })

      var that = this
      var filter = {
        category: categoryData.categories[0].id,
        subCate: categoryData.categories[0].subCates[0].id
      }
      wx.cloud.callFunction({
        name: "uploadSeries",
        data: {
          func: "pageRead",
          filter: filter,
          pageIndex: that.data.pageIndex,
          pageSize: that.data.pageSize
        },
        success: res => {
          var seriesTmp = that.data.series
          seriesTmp = seriesTmp.concat(res.result.data)
          that.setData({
            series: seriesTmp,
            pageIndex: that.data.pageIndex + 1,
            hasMore:res.result.hasMore
          })
          wx.hideLoading()
        }
      })
    }
    else{
      wx.showToast({
        title: '没有更多了',
        icon:'none',
        duration:1500
      })
    }
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})