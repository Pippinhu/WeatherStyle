//index.js
const app = getApp();
const db = wx.cloud.database();

Page({
  data: {
    clothesList:[],
    now:0,
    feel:0,
    wind:0,
    humid:0
  },

  onLoad: function() {
    db.collection('style').get().then(res => {
      // res.data 包含该记录的数据
      console.log(res.data)
      this.setData({
              clothesList:res.data
            })
    })

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
        }
      }
    })
    this.getLocation()
  },

  //获取地理位置
  getLocation:function(){
    let that = this;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
      let latitude = res.latitude
      let longitude = res.longitude
      console.log(res.latitude);
      console.log(res.longitude);
      that.getWeatherInfo(latitude, longitude);
      }
    })
  },

  //获取天气信息
  getWeatherInfo: function (latitude, longitude){
    let _this = this;
    let key = '7c6e5f9000cb4ddba8a2f74c754c1fa5';
    let url = 'https://free-api.heweather.com/s6/weather?key='+key+'&location=' + longitude + ',' + latitude;
    wx.request({
      url: url, 
      data: {},
      method: 'GET',
      success: function (res) {

      //当下天气
      let weather_now = res.data.HeWeather6[0].now["tmp"];
      console.log(weather_now)
      //体感温度
      let weather_feel=res.data.HeWeather6[0].now["fl"];
      //风力
      let wind=res.data.HeWeather6[0].now["wind_sc"];
      //湿度
      let humid=res.data.HeWeather6[0].now["hum"];
      _this.setData({
        now:weather_now,
        feel:weather_feel,
        wind: wind,
        humid:humid,
    });
    },
    })
  },


  onGetUserInfo: function(e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  onGetOpenid: function() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        wx.navigateTo({
          url: '../userConsole/userConsole',
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  },
})
