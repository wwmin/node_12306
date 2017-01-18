var https = require('https');
var fs = require('fs');
var ca = fs.readFileSync('./cert/srca.cer.pem');
var nodemailer = require('nodemailer');
var schedule = require('node-schedule');
var options = {
  hostname: 'kyfw.12306.cn',
   path: '/otn/leftTicket/queryA?leftTicketDTO.train_date=2017-01-28&leftTicketDTO.from_station=SHH&leftTicketDTO.to_station=SRG&purpose_codes=ADULT',
    // rejectUnauthorized: false  // 忽略安全警告
    ca:[ca]
};
var yz_temp = '',
  yw_temp = '';

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
    });
    res.on('end', function () {
      var jsonData = JSON.parse(data).data;
      for (var i = 0; i < jsonData.length; i++) {
        var cur = jsonData[i];
        if (cur.queryLeftNewDTO.station_train_code == 'K1209') {
          var yz = cur.queryLeftNewDTO.yz_num;
          var yw = cur.queryLeftNewDTO.yw_num;
          var trainNum = cur.queryLeftNewDTO.station_train_code;
          console.log('硬座:', yz);
          console.log('硬卧:', yw);
          if (yz != '无' && yz != '--' || yw != '无' && yw != '--') {
            if (yw_temp == yw && yz_temp == yz) {
              console.log('状态没改变,不重复发邮件.');
              return;
            }
            var mailOptions = {
              from: 'wwei.min@163.com', //发件地址
              to: 'wwei.min@163.com', //收件列表
              subject: '有硬座票啦,剩余' + yz + '张,硬卧:' + yw + '张', //标题
              //text和html两者只支持一种
              text: trainNum + '有硬座啦,剩余' + yz + '张,硬卧:' + yw + '张' //内容
              //html:'<b>Hello world.</b>'//html内容
            };
            //send mail with define transport object
            transporter.sendMail(mailOptions, function (error, info) {
              if (error) {
                return console.log(error);
              }
              console.log('Message sent:' + info.response);
              yw_temp = yw;
              yz_temp = yz;
            })
          } else {
            console.log('硬座/硬卧无票');
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
rule.second = [0];
schedule.scheduleJob(rule, function () {
  queryTickets();
  console.log('scheduleCronstyle:' + new Date());
})
