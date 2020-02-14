// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  switch (event.func) {
    case "add": {
      return create(event)
    }
    case "delete": {
      return del(event)
    }
    case "update": {
      return update(event)
    }
    case "read": {
      return read(event)
    }
    case "getProducts":{
      return getProducts(event)
    }
    default: {
      return
    }
  }
}

async function create(event) {
  const db = cloud.database()
  var entity = event.entity
  entity.uploadTime = db.serverDate()

  try {
    var seriesRes = await db.collection("series").doc(event.entity.seriesId).get({
      success: function (res) {
        return res.data
      }
    })

    var products = seriesRes.data.products
    
    var single = await db.collection("single").add({
      data: entity,
      success: function (res) {
        return res.data
      }
    })

    products.push(single._id)

    await db.collection("series").doc(event.entity.seriesId).update({
      data: {
        uploadTime: db.serverDate(),
        products:products
      },
      success: function (res) {
        return res.data
      }
    })

    return single
  } catch (e) {
    console.log(e)
  }
}

async function read(event) {
  const db = cloud.database()
  return db.collection("single").doc(event._id).get({
    success:function(res){
      return res.data
    }
  })
}

async function update(event) {
  var entity = event.entity
  var _id = entity._id
  delete entity._id
  const db = cloud.database()
  entity.uploadTime = db.serverDate()

  try {
    var updatedSingle = await db.collection("single").doc(_id).update({
      data: entity,
      success: function (res) { return res.data }
    })
    var series = await db.collection("series").doc(entity.seriesId).get({
      success: function (res) {
        return res.data
      }
    })
    series.uploadTime = db.serverDate()
    await db.collection("series").doc(entity.seriesId).update({
      data: series,
      success: function (res) { return res.data }
    })
    return updatedSingle


  } catch (e) {
    console.log(e)
  }
}


async function del(event) {
  const db = cloud.database()
  try {
    var seriesRes = await db.collection("series").doc(event.entity.seriesId).get({
      success: function (res) {
        return res.data
      }
    })

    var products = seriesRes.data.products
    for (var i = 0; i < products.length; i++) {
      if (products[i] == event.entity._id) {
        products.splice(i, 1)
      }
    }

    await db.collection("series").doc(event.entity.seriesId).update({
      data: {
        products: products
      },
      success: function (res) {
        return res.data
      }
    })

    var singleRes = await db.collection("single").doc(event.entity._id).get({
      success: function (res) {
        return res.data
      }
    })

    var fileIDs = []
    var single = singleRes.data
    for (var i = 0; i < single.introImages.length; i++) {
      fileIDs.push(single.introImages[i])
    }
    for (var i = 0; i < single.colors.length; i++) {
      for (var j = 0; j < single.colors[i].images.length; j++) {
        fileIDs.push(single.colors[i].images[j])
      }
    }
    console.log(fileIDs)
    if(fileIDs.length>0){
      await cloud.deleteFile({
        fileList: fileIDs,
      })
    }

    await db.collection("single").doc(event.entity._id).remove({
      success: function (res) { }
    })

    return getProducts({
      entity:{
        _id: event.entity.seriesId
      }
    })

  } catch (e) {
    console.log(e)
  }
}

async function getProducts(event){
  const db = cloud.database()
  var seriesRes = await db.collection("series").doc(event.entity._id).get({
    success: function (res) {
      return res.data
    }
  })

  var products = seriesRes.data.products
  var res = []
  
  for(var i=0;i<products.length;i++){
    var product = await db.collection("single").doc(products[i]).get({
      success: function (res) {
        return res.data
      }
    })
    res.push(product.data)
  }
  return{
    products:res
  }
}

async function delPic(event) {

  const result = await cloud.deleteFile({
    fileList: event.fileIDs,
  })
  return result.fileList
}