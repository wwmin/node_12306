var https = require('https');
var fs = require('fs');
var ca = fs.readFileSync('./cert/srca.cer.pem');
var nodemailer = require('nodemailer');
var schedule = require('node-schedule');
var options = {
  hostname: 'kyfw.12306.cn',
  path: '/otn/leftTicket/queryA?leftTicketDTO.train_date=2017-01-21&leftTicketDTO.from_station=SHH&leftTicketDTO.to_station=SRG&purpose_codes=ADULT',
  // rejectUnauthorized: false  // 忽略安全警告
  ca: [ca]
};

function queryTickets() {
  var req = https.get(options, function (res) {
    var data = '';
    var transporter = nodemailer.createTransport({
      hostname: "smtp.163.com",
      secureConnection: true,
      port: 465,
      auth: {
        user: "wwei.min@163.com",
        pass: 'wwm880720'
      }
    });
    res.on('data', function (buff) {
      data += buff;
      console.log(data);
    });
    res.on('end', function () {
      var jsonData = JSON.parse(data).data;
      for (var i = 0; i < jsonData.length; i++) {
        var cur = jsonData[i];
        if (cur.queryLeftNewDTO.station_train_code == 'K1209') {
          var yz = cur.queryLeftNewDTO.yz_num;
          var yw = cur.queryLeftNewDTO.yw_num;
          if (!isNaN(yz)) {
            console.log(yz);
            var mailOptions = {
              from: 'wwei.min@163.com', //发件地址
              to: 'wwei.min@163.com', //收件列表
              subject: '有硬座票啦,剩余' + yz + '张', //标题
              //text和html两者只支持一种
              text: '有硬座啦,剩余' + yz + '张' //内容
              //html:'<b>Hello world.</b>'//html内容
            };
            //send mail with define transport object
            transporter.sendMail(mailOptions, function (error, info) {
              if (error) {
                return console.log(error);
              }
              console.log('Message sent:' + info.response);
            })
          } else {
              console.log('硬座无票');
              log
          }
          if (!isNaN(yw)) {
            console.log(yw);
            yw = yw || '';
            var mailOptions = {
              from: 'wwei.min@163.com', //发件地址
              to: 'wwei.min@163.com', //收件列表
              subject: '有硬座票啦,剩余' + yz + '张', //标题
              //text和html两者只支持一种
              text: '有硬座啦,剩余' + yz + '张' //内容
              //html:'<b>Hello world.</b>'//html内容
            };
            transporter.sendMail(mailOptions, function (error, info) {
              if (error) {
                return console.log(error);
              }
              console.log('Message sent:' + info.response);
            });
          } else {
            console.log('硬卧无票');
          }
          break;
        }
      }
    })
  });
  req.on('error', function (err) {
    consol.error(err.code);
  });
}

var rule = new schedule.RecurrenceRule();
rule.second = [0,15,30,45];
schedule.scheduleJob(rule, function () {
  queryTickets();
  console.log('scheduleCronstyle:' + new Date());
})
