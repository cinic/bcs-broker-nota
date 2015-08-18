//Так приятней :)
window.log = function(param){
    console.log(param);
};

$(function(){
  $('.nota .pseudo-link').on('click', function(e){
    e.preventDefault();
    $elem = $(this);
    href = $elem.data('href');
    $( href ).clone().appendTo( '#nota-popup' );
    $('#nota-popup').fadeIn(600, function(){
      $('#nota-popup .nota-item').fadeIn(400)
    });
    $('#nota-popup .close').on('click', function(e) {
      $('#nota-popup').hide().andSelf().html('');      
    })
  });
});