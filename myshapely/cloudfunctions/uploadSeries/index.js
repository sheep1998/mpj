// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  switch(event.func){
    case "add":{
      return create(event)
    }
    case "delete":{
      return del(event)
    }
    case "update":{
      return update(event)
    }
    case "updateProduct":{
      return updateProduct(event)
    }
    case "pageRead":{
      return pageRead(event)
    }
    default: {
      return
    }
  }
}

async function create(event){
  const db = cloud.database()
  var entity = event.entity
  entity.uploadTime = db.serverDate()
  try{
    return await db.collection("series").add({
      data: entity,
      success: function (res) {
        return res.data
      }
    })
  }catch(e){
    console.log(e)
  }
}

async function pageRead(event){
  const db = cloud.database()
  var filter = event.filter?event.filter:null
  var pageIndex = event.pageIndex?event.pageIndex:1
  var pageSize = event.pageSize? event.pageSize:10
  const countResult = await db.collection("series").where(filter).count()
  console.log(countResult)
  const total = countResult.total
  const totalPage = Math.ceil(total/pageSize)
  var hasMore
  if(pageIndex>totalPage ||pageIndex==totalPage){
    hasMore = false
  }else{
    hasMore = true
  }
  return db.collection("series").where(filter).orderBy('uploadTime','desc').skip((pageIndex-1)*pageSize).limit(pageSize).get().then(res=>{
    res.hasMore = hasMore
    return res
  })
}

async function update(event){
  var entity = event.entity
  var _id = entity._id
  delete entity._id
  const db = cloud.database()
  entity.uploadTime = db.serverDate()

  try{
    var series = await db.collection("series").doc(_id).get({
      success:function(res){
        return res.data
      }
    })
    var files = []
    if(series.data.widePicUrl!=event.entity.widePicUrl){
      files.push(series.data.widePicUrl)
    }
    if (series.data.longPicUrl != event.entity.longPicUrl) {
      files.push(series.data.longPicUrl)
    }
    delPic(files)

    return await db.collection("series").doc(_id).update({
      data: entity,
      success: function (res) { return res.data }
    })
  } catch (e) {
    console.log(e)
  }
}

async function updateProduct(event){
  var entity = event.entity
  var _id = entity._id
  const db = cloud.database()
  try {
    return await db.collection("series").doc(_id).update({
      data: {
        products:entity.products,
        uploadTime: db.serverDate()
      },
      success: function (res) { 
        return res.data
      }
    })
  } catch (e) {
    console.log(e)
  }
}

async function del(event){
  const db = cloud.database()
  try{
    let user = await db.collection("series").doc(event.entity._id).get({
      success: function (res) {
        return res.data
      }
    })
    

    return await db.collection("series").doc(event.entity._id).remove({
      success:function(res){}
    })
  }catch(e){
    console.log(e)
  }
}

async function delPic(fileIDs){
  const result = await cloud.deleteFile({
    fileList: fileIDs,
  })
  return result.fileList
}