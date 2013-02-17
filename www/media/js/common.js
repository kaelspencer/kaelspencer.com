$(function(){
    $("#footer-to-top").click(function(){
        $("html, body").animate({ scrollTop: 0 }, 600);
        return false;
    });

    if ($('#gitlist').length != 0) {
        $.getJSON('https://api.github.com/users/kaelspencer/repos?type=all&callback=?', function(data) {
            var list = $('#gitlist');

            $.each(data.data, function(index, repo) {
                list = $('<li/>', {
                    'class': 'sublist',
                    html: '<a href="' + repo.html_url + '">' + repo.name + '</a>'
                }).insertAfter(list);
            });
        });
    }
});
