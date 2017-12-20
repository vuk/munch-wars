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
    $('#opponent-rank').html('<img src="' + getRankIcon(_.find(data.player1.stats.data.Statistics, { StatisticName: 'Total Points' }) ? _.find(data.player1.stats.data.Statistics, { StatisticName: 'Total Points' }).Value : 0) + '"/>');
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
  } else {
    $('#invited_modal').modal();
    $('#challenger-rank').html('<img src="' + getRankIcon(_.find(data.player2.stats.data.Statistics, { StatisticName: 'Total Points' }) ? _.find(data.player2.stats.data.Statistics, { StatisticName: 'Total Points' }).Value : 0) + '"/>');
    $('#challenger-name').html(data.player2.profile.DisplayName);
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
    $('#challenger-daily-rang').html(daily);
    $('#challenger-weekly-rang').html(weekly);
    $('#challenger-total-rang').html(total);
    if (data.guestSide === 'white') {
      $('.black').show();
    } else {
      $('.white').show();
    }
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

function getRankIcon (tp) {
  var rank;
  if (tp <= 100) {
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
    var i = 0;
    for (var key in data) {
      if (key !== userId) {
        i++;
        $('#opponents').append(
          '<div class="opponents-row opponents-head-row row"><a href="/play?game=' + data[key].profile.PlayerId + '">' +
          '    <div class="col-md-4 col-xs-8 text-left"><img src="' + getRankIcon(data[key].ranks.total.Position) + '"><span>' + data[key].profile.DisplayName + '</span></div>' +
          '    <div class="col-md-8 col-xs-4">' +
          '        <div class="row">' +
          '            <div class="col-md-2 col-xs-12 borders">' + data[key].ranks.total.Position + '</div>' +
          '            <div class="col-md-2 borders hide-on-mobile">' + data[key].ranks.weekly.Position + '</div>' +
          '            <div class="col-md-2 borders hide-on-mobile">' + data[key].ranks.daily.Position + '</div>' +
          '            <div class="col-md-2 borders hide-on-mobile">' + data[key].ranks.total.StatValue + '</div>' +
          '            <div class="col-md-2 borders hide-on-mobile">' + data[key].ranks.weekly.StatValue + '</div>' +
          '            <div class="col-md-2 borders hide-on-mobile">' + data[key].ranks.daily.StatValue + '</div>' +
          '        </div>' +
          '    </div>' +
          '</a></div>'
        );
      }
    }
    if (i === 0) {
      $('#opponent-search-container').hide();
      $('#no-opponents').show();
    }
  });
}

if (jQuery('.search-users #name').length > 0) {
  jQuery('.search-users #name').on('change paste keyup', function () {
    if ($(this).val().length > 2) {
      var i = 0;
      $('#opponents').html('<div class="row opponents-row opponents-head-row">' +
        '                       <div class="col-md-4 col-xs-8 text-left">nadimak</div>' +
        '                       <div class="col-md-8 col-xs-4">' +
        '                           <div class="row">' +
        '                               <div class="col-md-2 col-xs-12 borders">ukupni<br/>rang</div>' +
        '                               <div class="col-md-2 borders hide-on-mobile">nedeljni<br/>rang</div>' +
        '                               <div class="col-md-2 borders hide-on-mobile">dnevni<br/>rang</div>' +
        '                               <div class="col-md-2 borders hide-on-mobile">ukupno<br/>poena</div>' +
        '                               <div class="col-md-2 borders hide-on-mobile">nedeljnih<br/>poena</div>' +
        '                               <div class="col-md-2 borders hide-on-mobile">dnevnih<br/>poena</div>' +
        '                           </div>' +
        '                       </div>' +
        '                   </div>');
      $.get('/profile/actives?filter=' + $(this).val(), function (data) {
        for (var key in data) {
          if (key !== userId) {
            i++;
            $('#opponents').append(
              '<div class="row opponents-row"><a href="/play?game=' + data[key].profile.PlayerId + '">' +
              '    <div class="col-md-4 col-xs-8 text-left"><img src="' + getRankIcon(data[key].ranks.total.Position) + '"><span>' + data[key].profile.DisplayName + '</span></div>' +
              '    <div class="col-md-8 col-xs-4">' +
              '        <div class="row">' +
              '            <div class="col-md-2 col-xs-12 borders">' + data[key].ranks.total.Position + '</div>' +
              '            <div class="col-md-2 borders hide-on-mobile">' + data[key].ranks.weekly.Position + '</div>' +
              '            <div class="col-md-2 borders hide-on-mobile">' + data[key].ranks.daily.Position + '</div>' +
              '            <div class="col-md-2 borders hide-on-mobile">' + data[key].ranks.total.StatValue + '</div>' +
              '            <div class="col-md-2 borders hide-on-mobile">' + data[key].ranks.weekly.StatValue + '</div>' +
              '            <div class="col-md-2 borders hide-on-mobile">' + data[key].ranks.daily.StatValue + '</div>' +
              '        </div>' +
              '    </div>' +
              '</a></div>'
            );
          }
        }
        if (i === 0) {
          $('#opponent-search-container').hide();
          $('#no-opponents').show();
        }
      });
    } else if ($(this).val().length === 0) {
      var i = 0;
      $('#opponents').html('<div class="row opponents-row opponents-head-row">' +
        '                       <div class="col-md-4 col-xs-8 text-left">nadimak</div>' +
        '                       <div class="col-md-8 col-xs-4">' +
        '                           <div class="row">' +
        '                               <div class="col-md-2 col-xs-12 borders">ukupni<br/>rang</div>' +
        '                               <div class="col-md-2 borders hide-on-mobile">nedeljni<br/>rang</div>' +
        '                               <div class="col-md-2 borders hide-on-mobile">dnevni<br/>rang</div>' +
        '                               <div class="col-md-2 borders hide-on-mobile">ukupno<br/>poena</div>' +
        '                               <div class="col-md-2 borders hide-on-mobile">nedeljnih<br/>poena</div>' +
        '                               <div class="col-md-2 borders hide-on-mobile">dnevnih<br/>poena</div>' +
        '                           </div>' +
        '                       </div>' +
        '                   </div>');
      $.get('/profile/actives', function (data) {
        for (var key in data) {
          if (key !== userId) {
            i++;
            $('#opponents').append(
              '<div class="row opponents-row"><a href="/play?game=' + data[key].profile.PlayerId + '">' +
              '    <div class="col-md-4 col-xs-8 text-left"><img src="' + getRankIcon(data[key].ranks.total.Position) + '"><span>' + data[key].profile.DisplayName + '</span></div>' +
              '    <div class="col-md-8 col-xs-4">' +
              '        <div class="row">' +
              '            <div class="col-md-2 col-xs-12 borders">' + data[key].ranks.total.Position + '</div>' +
              '            <div class="col-md-2 borders hide-on-mobile">' + data[key].ranks.weekly.Position + '</div>' +
              '            <div class="col-md-2 borders hide-on-mobile">' + data[key].ranks.daily.Position + '</div>' +
              '            <div class="col-md-2 borders hide-on-mobile">' + data[key].ranks.total.StatValue + '</div>' +
              '            <div class="col-md-2 borders hide-on-mobile">' + data[key].ranks.weekly.StatValue + '</div>' +
              '            <div class="col-md-2 borders hide-on-mobile">' + data[key].ranks.daily.StatValue + '</div>' +
              '        </div>' +
              '    </div>' +
              '</a></div>'
            );
          }
        }
        if (i === 0) {
          $('#opponent-search-container').hide();
          $('#no-opponents').show();
        }
      });
    }
  });
}

