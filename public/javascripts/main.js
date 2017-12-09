'use strict';
var socket;
(function () {

  var soundToggle = document.getElementById('toggle-sound');
  soundToggle.addEventListener('click', function (evt) {
    console.log('toggle sound');
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
    guest: userId,
    host: localStorage.getItem('opponentId'),
    guestSide: localStorage.getItem('side')
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
  $('.daily-pts .pts-score').html(dp);
  $('.weekly-pts .pts-score').html(wp);
  $('.total-pts .pts-score').html(tp);
  $('.daily-rank .pts-score').html(dr);
  $('.weekly-rank .pts-score').html(wr);
  $('.total-rank .pts-score').html(tr);
}

// Load opponents
if (jQuery('#opponents').length > 0) {
  $.get('/profile/actives', function (data) {
    for (var key in data) {
      if (key !== userId) {
        $('#opponents').append(
          '<div class="row opponent-row"><a href="/play?game=' + data[key].profile.PlayerId + '">' +
          '    <div class="col-md-4">' + data[key].profile.DisplayName + '</div>' +
          '    <div class="col-md-8">' +
          '        <div class="row">' +
          '            <div class="col-md-2">0</div>' +
          '            <div class="col-md-2">0</div>' +
          '            <div class="col-md-2">0</div>' +
          '            <div class="col-md-2">0</div>' +
          '            <div class="col-md-2">0</div>' +
          '            <div class="col-md-2">0</div>' +
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
      $('#opponents').html('<div class="row opponent-row--header">' +
        '                                <div class="col-md-4">nadimak</div>' +
        '                                <div class="col-md-8">' +
        '                                    <div class="row">' +
        '                                        <div class="col-md-2">ukupni<br/>rang</div>' +
        '                                        <div class="col-md-2">nedeljni<br/>rang</div>' +
        '                                        <div class="col-md-2">dnevni<br/>rang</div>' +
        '                                        <div class="col-md-2">ukupno<br/>poena</div>' +
        '                                        <div class="col-md-2">nedeljnih<br/>poena</div>' +
        '                                        <div class="col-md-2">dnevnih<br/>poena</div>' +
        '                                    </div>' +
        '                                </div>' +
        '                            </div>');
      $.get('/profile/actives?filter=' + $(this).val(), function (data) {
        for (var key in data) {
          if (key !== userId) {
            $('#opponents').append(
              '<div class="row opponent-row"><a href="/play?game=' + data[key].profile.PlayerId + '">' +
              '    <div class="col-md-4">' + data[key].profile.DisplayName + '</div>' +
              '    <div class="col-md-8">' +
              '        <div class="row">' +
              '            <div class="col-md-2">0</div>' +
              '            <div class="col-md-2">0</div>' +
              '            <div class="col-md-2">0</div>' +
              '            <div class="col-md-2">0</div>' +
              '            <div class="col-md-2">0</div>' +
              '            <div class="col-md-2">0</div>' +
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