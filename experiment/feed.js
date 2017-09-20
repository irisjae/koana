var images = {
    "russell westbrook": "http://images.performgroup.com/di/library/omnisport/43/51/russellwestbrook-cropped_11y0061xotckm1o8uqjp3tnvdo.jpg?t=-427411255",
    "stephen curry": "http://i.dailymail.co.uk/i/pix/2017/06/01/08/14849D9200000514-4558692-Stephen_Curry_has_become_one_of_basketball_s_most_illustrious_na-a-3_1496302266286.jpg",
    "mike conley": "https://thejumpballdotnet.files.wordpress.com/2017/01/mike-conley-nba-memphis-grizzlies-houston-rockets.jpg",
    "ricky rubio": "https://cdn.vox-cdn.com/thumbor/Gv2A87JwjFXVpf6asvg7WFZaobA=/0x0:684x458/1200x800/filters:focal(288x175:396x283)/cdn.vox-cdn.com/uploads/chorus_image/image/55534819/RickyRubioJazzUtah.0.jpg",
    "ish smith": "http://images.performgroup.com/di/library/omnisport/d8/71/smith-ish-usnews-getty-ftr_11h5e651maeyo1rfk70h3rschx.jpg?t=-1780015878&w=960&quality=70",
    "demar derozan": "https://www.thestar.com/content/dam/thestar/sports/raptors/2016/07/01/demar-derozan-was-never-going-to-leave-the-raptors/demar-derozan.jpg.size.custom.crop.1086x722.jpg",
    "klay thompson": "https://clutchpoints.com/wp-content/uploads/2017/05/klay-thompson.jpg",
    "bradley beal": "https://i.ytimg.com/vi/FRhuIWRgLNs/maxresdefault.jpg",
    "rodney hood": "https://cdn-s3.si.com/s3fs-public/styles/marquee_large_2x/public/2016/09/09/rodney_hood_top_100_.jpg?itok=ZnYDOzom",
    "gary harris": "https://cbsjimrome.files.wordpress.com/2016/07/gettyimages-511417262.jpg?w=594&h=360&crop=1",
    "lebron james": "https://fortunedotcom.files.wordpress.com/2017/03/wgl-2017-lebron-james.jpg?w=840&h=485&crop=1",
    "kevin durant": "https://heavyeditorial.files.wordpress.com/2017/02/gettyimages-630520660.jpg?quality=65&strip=all&w=780&strip=all",
    "jimmy butler": "https://i.ytimg.com/vi/db41u-xgEnk/maxresdefault.jpg",
    "andre roberson": "http://thunder.clutchpoints.com/wp-content/uploads/2015/01/hi-res-13fb27894591a259ebe592f88935c4de_crop_north.jpg",
    "kyle anderson": "http://img.bleacherreport.net/img/images/photos/003/143/113/hi-res-3abb802f80cd42d4a5ccbf3e900a2da4_crop_north.jpg?1415354238&w=630&h=420",
    "anthony davis": "https://clutchpoints.com/wp-content/uploads/2016/11/anthony-davis-1.jpg",
    "draymond green": "http://mobile.chinesedaily.com/uploads/caiji/14700688761872.jpg",
    "blake griffin": "http://thesource.com/wp-content/uploads/2016/02/la-sp-cn-blake-griffin-reveals-what-inspired-him-to-become-avid-reader-20151118.jpg",
    "kristaps porzingis": "http://static1.businessinsider.com/image/589ccb683149a1b6008b62c1/two-short-years-into-the-nba-kristaps-porzingis-is-learning-the-ropes-as-the-knicks-fall-apart-around-him.jpg",
    "trevor booker": "http://www.trevorbookerhoops.com/images/trevor_booker_brooklyn.jpg",
    "demarcus cousins": "https://s.yimg.com/ny/api/res/1.2/.mfSI5Xw1W7HtcRRYtH34w--/YXBwaWQ9aGlnaGxhbmRlcjtzbT0xO3c9ODAw/http://media.zenfs.com/en/homerun/feed_manager_auto_publish_494/3cc2b47a55f4d76e8cdd5821e6fe0186",
    "karl anthony towns": "http://www.opencourt-basketball.com/wp-content/uploads/2017/01/KAT.jpeg",
    "deandre jordan": "http://images.performgroup.com/di/library/sporting_news/83/c6/deandre-jordan-clippers-getty-ftr-012417_a1825nxlm22o1pd9lxdwm3hf8.jpg?t=-733620711&w=960&quality=70",
    "rudy gobert": "https://uproxx.files.wordpress.com/2017/02/rudy-gobert1.jpg?quality=100&w=650",
    "zaza pachulia": "http://images2.onionstatic.com/onion/5615/9/16x9/1200.jpg"
};

document .addEventListener("DOMContentLoaded", function () {
  var new_team = document .querySelector ('new-team');

  new_team .addEventListener ('click', function () {
    window .location .href = 'new.html';
  });

  var latest_date;

  var feed = new EventSource (window.location.protocol + '//' + window.location.hostname + ':3000/feed');
  var template = document .querySelector ('team[template]');
  feed .addEventListener ('posts', function (e) {
    JSON .parse (e .data) .forEach (function (post_info) {
      console .log (post_info);

      var post_date = new Date (post_info .time);
      if (! (latest_date && latest_date > post_date)) {
        latest_date = post_date;

        var post = template .cloneNode (true);
        post .removeAttribute ('template');

        post .querySelector('team > post > user') .textContent = post_info .user;
        post .querySelector ('team > post > players > position[pg] > player > img') .src = images [post_info .team ['point guard'] .player]
        post .querySelector ('team > post > players > position[sg] > player > img') .src = images [post_info .team ['shooting guard'] .player]
        post .querySelector ('team > post > players > position[sf] > player > img') .src = images [post_info .team ['small forward'] .player]
        post .querySelector ('team > post > players > position[pf] > player > img') .src = images [post_info .team ['power forward'] .player]
        post .querySelector ('team > post > players > position[c] > player > img') .src = images [post_info .team ['center'] .player]

        post .querySelector ('team > comment-section > post-comment > submit') .addEventListener ('click', function () {
          var comment = post .querySelector ('team > comment-section > post-comment > textarea') .value;
          fetch ('http://localhost:3000/x/comments/' + post_info .user + '/' + post_info .time, {
              method: 'POST',
              body: JSON .stringify ({
                session: localStorage .getItem ('session'),
                comment: comment
              }),
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
          });
        }, false);

        var comment_stream = new EventSource ('http://localhost:3000/comments/' + post_info .user + '/' + post_info .time);
        comment_stream .addEventListener ('comments', function (e) {
          var template = post .querySelector ('team > comment-section > comment[template]');
          var comments = JSON .parse (e .data);
          [] .forEach .call (post .querySelectorAll ('team > comment-section > comment:not([template])'), function (x) {
            x .outerHTML = '';
          });
          comments .forEach (function (x) {
            var comment = template .cloneNode (true);
            comment .removeAttribute ('template');
            comment .querySelector ('username') .textContent = x .user + ':';
            comment .querySelector ('item') .textContent = x .comment;
          });
        }, false);

        template .parentElement .insertBefore (post, template .nextElementSibling);
      }
    });
  }, false);
});
