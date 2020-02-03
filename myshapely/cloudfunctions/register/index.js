// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()
  const wxContext = cloud.getWXContext()
  if(event.method=="register"){
    user = await db.collection('user').where({
      _openid: wxContext.OPENID
    }).get({
      success: function (res) {
        return res
      }
    })
    if (user.data.length != 0) {
      return {
        registerOk: false,
        errMsg: "用户已绑定"
      }
    }
    try {
      return await db.collection("user").add({
        data: {
          _openid: wxContext.OPENID,
          name: event.name,
          birthday: event.birthday,
          phoneNumber: event.phoneNumber,
          language: event.language
        }, success: function (res) {

        }
      })
    } catch (e) {
      console.log(e)
    }
  }
  if(event.method=="update"){
    try{
      return await db.collection("user").doc(event._id).update({
        data:{
          name: event.name,
          birthday: event.birthday,
          phoneNumber: event.phoneNumber,
        }
      })
    }catch(err){
      console.log(err)
    }
  }
}