function setSelectedSide (side) {
  if (side === 'white') {
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
  });
}

if (typeof computer !== 'undefined' && computer && $('#game-over').length > 0) {
  if (localStorage.getItem('side') === 'black') {
    $('#left-name, #left-name-go').html(profile.DisplayName);
    $('#left-rank, #left-rank-go').html('<img src="' + getRankIcon(_.find(stats.data.Statistics, { StatisticName: 'Total Points' }) ? _.find(stats.data.Statistics, { StatisticName: 'Total Points' }).Value : 0) + '"/>');
    $('#right-name, #right-name-go').html('Computer');
    $('#right-rank, #right-rank-go').html('<img src="/assets/ranks/8.png"/>');
  }
  if (localStorage.getItem('side') === 'white') {
    $('#left-name, #left-name-go').html('Computer');
    $('#left-rank, #left-rank-go').html('<img src="/assets/ranks/8.png"/>');
    $('#right-rank, #right-rank-go').html('<img src="' + getRankIcon(_.find(stats.data.Statistics, { StatisticName: 'Total Points' }) ? _.find(stats.data.Statistics, { StatisticName: 'Total Points' }).Value : 0) + '"/>');
    $('#right-name, #right-name-go').html(profile.DisplayName);
  }
}

if ($('.fetch-rank-row').length > 0) {
  $('.fetch-rank-row').each(function (row) {
    var id = $(this).data('playerid');
    var self = this;
    $.get('/ranking/rankings?PlayFabId=' + id, function (data) {
      if (data.weekly) {
        data.weekly.Position = parseInt(data.weekly.Position, 10) + 1;
        while (data.weekly.Position.toString().length < 5) {
          data.weekly.Position = '0' + data.weekly.Position;
        }
        $(self).children().find('.weekly-rank').html(data.weekly.Position);
        while (data.weekly.StatValue.toString().length < 5) {
          data.weekly.StatValue = '0' + data.weekly.StatValue;
        }
        $(self).children().find('.weekly-points').html(data.weekly.StatValue);
      } else {
        $(self).children().find('.weekly-rank').html('00000');
        $(self).children().find('.weekly-points').html('00000');
      }
      if (data.daily) {
        data.daily.Position = parseInt(data.daily.Position, 10) + 1;
        while (data.daily.Position.toString().length < 5) {
          data.daily.Position = '0' + data.daily.Position;
        }
        $(self).children().find('.daily-rank').html(data.daily.Position);
        while (data.daily.StatValue.toString().length < 5) {
          data.daily.StatValue = '0' + data.daily.StatValue;
        }
        $(self).children().find('.daily-points').html(data.daily.StatValue);
      } else {
        $(self).children().find('.daily-rank').html('00000');
        $(self).children().find('.daily-points').html('00000');
      }
      if (data.total) {
        data.total.Position = parseInt(data.total.Position, 10) + 1;
        while (data.total.Position.toString().length < 5) {
          data.total.Position = '0' + data.total.Position;
        }
        $(self).children().find('.total-rank').html(data.total.Position);
        while (data.total.StatValue.toString().length < 5) {
          data.total.StatValue = '0' + data.total.StatValue;
        }
        $(self).children().find('.total-points').html(data.total.StatValue);
      } else {
        $(self).children().find('.total-rank').html('00000');
        $(self).children().find('.total-points').html('00000');
      }
    });
  });
}