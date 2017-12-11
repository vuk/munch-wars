'use strict';
var socket;
(function () {
  if (!localStorage.getItem('side')) {
    localStorage.setItem('side', 'black');
  }
  if (!localStorage.getItem('muted')) {
    localStorage.setItem('muted', 'true');
  }
  var muted = localStorage.getItem('muted');
  var mutedBool;
  if (muted === 'true') {
    mutedBool = true;
  } else {
    mutedBool = false;
  }
  if (mutedBool) {
    $('.sound-off-wrapper').addClass('active');
    $('.sound-on-wrapper').removeClass('active');
  } else {
    $('.sound-on-wrapper').addClass('active');
    $('.sound-off-wrapper').removeClass('active');
  }
  var soundToggle = document.getElementById('toggle-sound');
  soundToggle.addEventListener('click', function (evt) {
    try {
      toggleSound();
    } catch (err) {
      console.debug(err);
    }
  });

})();

socket = io.connect();
socket.on('connected', function (data) {
  if (data.status) {
    socket.emit('identify', { id: userId });
  }
});

socket.on('respond_to_invite', function (data) {
  console.log('accept invite', data);
  localStorage.setItem('opponentSide', data.guestSide);
  if (data.player1.profile.PlayerId !== userId) {
    localStorage.setItem('opponentId', data.player1.profile.PlayerId);
    $('#accept_modal').modal();
    $('#opponent-rank').html('<img src="'+ getRankIcon(_.find(data.player1.stats.data.Statistics, { StatisticName: "Total Points"}).Value || 0) +'"/>');
    $('#opponent-name').html(data.profile.DisplayName);
    var daily = parseInt(data.ranks.daily.Position, 10) + 1;
    while (daily.toString().length < 5) {
      daily = '0' + daily;
    }
    var weekly = parseInt(data.ranks.daily.Position, 10) + 1;
    while (weekly.toString().length < 5) {
      weekly = '0' + weekly;
    }
    var total = parseInt(data.ranks.daily.Position, 10) + 1;
    while (total.toString().length < 5) {
      total = '0' + total;
    }
    $('#daily-rang').html(daily);
    $('#weekly-rang').html(weekly);
    $('#total-rang').html(total);
    $('.' + data.guestSide).show();
  }
  if (data.player2.profile.PlayerId !== userId) {
    localStorage.setItem('opponentId', data.player2.profile.PlayerId);
  }
});

$('#accept_invite').click(function () {
  $('#accept_modal').modal('hide');
  socket.emit('accept', {
    guest: localStorage.getItem('opponentId'),
    host: userId,
    guestSide: localStorage.getItem('opponentSide')
  });
  if (window.location.href.indexOf('play?') === -1) {
    window.location.href = '/play?game=' + userId + '&noevent=true';
  }
});

if (jQuery('#games').length > 0 && !noevent) {
  if (window.location.href.indexOf('?game=') === -1 && window.location.href.indexOf('?computer') === -1) {
    window.location.href = '/profile';
  } else if (window.location.href.indexOf('?game=') > -1) {
    socket.emit('invite', {
      host: opponent,
      guest: userId,
      guestProfile: profile,
      guestStats: stats,
      guestSide: localStorage.getItem('side')
    });
  }
}

if ($('.rank-row').length > 0) {
  var totalPoints = _.find(stats.data.Statistics, function (obj) {
    return obj.StatisticName === 'Total Points';
  });
  var weeklyPoints = _.find(stats.data.Statistics, function (obj) {
    return obj.StatisticName === 'Weekly Points';
  });
  var dailyPoints = _.find(stats.data.Statistics, function (obj) {
    return obj.StatisticName === 'Points';
  });
  var weeklyWins = _.find(stats.data.Statistics, function (obj) {
    return obj.StatisticName === 'Weekly Wins';
  });
  var dailyWins = _.find(stats.data.Statistics, function (obj) {
    return obj.StatisticName === 'Wins';
  });
  var monthlyWins = _.find(stats.data.Statistics, function (obj) {
    return obj.StatisticName === 'Total Wins';
  });
  var dp = dailyPoints ? dailyPoints.Value : 0;
  while (dp.toString().length < 5) {
    dp = '0' + dp;
  }
  var wp = weeklyPoints ? weeklyPoints.Value : 0;
  while (wp.toString().length < 5) {
    wp = '0' + wp;
  }
  var tp = totalPoints ? totalPoints.Value : 0;
  while (tp.toString().length < 5) {
    tp = '0' + tp;
  }
  var dr = parseInt(dailyRank.Position, 10) + 1;
  while (dr.toString().length < 5) {
    dr = '0' + dr;
  }
  var wr = parseInt(weeklyRank.Position, 10) + 1;
  while (wr.toString().length < 5) {
    wr = '0' + wr;
  }
  var tr = parseInt(totalRank.Position, 10) + 1;
  while (tr.toString().length < 5) {
    tr = '0' + tr;
  }
  var rank = getRankIcon(tp);

  $('.rank-badge img').attr('src', rank);
  $('.daily-pts .pts-score').html(dp);
  $('.weekly-pts .pts-score').html(wp);
  $('.total-pts .pts-score').html(tp);
  $('.daily-rank .pts-score').html(dr);
  $('.weekly-rank .pts-score').html(wr);
  $('.total-rank .pts-score').html(tr);
}

