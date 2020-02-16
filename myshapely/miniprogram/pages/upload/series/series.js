// miniprogram/pages/upload/series/series.js
var cares = require('../../../datas/care.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showIndex:0,
    edit:false,
    firstEdit:false,
    widePic: "",
    longPic: "",
    widePicChange:false,
    longPicChange:false,
    tmpProducts:[],
    entity:{
      name:"",
      //原价，会员价，秒杀价
      prices: [{ price: '', show: false }, { price: '', show: false }, { price: '', show: false }],
      cares:[],
      match: [""],
      widePicUrl: "",
      longPicUrl: "",
      products:[],
      category:"",
      subCate:"",
      show:true
    },
    backup:{}, 
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let func = options.func
    var entity = this.data.entity
    entity.category = parseInt(options.category)
    entity.subCate = parseInt(options.subCate)
    var tmpCares = JSON.parse(JSON.stringify(cares.cares))
    
    if(func == 'init'){
      for(var i=0;i<tmpCares.length;i++){
        tmpCares[i].show = false
      }
      entity.cares = tmpCares
      this.setData({
        showIndex:1,
        edit:true,
        firstEdit:true,
        entity:entity
      })
    }
    else if(func== 'update'){
      var entity = JSON.parse(options.entity)
      var caree = entity.cares
      for(var i=0;i<caree.length;i++){
        for(var j=0;j<tmpCares.length;j++){
          if(caree[i]==tmpCares[j].id) tmpCares[j].show = true
        }
      }
      entity.cares = tmpCares
      if(entity.match.length==0)entity.match=[""]
      this.setData({
        showIndex:2,
        entity:entity,
        edit:true
      })
    }
  },

  switchCollapse:function(e){
    if (e.currentTarget.dataset.index != this.data.showIndex) {
      this.setData({
        showIndex: e.currentTarget.dataset.index
      })
    } else {
      this.setData({
        showIndex: 0
      })
    }
  },

  editOrSave:function(){
    //var edit = this.data.edit
    //this.setData({
    //  edit: !edit
    //})
    //if(!edit) return
    
    if (this.data.firstEdit) {
      this.firstSave()
      return
    }
    else{
      this.update()
      return
    }

    
  },

  firstSave:function(){
    let entity = this.data.entity
    if(entity.name==''){
      wx.showToast({
        title: '请填写系列名称',
        icon:'none'
      })
      return
    }
    var prices = entity.prices
    for(var i=0;i<prices.length;i++){
      if(prices[i].show&&prices[i].price==''){
        wx.showToast({
          title: '请完善价格',
          icon:'none'
        })
        return;
      }
    }
    if(this.data.longPic==''||this.data.widePic==''){
      wx.showToast({
        title: '请添加图片',
        icon:'none'
      })
      return;
    }

    var tmpCares = []
    var ecares = entity.cares
    for (var i = 0; i < ecares.length; i++) {
      if (ecares[i].show) tmpCares.push(ecares[i].id)
    }
    entity.cares = tmpCares
    
    let match = entity.match
    if (match.length == 1 && match[0] == '') match = []
    entity.match = match
    
    wx.showLoading({
      title: '保存中',
    })

    var that = this
    let promiseArr = []
    promiseArr.push(new Promise((reslove, reject) => {
      var widePicUrl = 'uploadImages/W' + new Date().getTime() + /\.\w+$/.exec(this.data.widePic)[0]
      wx.cloud.uploadFile({
        cloudPath: widePicUrl,
        filePath: this.data.widePic,
        success: res => {
          widePicUrl = res.fileID
          reslove()

          promiseArr.push(new Promise((reslove, reject) => {
            var longPicUrl = 'uploadImages/L' + new Date().getTime() + /\.\w+$/.exec(this.data.longPic)[0]
            wx.cloud.uploadFile({
              cloudPath: longPicUrl,
              filePath: this.data.longPic,
              success: res => {
                longPicUrl = res.fileID
                reslove()
                entity.widePicUrl = widePicUrl
                entity.longPicUrl = longPicUrl
                console.log("提交", entity)
                wx.cloud.callFunction({
                  name:"uploadSeries",
                  data:{
                    entity:entity,
                    func:"add"
                  },
                  success:res=>{
                    wx.hideLoading()
                    console.log("add",res)
                    entity._id = res.result._id
                    if(entity.match.length==0)entity.match=[""]
                    tmpCares = JSON.parse(JSON.stringify(cares.cares))
                    var caree = entity.cares
                    for (var i = 0; i < caree.length; i++) {
                      for (var j = 0; j < tmpCares.length; j++) {
                        if (caree[i] == tmpCares[j].id) tmpCares[j].show = true
                      }
                    }
                    entity.cares = tmpCares
                    that.setData({
                      entity:entity,
                      //edit:false,
                      firstEdit:false,
                      widePicChange:false,
                      longPicChange:false,
                      backup:entity
                    })
                    console.log("保存成功",this.data.entity)
                  }
                })
              }
            })
          }))

        }
      })
    }))
  },

  update:function(e){
    let entity = this.data.entity
    if (entity.name == '') {
      wx.showToast({
        title: '请填写系列名称',
        icon: 'none'
      })
      return
    }
    var prices = entity.prices
    for (var i = 0; i < prices.length; i++) {
      if (prices[i].show && prices[i].price == '') {
        wx.showToast({
          title: '请完善价格',
          icon: 'none'
        })
        return;
      }
    }

    var tmpCares = []
    var ecares = entity.cares
    for(var i=0;i<ecares.length;i++){
      if(ecares[i].show)tmpCares.push(ecares[i].id)
    }
    entity.cares = tmpCares

    let match = entity.match
    if (match.length == 1 && match[0] == '') match = []
    entity.match = match

    wx.showLoading({
      title: '保存中',
    })
    var that = this


    if(this.data.widePicChange){
      let promiseArr = []
      promiseArr.push(new Promise((reslove, reject) => {
        var widePicUrl = 'uploadImages/W' + new Date().getTime() + /\.\w+$/.exec(this.data.widePic)[0]
        wx.cloud.uploadFile({
          cloudPath: widePicUrl,
          filePath: that.data.widePic,
          success: res => {
            entity.widePicUrl = res.fileID 
            reslove()
            if(that.data.longPicChange){
              promiseArr.push(new Promise((reslove, reject) => {
                var longPicUrl = 'uploadImages/L' + new Date().getTime() + /\.\w+$/.exec(this.data.longPic)[0]
                wx.cloud.uploadFile({
                  cloudPath: longPicUrl,
                  filePath: that.data.longPic,
                  success: res => {
                    entity.longPicUrl = res.fileID
                    reslove()
                    if (entity.match.length == 0) entity.match = [""]
                    tmpCares = JSON.parse(JSON.stringify(cares.cares))
                    var caree = entity.cares
                    for (var i = 0; i < caree.length; i++) {
                      for (var j = 0; j < tmpCares.length; j++) {
                        if (caree[i] == tmpCares[j].id) tmpCares[j].show = true
                      }
                    }
                    entity.cares = tmpCares
                    wx.cloud.callFunction({
                      name: "uploadSeries",
                      data: {
                        entity: entity,
                        func: "update"
                      },
                      success: res => {
                        wx.hideLoading()
                        that.setData({
                          entity: entity,
                          //edit: false,
                          backup: entity,
                          widePicChange: false,
                          longPicChange: false
                        })
                        wx.hideLoading()
                        console.log("保存成功", that.data.entity)
                        return
                      }
                    })
                  }
                })
              }))
            }
            else{
              tmpCares = JSON.parse(JSON.stringify(cares.cares))
              var caree = entity.cares
              for (var i = 0; i < caree.length; i++) {
                for (var j = 0; j < tmpCares.length; j++) {
                  if (caree[i] == tmpCares[j].id) tmpCares[j].show = true
                }
              }
              entity.cares = tmpCares
              if (entity.match.length == 0) entity.match = [""]
              wx.cloud.callFunction({
                name: "uploadSeries",
                data: {
                  entity: entity,
                  func: "update"
                },
                success: res => {
                  wx.hideLoading()
                  that.setData({
                    entity: entity,
                    //edit: false,
                    backup: entity,
                    widePicChange: false,
                    longPicChange: false
                  })
                  wx.hideLoading()
                  console.log("保存成功", that.data.entity)
                  return
                }
              })
            }
          }
        })
      }))
    }
    else{
      if (this.data.longPicChange) {
        let promiseArr = []
        promiseArr.push(new Promise((reslove, reject) => {
          var longPicUrl = 'uploadImages/L' + new Date().getTime() + /\.\w+$/.exec(this.data.longPic)[0]
          wx.cloud.uploadFile({
            cloudPath: longPicUrl,
            filePath: that.data.longPic,
            success: res => {
              entity.longPicUrl = res.fileID
              reslove()
              tmpCares = JSON.parse(JSON.stringify(cares.cares))
              var caree = entity.cares
              for (var i = 0; i < caree.length; i++) {
                for (var j = 0; j < tmpCares.length; j++) {
                  if (caree[i] == tmpCares[j].id) tmpCares[j].show = true
                }
              }
              entity.cares = tmpCares
              if (entity.match.length == 0) entity.match = [""]
              wx.cloud.callFunction({
                name: "uploadSeries",
                data: {
                  entity: entity,
                  func: "update"
                },
                success: res => {
                  wx.hideLoading()
                  that.setData({
                    entity: entity,
                    //edit: false,
                    backup: entity,
                    widePicChange: false,
                    longPicChange: false
                  })
                  wx.hideLoading()
                  console.log("保存成功", that.data.entity)
                }
              })
            }
          })
        }))
      }
      else{
        tmpCares = JSON.parse(JSON.stringify(cares.cares))
        var caree = entity.cares
        for (var i = 0; i < caree.length; i++) {
          for (var j = 0; j < tmpCares.length; j++) {
            if (caree[i] == tmpCares[j].id) tmpCares[j].show = true
          }
        }
        entity.cares = tmpCares
        if (entity.match.length == 0) entity.match = [""]
        wx.cloud.callFunction({
          name: "uploadSeries",
          data: {
            entity: entity,
            func: "update"
          },
          success: res => {
            wx.hideLoading()
            that.setData({
              entity: entity,
              //edit: false,
              backup: entity,
              widePicChange: false,
              longPicChange: false
            })
            wx.hideLoading()
            console.log("保存成功", that.data.entity)
          }
        })
      }
    }

  },

  inputName:function(e){
    var entity = this.data.entity
    entity.name = e.detail.value
    this.setData({
      entity:entity
    })
  },

  inputPrice0:function(e){
    var entity = this.data.entity
    entity.prices[0].price = e.detail.value
    this.setData({
      entity:entity
    })
  },

  inputPrice1: function (e) {
    var entity = this.data.entity
    entity.prices[1].price = e.detail.value
    this.setData({
      entity: entity
    })
  },

  inputPrice2: function (e) {
    var entity = this.data.entity
    entity.prices[2].price = e.detail.value
    this.setData({
      entity: entity
    })
  },

  showPrice0:function(e){
    var entity = this.data.entity
    entity.prices[0].show = !entity.prices[0].show
    this.setData({
      entity: entity
    })
  },

  showPrice1: function (e) {
    var entity = this.data.entity
    entity.prices[1].show = !entity.prices[1].show
    this.setData({
      entity: entity
    })
  },

  showPrice2: function (e) {
    var entity = this.data.entity
    entity.prices[2].show = !entity.prices[2].show
    this.setData({
      entity: entity
    })
  },

  chooseCare:function(e){
    if (!this.data.edit) return
    var index = e.currentTarget.dataset.index
    var entity = this.data.entity
    entity.cares[index].show = !entity.cares[index].show
    this.setData({
      entity: entity
    })
  },

  inputMatch:function(e){
    var index = e.currentTarget.dataset.index
    var entity = this.data.entity
    entity.match[index] = e.detail.value
    this.setData({
      entity:entity
    })
  },

  addMatch:function(e){
    if (!this.data.edit) return
    var entity = this.data.entity
    entity.match.splice(e.currentTarget.dataset.index+1,0,"")
    this.setData({
      entity:entity
    })
  },

  delMatch:function(e){
    if (!this.data.edit) return
    var entity = this.data.entity
    entity.match.splice(e.currentTarget.dataset.index, 1)
    if(entity.match.length==0) entity.match.push("")
    this.setData({
      entity:entity
    })
  },

  addWidePic: function () {
    if(!this.data.edit) return
    var that = this
    wx.chooseImage({
      count: 1,
      sourceType: ['album'],
      success: function (res) {
        that.setData({
          widePic: res.tempFilePaths[0]
        })
        if (!that.data.firstEdit) {
          that.setData({
            widePicChange: true
          })
        }
      },
    })
  },

  changeWidePic:function(){
    if (!this.data.edit) return
    let that = this
    wx.showModal({
      title: '提示',
      content: '重新上传图片',
      success: function (res) {
        if (res.confirm) {
          that.addWidePic()
        }
        
      }
    })
  },

  addLongPic: function () {
    if (!this.data.edit) return
    var that = this
    wx.chooseImage({
      count: 1,
      sourceType: ['album'],
      success: function (res) {
        that.setData({
          longPic: res.tempFilePaths[0]
        })
        if (!that.data.firstEdit) {
          that.setData({
            longPicChange: true
          })
        }
      },
    })
  },

  changeLongPic: function () {
    if (!this.data.edit) return
    let that = this
    wx.showModal({
      title: '提示',
      content: '重新上传图片',
      success: function (res) {
        if (res.confirm) {
          that.addLongPic()
        }
      }
    })
  },

  changeShow:function(){
    if (!this.data.edit) return
    var entity = this.data.entity
    entity.show = !entity.show
    this.setData({
      entity:entity
    })
  },

  addProduct:function(){
    if(this.data.entity._id==null||this.data.entity._id==""){
      wx.showToast({
        title: '请先完善并保存基本信息',
        icon:'none',
        duration:1500
      })
      return
    }
    wx.navigateTo({
      url: '../single/single?func=init&&seriesId='+this.data.entity._id+"&&category="+this.data.entity.category+"&&subCate="+this.data.entity.subCate
    })
  },

  toSingle:function(e){
    var index = e.currentTarget.dataset.index
    var entity = JSON.stringify(this.data.tmpProducts[index])
    wx.navigateTo({
      url: '../single/single?func=update&&entity=' + entity,
    })
  },

  delSingle:function(e){
    var index = e.currentTarget.dataset.index
    var entity = this.data.entity
    var that = this
    wx.showModal({
      title: '提示',
      content: '删除产品' + that.data.tmpProducts[index].name,
      success: function (res) {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: "uploadSingle",
            data: {
              entity: {
                seriesId: entity._id,
                _id: that.data.tmpProducts[index]._id
              },
              func: "delete"
            },
            success: res => {
              that.setData({
                tmpProducts: res.result.products
              })

            }
          })
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
    if(this.data.firstEdit) return
    var entity={_id:this.data.entity._id}
    var that = this
    wx.cloud.callFunction({
      name: "uploadSingle",
      data: {
        entity: entity,
        func: "getProducts"
      },
      success: res => {
        that.setData({
          tmpProducts:res.result.products
        })
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})

