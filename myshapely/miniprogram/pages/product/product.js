// miniprogram/pages/product/product.js
var categoryData = require('../../datas/categories.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //产品分类页面数据
    row_scrollTop: 0,
    subCates:[],
    needChange:false,
    category:1,
    subCate:1,
    series: [],
    tmpSeries:[],
    hasMore: true,
    pageIndex: 1,
    pageSize: 5,
    timeConsistence:"424",//随意的一个数
    //菜单与用户
    openCategory: false,
    openAccount: false,
    selectedCategory: 0,
    toView: "cc",//所选大类
    cid: -1,
    sid: -1,//小类
    categories: [],
    userInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //console.log(options.category,options.subCate)
    //var category = options.category
    //var subCate = options.subCate
    for (var i = 0; i < categoryData.categories.length; i++) {
      if (this.data.category == categoryData.categories[i].id) {
        wx.setNavigationBarTitle({
          title: categoryData.categories[i].name
        })
        break
      }
    }
    this.setData({
      categories: categoryData.categories,
    })
    

    //this.initSeries(this.data.category,this.data.subCate)
  },

  selectSubCate:function(e){
    if (this.data.subCate != e.currentTarget.dataset.id){
      this.setData({
        subCate: e.currentTarget.dataset.id,
        row_scrollTop: e.currentTarget.dataset.index * 55 - 55 * 2,
        needChange: true,
        timeConsistence: "424",
        hasMore:true,
        pageIndex:1
      })
      this.initSeries(this.data.category, e.currentTarget.dataset.id)
    }
    
  },

  initSeries:function(category,subCate){
    for(var i=0;i<categoryData.categories.length;i++){
      if(category==categoryData.categories[i].id){
        this.setData({
          subCates: JSON.parse(JSON.stringify(categoryData.categories[i].subCates))
        })
        break
      }
    }
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
        if (res.result.needFresh||that.data.needChange) {
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

          var tmpSeries = []
          for (var i = 0; i < series.length; i++) {
            var uploadTime = new Date(series[i].uploadTime)
            var now = new Date()
            var day = parseInt((now.getTime()-uploadTime.getTime())/(1000*60*60*24))
            var title = []
            if(day<31) title.push("新品")
            var s = series[i]
            if(!s.showType.widePic){
              if(s.products[0].colors.length>1){
                title.push("+"+(s.products[0].colors.length-1)+"颜色")
              }
              tmpSeries.push({
                mode:"single",
                seriesIndex:i,
                singleIndex:0,
                title:title,
                name:s.name,
                pic:s.longPicUrl,
                prices:s.products[0].prices
              })
            }
            else{
              if(s.products.length==1){
                if (s.products[0].colors.length > 1) {
                  title.push("+" + (s.products[0].colors.length - 1) + "颜色")
                }
                tmpSeries.push({
                  mode:"series",
                  seriesIndex:i,
                  singleIndex:0,
                  title:title,
                  name:s.name,
                  pic:s.widePicUrl,
                  prices:s.products[0].prices
                })
              }
              else{
                tmpSeries.push({
                  mode: "series",
                  seriesIndex: i,
                  singleIndex: 0,
                  title: title,
                  name: s.name,
                  pic: s.widePicUrl,
                  prices: []
                })
                for (var j = 0; j < s.products.length; j++) {
                  //var t = JSON.parse(JSON.stringify(title))
                  var p = s.products[j]
                  tmpSeries.push({
                    mode: "single",
                    seriesIndex: i,
                    singleIndex: j,
                    title: title.concat(p.colors.length > 1 ? "+" + (p.colors.length - 1) + "颜色" : []),
                    name: p.name,
                    pic: p.colors[0].images[0],
                    prices: p.prices
                  })
                }
                if (s.showType.longPic) {
                  tmpSeries.push({
                    mode: "single",
                    seriesIndex: i,
                    singleIndex: 0,
                    title: [],
                    name: "",
                    pic: s.longPicUrl,
                    prices: []
                  })
                }
              }
            }
          }
          
          that.setData({
            needChange:false,
            series: series,
            tmpSeries:tmpSeries,
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

  selectCategory: function (e) {
    const index = e.currentTarget.dataset.index;
    let cid = this.data.categories[index].id
    if ('c' + this.data.categories[index].id != this.data.toView) {
      this.setData({
        sid: -1
      })
    }
    this.setData({
      openCategory: !this.data.openCategory,
      toView: 'c' + cid,
      cid: cid
    })

  },

  closeBg: function () {
    this.setData({
      openCategory: false,
      openAccount: false
    })
  },

  catchClose: function () { },

  scrollToTop() {
    this.setAction({
      scrollTop: 0
    })
  },

  chooseCbtn: function (e) {
    if (this.data.toView == e.currentTarget.id) {
      this.setData({
        toView: "cc",
        cid: -1,
        sid: -1
      })
    }
    else {
      this.setData({
        toView: e.currentTarget.id,
        cid: e.currentTarget.dataset.cid,
        sid: -1
      })
    }
  },

  toProductPage: function (e) {
    this.setData({
      sid: e.currentTarget.dataset.sid
    })
    for (var i = 0; i < categoryData.categories.length; i++) {
      if (this.data.cid == categoryData.categories[i].id) {
        wx.setNavigationBarTitle({
          title: categoryData.categories[i].name
        })
        break
      }
    }
    if (this.data.subCate != e.currentTarget.dataset.sid||this.data.category!=this.data.cid) {
      this.setData({
        subCate: e.currentTarget.dataset.sid,
        category:this.data.cid,
        row_scrollTop: e.currentTarget.dataset.sid * 55 - 55 * 3,
        needChange: true,
        timeConsistence: "424",
        hasMore: true,
        pageIndex: 1,
        openCategory:false
      })
      this.initSeries(this.data.category, e.currentTarget.dataset.id)
    }
  },

  openCategory: function () {
    this.setData({
      openCategory: !this.data.openCategory,
      openAccount: false
    })
  },

  openAccount: function () {
    this.setData({
      openAccount: !this.data.openAccount,
      openCategory: false,
      userInfo: app.globalData.userInfo
    })
  },

  register: function () {
    wx.navigateTo({
      url: '../userBinding/userBinding',
    })
  },

  toContact: function () {
    wx.navigateTo({
      url: '../contact/contact',
    })
  },

  uploadProduct: function () {
    wx.navigateTo({
      url: '../upload/upload',
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
    this.initSeries(this.data.category, this.data.subCate)
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
      this.addSeries(this.data.category,this.data.subCate)
    }
    else{
      wx.showToast({
        title: '更多商品，请光临门店',
        icon: 'none',
        duration: 1500
      })
    }
  },

  addSeries: function (category, subCate) {
    wx.showLoading({
      title: '加载中',
    })
    var that = this
    var filter = {
      category: this.data.category,
      subCate: this.data.subCate
    }
    var start = this.data.series.length
    wx.cloud.callFunction({
      name: "uploadSeries",
      data: {
        func: "getSeries",
        timeConsistence: "424",
        filter: filter,
        pageIndex: that.data.pageIndex,
        pageSize: that.data.pageSize
      },
      success: res => {
        if (res.result.needFresh) {
          //整理series
          var series = res.result.series
          for (var i = 0; i < series.length; i++) {
            var one = series[i]
            var flexible = false
            var widePic = true
            var longPic = false//系列产品最后插入
            if (i == 0) {
              if (one.products.length == 1) flexible = true
              else {
                if (one.products.length % 2 == 1) {
                  longPic = true
                }
              }
            }
            else {
              if (one.products.length == 1) {
                if (series[i - 1].showType.flexible) {
                  series[i - 1].showType.widePic = false
                  widePic = false
                }
                else {
                  flexible = true
                }
              }
              else {
                if (one.products.length % 2 == 1) {
                  longPic = true
                }
              }
            }
            series[i].showType = {
              flexible: flexible,
              widePic: widePic,
              longPic: longPic
            }
          }

          var tmpSeries = that.data.tmpSeries
          for (var i = 0; i < series.length; i++) {
            var uploadTime = new Date(series[i].uploadTime)
            var now = new Date()
            var day = parseInt((now.getTime() - uploadTime.getTime()) / (1000 * 60 * 60 * 24))
            var title = []
            if (day < 31) title.push("新品")
            var s = series[i]
            if (!s.showType.widePic) {
              if (s.products[0].colors.length > 1) {
                title.push("+" + (s.products[0].colors.length - 1) + "颜色")
              }
              tmpSeries.push({
                mode: "single",
                seriesIndex: start+i,
                singleIndex: 0,
                title: title,
                name: s.name,
                pic: s.longPicUrl,
                prices: s.products[0].prices
              })
            }
            else {
              if (s.products.length == 1) {
                if (s.products[0].colors.length > 1) {
                  title.push("+" + (s.products[0].colors.length - 1) + "颜色")
                }
                tmpSeries.push({
                  mode: "series",
                  seriesIndex: start+i,
                  singleIndex: 0,
                  title: title,
                  name: s.name,
                  pic: s.widePicUrl,
                  prices: s.products[0].prices
                })
              }
              else {
                tmpSeries.push({
                  mode: "series",
                  seriesIndex: start+i,
                  singleIndex: 0,
                  title: title,
                  name: s.name,
                  pic: s.widePicUrl,
                  prices: []
                })
                for (var j = 0; j < s.products.length; j++) {
                  //var t = JSON.parse(JSON.stringify(title))
                  var p = s.products[j]
                  tmpSeries.push({
                    mode: "single",
                    seriesIndex: start+i,
                    singleIndex: j,
                    title: title.concat(p.colors.length > 1 ? "+" + (p.colors.length - 1) + "颜色" : []),
                    name: p.name,
                    pic: p.colors[0].images[0],
                    prices: p.prices
                  })
                }
                if (s.showType.longPic) {
                  tmpSeries.push({
                    mode: "single",
                    seriesIndex: start+i,
                    singleIndex: 0,
                    title: [],
                    name: "",
                    pic: s.longPicUrl,
                    prices: []
                  })
                }
              }
            }
          }

          that.setData({
            series: that.data.series.concat(series),
            tmpSeries: tmpSeries,
            hasMore: res.result.hasMore,
            timeConsistence: res.result.timeConsistence,
            pageIndex:that.data.pageIndex+1
          })
          wx.hideLoading()
        }
      }
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})