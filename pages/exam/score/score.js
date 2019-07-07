// pages/exam/score/score.js

Page({

  data: {
    score: {"exam_id":1,"score":0,"question":[]}
  },

  onLoad: function (options) {
    var pages = getCurrentPages()
    var prvevPage = pages[pages.length-2]
    console.log(prvevPage.data.score)

    this.setData({
      score:prvevPage.data.score
    })
  },

  onShareAppMessage: function (e) {
      var openid = wx.getStorageSync("openid")
      return {
          title: "比一比？能比我拿更高的分数吗",
          path:'/pages/index/index?from_open_id='+ openid + "&exam_id=" + this.data.score.exam_id, //这里拼接需要携带的参数
      }
  }
})