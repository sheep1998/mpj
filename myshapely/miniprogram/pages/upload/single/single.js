// miniprogram/pages/upload/single/single.js
var sizes = require('../../../datas/sizes.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    entity:{
      seriesId:"",
      category:"",
      subCate:"",
      code: "",
      name:"",
      introduction:"",
      colors:[],
      introImages:[],
      ingredient:[
        {
          title:"",
          content:""
        }
      ]
    },
    backup:{},
    init:false,
    addColorHidden:true,
    inputColorFocus:false,
    tmpColor:"",
    tmpStorage:{},
    colorIndex:0,
    shownColorImages:[],
    canDelColorImages:true,
    shownIntroImages:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var func = options.func
    if(func=='init'){
      var entity = this.data.entity
      entity.seriesId = options.seriesId
      entity.category = options.category
      entity.subCate = options.subCate
      var tmpStorage
      if(options.category==1&&options.subCate==1){
        tmpStorage=sizes.cup
      }
      else{
        tmpStorage=sizes.size
      }
      this.setData({
        entity:entity,
        tmpStorage:tmpStorage,
        init:true
      })
    }
    else if(func=='update'){
      var entity = JSON.parse(options.entity)
      var tmpStorage
      if (entity.category == 1 && entity.subCate == 1) {
        tmpStorage = sizes.cup
      }
      else {
        tmpStorage = sizes.size
      }
      for(var i=0;i<entity.colors.length;i++){
        var storages = JSON.parse(JSON.stringify(tmpStorage))
        for(var j=0;j<entity.colors[i].storages.length;j++){
          for(var k=0;k<storages.length;k++){
            if(entity.colors[i].storages[j].type==storages[k].type){
              storages[k].num = entity.colors[i].storages[j].num
              break;
            }
          }
        }
        entity.colors[i].storages = storages
      }
      console.log(entity)
      this.setData({
        entity:entity,
        shownColorImages:entity.colors[0].images,
        shownIntroImages:entity.introImages
      })
    }


  },

  inputCode: function (e) {
    var entity = this.data.entity
    entity.code = e.detail.value
    this.setData({
      entity: entity
    })
  },

  inputName:function(e){
    var entity = this.data.entity
    entity.name = e.detail.value
    this.setData({
      entity: entity
    })
  },

  inputIntro: function (e) {
    var entity = this.data.entity
    entity.introduction = e.detail.value
    this.setData({
      entity: entity
    })
  },

  addColor:function(){
    this.setData({
      addColorHidden:false,
      inputColorFocus:true
    })
  },

  cancelAddColor:function(){
    this.setData({
      addColorHidden:true,
      tmpColor:"",
      inputColorFocus:false
    })
  },

  inputColor:function(e){
    this.setData({
      tmpColor:e.detail.value
    })
  },

  confirmAddColor:function(){
    var entity = this.data.entity
    entity.colors.push({
      color:this.data.tmpColor,
      storages: JSON.parse(JSON.stringify(this.data.tmpStorage)),
      images:[]
    })
    this.setData({
      colorIndex: entity.colors.length-1,
      entity:entity,
      addColorHidden:true,
      tmpColor:"",
      inputColorFocus:false,
      shownColorImages:[]
    })
  },

  changeColor: function (e) {
    if (this.data.canDelColorImages == false) {
      wx.showToast({
        title: '图片正在上传，不可切换',
        icon: 'none',
        duration: 2000
      })
      return
    }
    var index = e.currentTarget.dataset.index
    this.setData({
      colorIndex: index
    })
    if(this.data.entity.colors[index].images==[]){
      this.setData({
        shownColorImages:[]
      })
    }
    else{
      var images = JSON.parse(JSON.stringify(this.data.entity.colors[index].images))
      this.setData({
        shownColorImages:images
      })
    }
  },

  delColor:function(e){
    var index = e.currentTarget.dataset.index
    let that = this
    wx.showModal({
      title: '提示',
      content: '删除 '+this.data.entity.colors[index].color,
      success: function (res) {
        if (res.confirm) {
          var entity = that.data.entity
          entity.colors.splice(index,1)
          that.setData({
            entity:entity,
            shownColorImages:[]
          })
        }
      }
    })
  },

  addColorImage: function (e) {
    var that = this
    wx.chooseImage({
      success: function (res) {
        var entity = that.data.entity
        var tmpImages = that.data.shownColorImages
        var tmplen = tmpImages.length

        let resImages = res.tempFilePaths
        let reslen = resImages.length

        if (reslen + tmplen > 3) {
          wx.showToast({
            title: '图片超过3张',
            duration: 1000,
            icon: 'none'
          })
        }

        var uploadImages = []
        for (var i = 0; i < 3 - tmplen && i < reslen; i++) {
          tmpImages.push(resImages[i])
          uploadImages.push(resImages[i])
        }

        that.setData({
          shownColorImages:tmpImages,
          canDelColorImages:false
        })

        Promise.all(uploadImages.map((item)=>{
          return wx.cloud.uploadFile({
            cloudPath: 'uploadImages/' + new Date().getTime() + /\.\w+$/.exec(item)[0],
            filePath:item
          })
        })).then((resCloud)=>{
          var images = entity.colors[that.data.colorIndex].images
          for(var i=0;i<resCloud.length;i++){            
            images.push(resCloud[i].fileID)
          }
          entity.colors[that.data.colorIndex].images = images
          that.setData({
            entity: entity,
            canDelColorImages:true
          })
          console.log("图片上传成功",entity)
        }).catch((err)=>{
          that.setData({
            canDelColorImages:true
          })
          console.log(err)
          wx.showToast({
            title: '图片上传失败',
            icon:'none',
            duration:1500
          })
        })
      },
    })
  },

  delColorImage:function(e){
    if (this.data.canDelColorImages==false){
      wx.showToast({
        title: '图片正在上传，不可删除',
        icon:'none',
        duration:2000
      })
      return
    }
    let index = e.currentTarget.dataset.index
    let that = this
    wx.showModal({
      title: '提示',
      content: '删除此图片',
      success: function (res) {
        if (res.confirm) {
          var entity = that.data.entity
          var shownColorImages = that.data.shownColorImages
          shownColorImages.splice(index, 1)
          that.setData({
            shownColorImages:shownColorImages
          })
          var fileID = entity.colors[that.data.colorIndex].images[index]
          wx.cloud.callFunction({
            name: "uploadSingle",
            data: {
              fileIDs: [fileID],
              func: "delPic"
            },
            success: res => {
              entity.colors[that.data.colorIndex].images.splice(index,1)
              that.setData({
                entity:entity
              })
            }
          })
        }
      }
    })
  },

  inputStorage:function(e){
    var index = e.currentTarget.dataset.index

    var entity = this.data.entity

    entity.colors[this.data.colorIndex].storages[index].num = parseInt(e.detail.value)

    this.setData({
      entity:entity
    })
  },

  addIntroImage: function (e) {
    var that = this
    wx.chooseImage({
      success: function (res) {
        var entity = that.data.entity
        var tmpImages = that.data.shownIntroImages
        var tmplen = tmpImages.length

        let resImages = res.tempFilePaths
        let reslen = resImages.length

        if (reslen + tmplen > 3) {
          wx.showToast({
            title: '图片超过3张',
            duration: 1000,
            icon: 'none'
          })
        }

        var uploadImages = []
        for (var i = 0; i < 3 - tmplen && i < reslen; i++) {
          tmpImages.push(resImages[i])
          uploadImages.push(resImages[i])
        }

        that.setData({
          shownIntroImages: tmpImages,
          canDelColorImages: false
        })

        Promise.all(uploadImages.map((item) => {
          return wx.cloud.uploadFile({
            cloudPath: 'uploadImages/' + new Date().getTime() + /\.\w+$/.exec(item)[0],
            filePath: item
          })
        })).then((resCloud) => {
          var images = entity.introImages
          for (var i = 0; i < resCloud.length; i++) {
            images.push(resCloud[i].fileID)
          }
          entity.introImages = images
          that.setData({
            entity: entity,
            canDelColorImages: true
          })
          console.log("图片上传成功", entity)
        }).catch((err) => {
          that.setData({
            canDelColorImages: true
          })
          console.log(err)
          wx.showToast({
            title: '图片上传失败',
            icon: 'none',
            duration: 1500
          })
        })
      },
    })
  },

  delIntroImage: function (e) {
    if (this.data.canDelColorImages == false) {
      wx.showToast({
        title: '图片正在上传，不可删除',
        icon: 'none',
        duration: 2000
      })
      return
    }
    let index = e.currentTarget.dataset.index
    let that = this
    wx.showModal({
      title: '提示',
      content: '删除此图片',
      success: function (res) {
        if (res.confirm) {
          var entity = that.data.entity
          var shownIntroImages = that.data.shownIntroImages
          shownIntroImages.splice(index, 1)
          that.setData({
            shownIntroImages: shownIntroImages
          })
          var fileID = entity.introImages[index]
          wx.cloud.callFunction({
            name: "uploadSingle",
            data: {
              fileIDs: [fileID],
              func: "delPic"
            },
            success: res => {
              entity.introImages.splice(index, 1)
              that.setData({
                entity: entity
              })
            }
          })
        }
      }
    })
  },

  inputIngredientTitle: function (e) {
    var index = e.currentTarget.dataset.index
    var entity = this.data.entity
    entity.ingredient[index].title = e.detail.value
    this.setData({
      entity: entity
    })
  },

  inputIngredientContent: function (e) {
    var index = e.currentTarget.dataset.index
    var entity = this.data.entity
    entity.ingredient[index].content = e.detail.value
    this.setData({
      entity: entity
    })
  },

  addIngredient: function (e) {
    var entity = this.data.entity
    entity.ingredient.splice(e.currentTarget.dataset.index + 1, 0, { title: "", content: "" })
    this.setData({
      entity: entity
    })
    this.pageScrollToBottom()
  },

  // 滚动到页面底部
  pageScrollToBottom: function () {
    console.log("滚动")
    let that = this;
    wx.createSelectorQuery().select('#container').boundingClientRect(function (rect) {
      console.log(rect)
      wx.pageScrollTo({
        scrollTop: rect.height,
        duration: 100
      })
    }).exec()
  },

  delIngredient: function (e) {
    var entity = this.data.entity
    entity.ingredient.splice(e.currentTarget.dataset.index, 1)
    if (entity.ingredient.length == 0) entity.ingredient=[{title:"",content:""}]
    this.setData({
      entity: entity
    })
  },

  save:function(){
    let entity = JSON.parse(JSON.stringify(this.data.entity))
    if(entity.name==""){
      wx.showToast({
        title: '请填写产品名称',
        icon: 'none'
      })
      return
    }
    if (entity.code == "") {
      wx.showToast({
        title: '请填写产品编号',
        icon: 'none'
      })
      return
    }
    if (entity.introduction == "") {
      wx.showToast({
        title: '请填写产品介绍',
        icon: 'none'
      })
      return
    }
    if(entity.colors.length == 0){
      wx.showToast({
        title: '请添加产品颜色',
        icon: 'none'
      })
      return
    }
    if (entity.introImages.length == 0) {
      wx.showToast({
        title: '请添加产品介绍图',
        icon: 'none'
      })
      return
    }
    else{
      var colors = []
      for(var i=0;i<entity.colors.length;i++){
        var color={}
        if(entity.colors[i].images.length==0){
          wx.showToast({
            title: '请完善颜色图片',
            icon: 'none'
          })
          return
        }
        var storages = []
        for(var j=0;j<entity.colors[i].storages.length;j++){
          if (entity.colors[i].storages[j].num != null && entity.colors[i].storages[j].num != "" && entity.colors[i].storages[j].num != 0 && entity.colors[i].storages[j].num != "0"){
            try{
              storages.push({ type: entity.colors[i].storages[j].type, num: parseInt(entity.colors[i].storages[j].num)})
            }catch(e){
              wx.showToast({
                title: '库存请填入数字',
                icon: 'none'
              })
              return
            }
          }
        }
        if(storages.length==0){
          wx.showToast({
            title: '请输入库存',
            icon: 'none'
          })
          return
        }
        color.color = entity.colors[i].color
        color.images = entity.colors[i].images
        color.storages = storages
        colors.push(color)
      }
      entity.colors = colors
      console.log("保存",entity)
      wx.showLoading({
        title: '保存中',
      })
      if(this.data.init){
        var that = this
        wx.cloud.callFunction({
          name: "uploadSingle",
          data: {
            entity: entity,
            func: "add"
          },
          success: res => {
            wx.hideLoading()
            console.log("add", res)
            entity._id = res.result._id
            that.setData({
              backup: that.data.entity
            })
            wx.showToast({
              title: '保存成功',
              icon:'none',
              duration:1500
            })
          }
        })
      }
      else{
        var that = this
        wx.cloud.callFunction({
          name: "uploadSingle",
          data: {
            entity: entity,
            func: "update"
          },
          success: res => {
            wx.hideLoading()
            that.setData({
              backup: that.data.entity
            })
            wx.showToast({
              title: '保存成功',
              icon: 'none',
              duration: 1500
            })
          }
        })
      }
    }

  },

  checkAndSave:function(){
    if (!this.data.canDelColorImages){
      var that=this
      var timer = 5
      var waiter = setInterval(function(){
        if(that.data.canDelColorImages){
          console.log("thats ok")
          that.save()
          clearInterval(waiter)
        }
        if(timer==0&&!that.data.canDelColorImages){
          wx.showToast({
            title: '上传图片失败，请检查网络状况',
            icon:'none',
            duration:1500
          })
          clearInterval(waiter)
        }
      },1500)
    }
    else{
      this.save()
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