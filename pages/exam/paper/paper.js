// pages/exam/paper/paper.js
var Api = require('../../../utils/api.js');

Page({
  data: {
    exam_id : 0,
    num: 1,
    question:[],
    user_answer: {},
    animation:"",
    score : {}
  },

  preSteps() {
    if (this.data.num <= 1) {
      return
    }
    this.setData({
      animation: "animation-scale-down"
    })
    var that = this;
    setTimeout(function() {
      that.setData({
        num: that.data.num - 1,
        animation: ''
      })
    }, 700)
  },
  nextSteps(e) {
    var max = this.data.question.length
    if (this.data.num >= max) {
      return
    }
    this.setData({
      animation: "animation-scale-up"
    })
    var that = this;
    setTimeout(function() {
      that.setData({
        num: that.data.num + 1,
        animation: ''
      })
    }, 700)
  },
  radioChange (e) {
    var userAnswer = this.data.user_answer
    userAnswer[e.target.dataset.questionId] = e.detail.value
    this.setData({
      user_answer:userAnswer
    })
    console.log(userAnswer)
  },
  formSubmit(e) {
    var params = {
      exam_id : parseInt(this.data.exam_id),
      user_answer: this.data.user_answer
    }
    var that = this
    wx.request({
      url:Api.submitExam(),
      method:"POST",
      data:params,
      success(res) {
        console.log(res)
        that.setData({
          score : res.data
        })
        wx.navigateTo({
          url:"/pages/exam/score/score"
        })
      }
    })
  },
  onLoad: function (options) {
    if (!options.exam_id) {
      wx.showToast({
        title:"缺少exam_id",
        icon:"none"
      })
      return
    }
    var that = this
    wx.request({
      url : Api.question({exam_id:options.exam_id}),
      success(res) {
        that.setData({
          exam_id : options.exam_id,
          question: res.data
        })
      }
    })
  },


  onShareAppMessage: function () {

  }
})