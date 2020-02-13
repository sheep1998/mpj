// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  switch (event.func) {
    /*case "add": {
      return create(event)
    }
    case "delete": {
      return del(event)
    }
    case "update": {
      return update(event)
    }
    case "updateProduct": {
      return updateProduct(event)
    }
    case "pageRead": {
      return pageRead(event)
    }*/
    case "delPic":{
      return delPic(event)
    }
    default: {
      return
    }
  }
}

async function delPic(event) {

  const result = await cloud.deleteFile({
    fileList: event.fileIDs,
  })
  return result.fileList
}