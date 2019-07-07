// pages/exam/exam.js
var Api = require('../../utils/api.js');

Page({
  data: {
    exam : []
  },
  onLoad: function (options) {
    var that = this
    wx.request({
      url:Api.exam(),
      success(res) {
        that.setData({
          exam : res.data
        })
      }
    })

  },
  onShareAppMessage: function (e) {
    console.log(e)
    var openid = wx.getStorageSync("openid")
    return {
      title: "你的朋友在寻求帮助，快来帮他",
      path:'/pages/index/index?from_open_id='+ openid + "&exam_id=" + e.target.dataset.examId, //这里拼接需要携带的参数
    }
  },
  rank (e) {
    wx.reportAnalytics('rank_button', {
      click: 1,
    });
  }
})