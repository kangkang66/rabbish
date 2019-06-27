//index.js
//获取应用实例
var Api = require('../../utils/api.js');

const backgroundAudioManager = wx.getBackgroundAudioManager()
backgroundAudioManager.epname = '此时此刻'
backgroundAudioManager.singer = '垃圾分类'
backgroundAudioManager.coverImgUrl = 'http://y.gtimg.cn/music/photo_new/T002R300x300M000003rsKF44GyaSk.jpg?max_age=2592000'

const recorderManager = wx.getRecorderManager()
const options = {
  duration: 60000,
  sampleRate: 16000,
  numberOfChannels: 1,
  encodeBitRate: 48000,
  format: 'mp3',
  frameSize: 50
}

Page({
  data: {
    hiddenModal:true,
    searchValue:"",
    audio:"",
    result:[],
    hotResult: [{"name":"卫生纸","type":"4"},{"name":"西瓜皮","type":"3"},{"name":"塑料瓶","type":"2"},{"name":"毒鼠强","type":"1"}]
  },
  onShareAppMessage(e){

  },
  onLoad: function () {
    //注册停止录音事件
    recorderManager.onStop(this.recorderStop);

    var openid = wx.getStorageSync("openid")
    if (openid !== "") {
      this.hotSearch()
      return
    }
    //登录
    var that = this
    wx.login({
      success (res) {
        //请求后端登录
        wx.request({
          url: Api.wxLogin({code: res.code}),
          success: function(res) {
            console.log(res.data)
            wx.setStorageSync("openid", res.data.openid)
            that.hotSearch()
          },
          fail(res) {
            wx.showToast({
              title:"服务器出错",
              icon:"none",
            })
          }
        })
      },
      fail(res) {
        console.log(res)
      }
    })
  },
  hotSearch(e) {
    //热门搜索
    var that = this
    wx.request({
      url:Api.hotSearch(),
      success(res) {
        that.setData({
          hotResult:res.data
        })
      }
    })
  },
  bindconfirm(e){
    if (e.detail.value==="" || e.detail.value===this.data.searchValue){
      return
    }
    wx.showToast({
      title:"搜索中...",
      icon:"loading"
    })
    var that = this
    wx.request({
      url: Api.search({"name":e.detail.value}),
      success(res) {
        that.setData({
          searchValue:e.detail.value,
          result:res.data
        })
        wx.hideToast()
      }
    })
  },
  showModal(e) {
    this.setData({
      hiddenModal: false
    })
    wx.setKeepScreenOn({
      keepScreenOn: true
    })
    recorderManager.start(options);
  },
  hideModalAndSearch(e) {
    this.setData({
      hiddenModal: true
    })
    wx.setKeepScreenOn({
      keepScreenOn: false
    })
    recorderManager.stop();
  },
  recorderStop(res){
    const {
      duration,
      tempFilePath
    } = res;

    // 不允许小于 1 秒
    if (duration < 1000) {
      wx.showToast({
        icon: 'none',
        title: '录音过短',
      })
      return;
    }

    wx.showToast({
      icon: 'loading',
      title: '语音识别中',
      mask:true,
      duration:5000
    })
    var that = this
    wx.uploadFile({
      url:Api.upload(),
      filePath: tempFilePath,
      name: 'file',
      header: {
        "Content-Type": "multipart/form-data"
      },
      success(response) {
        wx.hideToast()
        console.log("upload success",response.data)
        let datas = JSON.parse(response.data)
        if (datas.debug_message) {
          wx.showToast({
            title:"搜索失败:"+datas.debug_message,
            icon:"none"
          })
          return
        }

        backgroundAudioManager.title = datas.text
        backgroundAudioManager.src= Api.cache() + "/" + datas.ttsfile
        console.log(Api.cache() + "/" + datas.ttsfile)

        that.setData({
          searchValue:datas.text,
          audio:datas.ttsfile,
          result:datas.rabbish
        })
        console.log(that.data)
      },
      fail(res) {
        wx.hideToast()
        wx.showToast({
          icon: 'none',
          title: '没有听清楚，请再说一次',
        })
      }
    })
  }


})
