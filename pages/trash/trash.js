var Api = require('../../utils/api.js');

Page({
  data: {
    latitude: 0,
    longitude: 0,
    hiddenAddForm:0,
    reportName:"",
    reportLatitude:0,
    reportLongitude:0,
    newTrashCanPoint:{id:0,latitude:0,longitude:0,name:""},
    markers: []
  },
  clickMapMarker(e){
    //点击已标记的点
    console.log("clickMapMarker",e)
    var id = e.detail.markerId
    if (id === 0) {
      return
    }
    var mark = null
    this.data.markers.forEach(function (value, index, array) {
      if(value.id === id) {
        mark = value
        return
      }
    })
    wx.openLocation({//使用微信内置地图查看位置。
      latitude: mark.latitude,//要去的纬度-地址
      longitude: mark.longitude,//要去的经度-地址
      name: mark.name,
      address: mark.name
    })
  },
  clickMap(e){
    console.log("clickMap",e)
    wx.showToast({
      title:"请点击垃圾桶附近带有名称的地点",
      icon:"none"
    })
  },
  clickMapPoitap(e){
    console.log("clickMapPoitap",e)
    //设置新的垃圾桶位置
    var newTrashCanPoint = {
      id: 0,
      latitude: e.detail.latitude,
      longitude: e.detail.longitude,
      name: e.detail.name,
    }
    var markers = this.data.markers
    if (markers.length > 0 && markers[markers.length - 1].id === 0 ) {
      markers[markers.length - 1] = newTrashCanPoint
    }else{
      markers.push(newTrashCanPoint)
    }
    this.setData({
      hiddenAddForm:1,
      newTrashCanPoint:newTrashCanPoint,
      markers: markers
    })
    console.log("newTrashCanPoint",newTrashCanPoint)
  },
  formSubmit(e){
    console.log(e)
    wx.showToast({
      title:"上报中...",
      icon:"loading"
    })
    var params = this.data.newTrashCanPoint
    params.form_id = e.detail.formId
    var that = this
    wx.request({
      url:Api.trashCan(),
      data:params,
      method:"POST",
      dataType:"json",
      success(res) {
        that.setData({
          hiddenAddForm:0
        })
        wx.hideToast()
      }
    })
  },
  regionchange(e){
    console.log("regionchange",e)
    if (e.type == 'end') {
      this.mapCtx.getCenterLocation({
        type: 'gcj02',
        success: (res) => {
          console.log("end",res)
          this.getTrashCan(res.longitude, res.latitude)
        }
      })
    }

  },
  onShareAppMessage(e){

  },
  onReady(e){
    this.mapCtx = wx.createMapContext('myMap')
  },
  onLoad: function (e) {
   var that = this
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        that.setData({
          longitude:res.longitude,
          latitude:res.latitude,
        })
        that.getTrashCan(res.longitude,res.latitude)
      }
    })

  },
  moveToLocation: function () {
    this.mapCtx.moveToLocation()
  },
  getTrashCan(longitude,latitude) {
    var that = this
    wx.request({
      url:Api.trashCan({longitude:longitude, latitude:latitude}),
      success(res) {
        that.setData({
          markers:res.data
        })
      },
      fail(res) {
        wx.showToast({
          title:"服务器请求失败",
          icon:"none"
        })
      }
    })
  }

})
