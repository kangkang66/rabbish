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
    hotResult: [{"name":"卫生纸","type":"4"},{"name":"西瓜皮","type":"3"},{"name":"塑料瓶","type":"2"},{"name":"毒鼠强","type":"1"}],
    shareText: ["是什么垃圾？快进来瞅瞅",  "没想到是这种垃圾，千万别搞错了", "表示在座的和我都是这种垃圾", "是哪类垃圾？进来说话告诉你", "这浓眉大眼的东西竟是这种垃圾"]
  },
  onShareAppMessage(e){
    var openid = wx.getStorageSync("openid")
    if (openid === "") {
      return
    }
    var shareText = this.data.shareText
    var randNum = Math.floor(Math.random() * Math.floor(shareText.length))
    var text = "是什么垃圾？快进来瞅瞅"
    if (shareText[randNum]) {
      text = shareText[randNum]
    }

    if (this.data.searchValue === "") {
      text = "太牛了！没想到垃圾分类还能这么玩"
    }

    return {
      title: this.data.searchValue + text,
      path:'/pages/index/index?from_open_id='+ openid + "&search=" + this.data.searchValue, //这里拼接需要携带的参数
    }
  },
  onLoad: function (e) {
    //注册停止录音事件
    recorderManager.onStop(this.recorderStop);
    var openid = wx.getStorageSync("openid")
    if (openid !== "") {
      this.hotSearch()
      //检查接收转发携带参数
      if (e.search) {
        this.searchService({name:e.search})
      }
      return
    }
    wx.showToast({
      title:"登录中...",
      icon:"loading",
      duration:10000
    })
    //登录
    var that = this
    wx.login({
      success (res) {
        //参数
        var params = {code: res.code}
        if (e.from_open_id) {
          params["inviter"] = e.from_open_id
        }
        //请求后端登录
        wx.request({
          url: Api.wxLogin(params),
          success: function(res) {
            wx.hideToast()
            if (res.data.debug_message) {
              wx.showToast({
                title:"登录失败,快去反馈:" + res.data.debug_message,
                icon:"none",
                duration:3000
              })
              return
            }
            wx.setStorageSync("openid", res.data.openid)
            that.hotSearch()

            //检查接收转发携带参数
            if (e.search) {
              that.searchService({name:e.search})
            }
          },
          fail(res) {
            wx.hideToast()
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
  formSubmit(e) {
    console.log(e)
    var params = {
      name:e.detail.value.search,
      form_id:e.detail.formId
    }
    this.searchService(params)
  },
  bindconfirm(e) {
    console.log(e)
    var params = {
      name:e.detail.value
    }
    this.searchService(params)
  },
  searchService(params){
    if (params.name==="" || params.name===this.data.searchValue){
      return
    }
    wx.showToast({
      title:"搜索中...",
      icon:"loading"
    })
    var that = this
    wx.request({
      url: Api.search(params),
      success(res) {
        wx.hideToast()
        if (res.data.debug_message) {
          wx.showToast({
            title:"搜索失败,快去反馈:" + res.data.debug_message,
            icon:"none",
            duration:3000
          })
          return
        }
        if (res.data.length === 0) {
          wx.showToast({
            title:"没有搜到,换个名字再试试" ,
            icon:"none",
            duration:2000
          })
          return
        }

        that.setData({
          searchValue:params.name,
          result:res.data
        })
        wx.hideToast()
      }
    })
  },
  showModal(e) {
    wx.vibrateLong({
      success:function (res) {
        console.log(res)
      },
      fail:function (res) {
        console.log(res)
      }
    })
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
            title:"语音识别失败，文字输入搜索试试",
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