function getRankIcon () {
  if(tp <= 100) {
    rank = '/assets/ranks/1.png';
  }
  if (tp >= 101 && tp <= 200) {
    rank = '/assets/ranks/2.png';
  }
  if (tp >= 201 && tp <= 300) {
    rank = '/assets/ranks/3.png';
  }
  if (tp >= 301 && tp <= 400) {
    rank = '/assets/ranks/4.png';
  }
  if (tp >= 401 && tp <= 500) {
    rank = '/assets/ranks/5.png';
  }
  if (tp >= 501 && tp <= 600) {
    rank = '/assets/ranks/6.png';
  }
  if (tp > 600) {
    rank = '/assets/ranks/7.png';
  }
  return rank;
}

// Load opponents
if (jQuery('#opponents').length > 0) {
  $.get('/profile/actives', function (data) {
    for (var key in data) {
      if (key !== userId) {
        $('#opponents').append(
          '<div class="opponents-row opponents-head-row row"><a href="/play?game=' + data[key].profile.PlayerId + '">' +
          '    <div class="col-md-4 text-left">' + data[key].profile.DisplayName + '</div>' +
          '    <div class="col-md-8">' +
          '        <div class="row">' +
          '            <div class="col-md-2 borders">' + data[key].ranks.total.Position + '</div>' +
          '            <div class="col-md-2 borders">' + data[key].ranks.weekly.Position + '</div>' +
          '            <div class="col-md-2 borders">' + data[key].ranks.daily.Position + '</div>' +
          '            <div class="col-md-2 borders">' + data[key].ranks.total.StatValue + '</div>' +
          '            <div class="col-md-2 borders">' + data[key].ranks.weekly.StatValue + '</div>' +
          '            <div class="col-md-2 borders">' + data[key].ranks.daily.StatValue + '</div>' +
          '        </div>' +
          '    </div>' +
          '</a></div>'
        );
      }
    }
  });
}

if (jQuery('.search-users #name').length > 0) {
  jQuery('.search-users #name').on('change paste keyup', function () {
    if ($(this).val().length > 2) {
      $('#opponents').html('<div class="row opponents-row opponents-head-row">' +
        '                       <div class="col-md-4 text-left">nadimak</div>' +
        '                       <div class="col-md-8">' +
        '                           <div class="row">' +
        '                               <div class="col-md-2 borders">ukupni<br/>rang</div>' +
        '                               <div class="col-md-2 borders">nedeljni<br/>rang</div>' +
        '                               <div class="col-md-2 borders">dnevni<br/>rang</div>' +
        '                               <div class="col-md-2 borders">ukupno<br/>poena</div>' +
        '                               <div class="col-md-2 borders">nedeljnih<br/>poena</div>' +
        '                               <div class="col-md-2 borders">dnevnih<br/>poena</div>' +
        '                           </div>' +
        '                       </div>' +
        '                   </div>');
      $.get('/profile/actives?filter=' + $(this).val(), function (data) {
        for (var key in data) {
          if (key !== userId) {
            $('#opponents').append(
              '<div class="row opponents-row"><a href="/play?game=' + data[key].profile.PlayerId + '">' +
              '    <div class="col-md-4 text-left">' + data[key].profile.DisplayName + '</div>' +
              '    <div class="col-md-8">' +
              '        <div class="row">' +
              '            <div class="col-md-2 borders">' + data[key].ranks.total.Position + '</div>' +
              '            <div class="col-md-2 borders">' + data[key].ranks.weekly.Position + '</div>' +
              '            <div class="col-md-2 borders">' + data[key].ranks.daily.Position + '</div>' +
              '            <div class="col-md-2 borders">' + data[key].ranks.total.StatValue + '</div>' +
              '            <div class="col-md-2 borders">' + data[key].ranks.weekly.StatValue + '</div>' +
              '            <div class="col-md-2 borders">' + data[key].ranks.daily.StatValue + '</div>' +
              '        </div>' +
              '    </div>' +
              '</a></div>'
            );
          }
        }
      });
    }
  });
}

function setSelectedSide (side) {
  if(side === 'white') {
    $('#pickWhite .active').show();
    $('#pickWhite .inactive').hide();
    $('#pickBlack .inactive').show();
    $('#pickBlack .active').hide();
  } else if (side === 'black') {
    $('#pickWhite .active').hide();
    $('#pickWhite .inactive').show();
    $('#pickBlack .inactive').hide();
    $('#pickBlack .active').show();
  }
}

if ($('#pickWhite').length > 0) {
  var side = localStorage.getItem('side');
  setSelectedSide(side);
  $('#pickBlack').click(function () {
    localStorage.setItem('side', 'black');
    setSelectedSide('black');
  });
  $('#pickWhite').click(function () {
    localStorage.setItem('side', 'white');
    setSelectedSide('white');
  })
}

if (typeof computer !== 'undefined' && computer && $('#game-over').length > 0) {
  if (localStorage.getItem('side') === 'black') {
    $('#left-name, #left-name-go').html(profile.DisplayName);
    $('#right-name, #right-name-go').html('Computer');
  }
  if (localStorage.getItem('side') === 'white') {
    $('#left-name, #left-name-go').html('Computer');
    $('#right-name, #right-name-go').html(profile.DisplayName);
  }
}